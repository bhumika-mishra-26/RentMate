import {
  sendInterest,
  getOwnerInterests,
  getTenantInterests,
  updateInterestStatus,
  checkInterestExists,
} from "../services/interest.service.js";

export const handleSendInterest = async (req, res) => {
  try {
    const interest = await sendInterest(req.user.id, req.params.listingId);
    res.status(201).json({ success: true, message: "Interest sent", data: interest });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const handleGetOwnerInterests = async (req, res) => {
  try {
    const interests = await getOwnerInterests(req.user.id);
    res.status(200).json({ success: true, data: interests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetTenantInterests = async (req, res) => {
  try {
    const interests = await getTenantInterests(req.user.id);
    res.status(200).json({ success: true, data: interests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleUpdateInterestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const interest = await updateInterestStatus(req.params.id, req.user.id, status);
    res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}`, data: interest });
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const handleCheckInterest = async (req, res) => {
  try {
    const existing = await checkInterestExists(req.user.id, req.params.listingId);
    res.status(200).json({ success: true, data: { exists: !!existing, interest: existing } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
