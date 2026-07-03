import {
  createListing,
  getOwnerListings,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../services/listing.service.js";

export const handleCreateListing = async (req, res) => {
  try {
    const listing = await createListing(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Listing created", data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleGetOwnerListings = async (req, res) => {
  try {
    const listings = await getOwnerListings(req.user.id);
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetAllListings = async (req, res) => {
  try {
    const { location, maxRent, minRent, roomType, furnishingStatus, keyword, sortBy } = req.query;
    const listings = await getAllListings({ location, maxRent, minRent, roomType, furnishingStatus, keyword, sortBy });
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const handleGetListingById = async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    const status = error.message === "Listing not found" ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const handleUpdateListing = async (req, res) => {
  try {
    const listing = await updateListing(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: "Listing updated", data: listing });
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const handleDeleteListing = async (req, res) => {
  try {
    const result = await deleteListing(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
