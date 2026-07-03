import { uploadListingPhoto } from "../services/upload.service.js";

export const handleUploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ success: false, message: "listingId is required" });
    }

    const photo = await uploadListingPhoto(req.file.buffer, listingId);
    res.status(201).json({ success: true, message: "Photo uploaded", data: photo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
