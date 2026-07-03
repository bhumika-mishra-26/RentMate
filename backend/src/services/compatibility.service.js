import prisma from "../config/prisma.js";
import axios from "axios";

/**
 * Rule-engine budget + location scoring (returns score 0-100 and explanation).
 */
const runRuleEngine = (tenantProfile, listing) => {
  const rent = listing.rent;
  const { minBudget, maxBudget } = tenantProfile;

  // --- Budget Match (60 points) ---
  let budgetScore = 0;
  let budgetExplanation = "";

  if (rent >= minBudget && rent <= maxBudget) {
    budgetScore = 60;
    budgetExplanation = `The rent (₹${rent.toLocaleString()}) perfectly matches your budget range of ₹${minBudget.toLocaleString()}–₹${maxBudget.toLocaleString()}.`;
  } else if (rent > maxBudget) {
    const deviation = (rent - maxBudget) / maxBudget;
    if (deviation <= 0.5) {
      budgetScore = Math.max(0, Math.round(60 * (1 - deviation)));
      budgetExplanation = `The rent (₹${rent.toLocaleString()}) is ₹${(rent - maxBudget).toLocaleString()} above your maximum budget.`;
    } else {
      budgetScore = 0;
      budgetExplanation = `The rent (₹${rent.toLocaleString()}) significantly exceeds your maximum budget of ₹${maxBudget.toLocaleString()}.`;
    }
  } else {
    const deviation = (minBudget - rent) / minBudget;
    budgetScore = deviation <= 0.5 ? Math.max(0, Math.round(60 * (1 - deviation))) : 60;
    budgetExplanation =
      deviation <= 0.5
        ? `The rent (₹${rent.toLocaleString()}) is slightly below your minimum preference.`
        : `The rent is exceptionally affordable at ₹${rent.toLocaleString()}.`;
  }

  // --- Location Match (40 points) ---
  let locationScore = 0;
  let locationExplanation = "";
  const listingLoc = listing.location.toLowerCase().trim();
  const tenantLoc = tenantProfile.preferredLocation.toLowerCase().trim();

  if (
    listingLoc === tenantLoc ||
    listingLoc.includes(tenantLoc) ||
    tenantLoc.includes(listingLoc)
  ) {
    locationScore = 40;
    locationExplanation = `Location matches your preferred area "${tenantProfile.preferredLocation}" perfectly.`;
  } else {
    const listWords = listingLoc.split(/[\s,]+/);
    const tenantWords = tenantLoc.split(/[\s,]+/);
    const overlap = listWords.some((w) => w.length >= 3 && tenantWords.includes(w));
    if (overlap) {
      locationScore = 25;
      locationExplanation = `The listing is in a nearby area to your preferred location "${tenantProfile.preferredLocation}".`;
    } else {
      locationScore = 0;
      locationExplanation = `The listing location "${listing.location}" differs from your preferred area "${tenantProfile.preferredLocation}".`;
    }
  }

  return {
    score: budgetScore + locationScore,
    explanation: `${budgetExplanation} ${locationExplanation}`.trim(),
  };
};

/**
 * Use Gemini to generate a human-friendly compatibility explanation.
 * Falls back to rule-engine explanation if Gemini is unavailable.
 */
const getGeminiExplanation = async (tenantProfile, listing, ruleScore) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") return null;

  const prompt = `You are an AI assistant for a room rental platform in India.
Analyze the compatibility between this tenant and listing and write a concise, friendly 2-3 sentence explanation of the match.

Tenant Profile:
- Preferred Location: ${tenantProfile.preferredLocation}
- Budget Range: ₹${tenantProfile.minBudget.toLocaleString()} – ₹${tenantProfile.maxBudget.toLocaleString()}/month
- Move-in Date: ${new Date(tenantProfile.moveInDate).toLocaleDateString("en-IN")}

Listing Details:
- Title: ${listing.title}
- Location: ${listing.location}
- Rent: ₹${listing.rent.toLocaleString()}/month
- Room Type: ${listing.roomType}
- Furnishing: ${listing.furnishingStatus}
- Available From: ${new Date(listing.availableFrom).toLocaleDateString("en-IN")}

Compatibility Score: ${ruleScore}/100

Write the explanation from the perspective of the platform, addressing the tenant directly. Keep it under 60 words. Be honest if the match is poor.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
      },
      { timeout: 8000 }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (err) {
    console.warn("Gemini API call failed, using rule-engine explanation:", err.message);
    return null;
  }
};

export const calculateOrGetScore = async (tenantId, listingId) => {
  // Fetch tenant profile
  const tenantProfile = await prisma.tenantProfile.findUnique({
    where: { userId: tenantId },
  });

  if (!tenantProfile) {
    throw new Error(
      "Tenant profile not set up yet. Cannot calculate compatibility score."
    );
  }

  // Check cache
  const existingScore = await prisma.compatibilityScore.findFirst({
    where: { tenantId: tenantProfile.id, listingId },
  });
  if (existingScore) return existingScore;

  // Fetch listing
  const listing = await prisma.roomListing.findUnique({
    where: { id: listingId },
  });
  if (!listing) throw new Error("Listing not found");

  // Run rule engine
  const { score, explanation: ruleExplanation } = runRuleEngine(tenantProfile, listing);

  // Try Gemini for a richer explanation
  const geminiExplanation = await getGeminiExplanation(tenantProfile, listing, score);
  const finalExplanation = geminiExplanation || ruleExplanation;

  // Persist to DB
  const scoreObj = await prisma.compatibilityScore.create({
    data: {
      score,
      explanation: finalExplanation,
      tenantId: tenantProfile.id,
      listingId,
    },
  });

  return scoreObj;
};
