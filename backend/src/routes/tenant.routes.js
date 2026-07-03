import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeTenant } from "../middlewares/role.middleware.js";
import { handleUpsertProfile, handleGetProfile } from "../controllers/tenant.controller.js";

const router = express.Router();

// Get own tenant profile
router.get("/profile", authenticate, authorizeTenant, handleGetProfile);

// Create or update tenant profile
router.post("/profile", authenticate, authorizeTenant, handleUpsertProfile);

export default router;
