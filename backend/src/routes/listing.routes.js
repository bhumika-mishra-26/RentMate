import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeOwner } from "../middlewares/role.middleware.js";
import {
  handleCreateListing,
  handleGetOwnerListings,
  handleGetAllListings,
  handleGetListingById,
  handleUpdateListing,
  handleDeleteListing,
} from "../controllers/listing.controller.js";

const router = express.Router();

// Public browse (authenticated any role)
router.get("/", authenticate, handleGetAllListings);

// Owner's own listings
router.get("/my", authenticate, authorizeOwner, handleGetOwnerListings);

// Single listing detail (authenticated any role)
router.get("/:id", authenticate, handleGetListingById);

// Create (OWNER only)
router.post("/", authenticate, authorizeOwner, handleCreateListing);

// Update (OWNER only)
router.put("/:id", authenticate, authorizeOwner, handleUpdateListing);

// Delete (OWNER only)
router.delete("/:id", authenticate, authorizeOwner, handleDeleteListing);

export default router;
