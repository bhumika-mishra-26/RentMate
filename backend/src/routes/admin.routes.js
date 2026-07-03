import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/role.middleware.js";
import {
  handleGetAdminStats,
  handleGetAdminUsers,
  handleToggleUserDisabled,
  handleAdminDeleteUser,
  handleGetAdminListings,
  handleAdminDeleteListing,
  handleAdminMarkListingFilled,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Require both authentication and ADMIN role for all routes here
router.use(authenticate, authorizeAdmin);

// Dashboard statistics
router.get("/stats", handleGetAdminStats);

// Users management
router.get("/users", handleGetAdminUsers);
router.patch("/user/:id/toggle", handleToggleUserDisabled);
router.delete("/user/:id", handleAdminDeleteUser);

// Listings management
router.get("/listings", handleGetAdminListings);
router.patch("/listing/:id/fill", handleAdminMarkListingFilled);
router.delete("/listing/:id", handleAdminDeleteListing);

export default router;
