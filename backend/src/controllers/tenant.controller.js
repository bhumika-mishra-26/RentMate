import { upsertProfile, getTenantProfile } from "../services/tenant.service.js";

export const handleUpsertProfile = async (req, res) => {
  try {
    const profile = await upsertProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: "Profile saved", data: profile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleGetProfile = async (req, res) => {
  try {
    const profile = await getTenantProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
