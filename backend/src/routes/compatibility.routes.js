import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeTenant } from "../middlewares/role.middleware.js";
import { handleGetCompatibilityScore } from "../controllers/compatibility.controller.js";

const router = express.Router();

// Get or calculate score for a room listing
router.get("/:listingId", authenticate, authorizeTenant, handleGetCompatibilityScore);

export default router;
