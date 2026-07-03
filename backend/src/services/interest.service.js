import prisma from "../config/prisma.js";
import { calculateOrGetScore } from "./compatibility.service.js";
import { sendInterestEmail, sendAcceptEmail, sendRejectEmail } from "./email.service.js";

export const sendInterest = async (tenantId, listingId) => {
  // Get the listing to find the owner
  const listing = await prisma.roomListing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, status: true, title: true },
  });

  if (!listing) throw new Error("Listing not found");
  if (listing.status !== "AVAILABLE") throw new Error("This listing is no longer available");
  if (listing.ownerId === tenantId) throw new Error("You cannot express interest in your own listing");

  // Check for duplicate
  const existing = await prisma.interestRequest.findFirst({
    where: { tenantId, listingId },
  });
  if (existing) throw new Error("You have already expressed interest in this listing");

  const interest = await prisma.interestRequest.create({
    data: {
      tenantId,
      ownerId: listing.ownerId,
      listingId,
      status: "PENDING",
    },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
      owner: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  // Calculate compatibility score
  let compatibilityScore = 0;
  try {
    const scoreObj = await calculateOrGetScore(tenantId, listingId);
    compatibilityScore = scoreObj.score;
  } catch (err) {
    console.warn("Could not calculate compatibility score for email:", err.message);
  }

  // Only notify owner if score is noteworthy (> 80) — reduces noise
  if (compatibilityScore > 80) {
    sendInterestEmail({
      ownerEmail: interest.owner.email,
      ownerName: interest.owner.name,
      tenantName: interest.tenant.name,
      tenantEmail: interest.tenant.email,
      tenantPhone: interest.tenant.phone,
      listingTitle: interest.listing.title,
      compatibilityScore,
    });
  }

  return interest;
};


export const getOwnerInterests = async (ownerId) => {
  const interests = await prisma.interestRequest.findMany({
    where: { ownerId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          tenantProfile: {
            select: {
              id: true,
              preferredLocation: true,
              minBudget: true,
              maxBudget: true,
              moveInDate: true,
            }
          }
        }
      },
      listing: { select: { id: true, title: true, location: true, rent: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach compatibility score to each interest request
  const interestsWithScores = await Promise.all(
    interests.map(async (interest) => {
      let score = null;
      if (interest.tenant.tenantProfile) {
        const scoreObj = await prisma.compatibilityScore.findFirst({
          where: {
            tenantId: interest.tenant.tenantProfile.id,
            listingId: interest.listingId,
          },
        });
        score = scoreObj ? scoreObj.score : null;
      }
      return {
        ...interest,
        compatibilityScore: score,
      };
    })
  );

  return interestsWithScores;
};

export const getTenantInterests = async (tenantId) => {
  const interests = await prisma.interestRequest.findMany({
    where: { tenantId },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach compatibility score for tenants too
  const tenantProfile = await prisma.tenantProfile.findUnique({
    where: { userId: tenantId },
  });

  if (!tenantProfile) return interests;

  const interestsWithScores = await Promise.all(
    interests.map(async (interest) => {
      const scoreObj = await prisma.compatibilityScore.findFirst({
        where: {
          tenantId: tenantProfile.id,
          listingId: interest.listingId,
        },
      });
      return {
        ...interest,
        compatibilityScore: scoreObj ? scoreObj.score : null,
      };
    })
  );

  return interestsWithScores;
};

export const updateInterestStatus = async (id, ownerId, status) => {
  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    throw new Error("Status must be ACCEPTED or REJECTED");
  }

  const interest = await prisma.interestRequest.findUnique({
    where: { id },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      owner: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
    },
  });
  
  if (!interest) throw new Error("Interest request not found");
  if (interest.ownerId !== ownerId) throw new Error("Not authorized to update this request");
  if (interest.status !== "PENDING") throw new Error("This request has already been processed");

  const updated = await prisma.interestRequest.update({
    where: { id },
    data: { status },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      owner: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
    },
  });

  // Trigger Accept/Reject transactional emails
  if (status === "ACCEPTED") {
    sendAcceptEmail({
      tenantEmail: updated.tenant.email,
      tenantName: updated.tenant.name,
      ownerName: updated.owner.name,
      ownerEmail: updated.owner.email,
      ownerPhone: updated.owner.phone,
      listingTitle: updated.listing.title,
    });
  } else {
    sendRejectEmail({
      tenantEmail: updated.tenant.email,
      tenantName: updated.tenant.name,
      listingTitle: updated.listing.title,
    });
  }

  return updated;
};

export const checkInterestExists = async (tenantId, listingId) => {
  const existing = await prisma.interestRequest.findFirst({
    where: { tenantId, listingId },
  });
  return existing;
};
