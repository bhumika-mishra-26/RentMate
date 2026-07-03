import { calculateOrGetScore } from "../services/compatibility.service.js";

export const handleGetCompatibilityScore = async (req, res) => {
  try {
    const scoreData = await calculateOrGetScore(req.user.id, req.params.listingId);
    res.status(200).json({ success: true, data: scoreData });
  } catch (error) {
    const status = error.message.includes("Tenant profile") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
