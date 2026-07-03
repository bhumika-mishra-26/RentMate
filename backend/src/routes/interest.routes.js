import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeOwner, authorizeTenant } from "../middlewares/role.middleware.js";
import {
  handleSendInterest,
  handleGetOwnerInterests,
  handleGetTenantInterests,
  handleUpdateInterestStatus,
  handleCheckInterest,
} from "../controllers/interest.controller.js";

const router = express.Router();

// Tenant sends interest
router.post("/:listingId", authenticate, authorizeTenant, handleSendInterest);

// Tenant checks if already interested
router.get("/check/:listingId", authenticate, authorizeTenant, handleCheckInterest);

// Tenant's sent requests
router.get("/sent", authenticate, authorizeTenant, handleGetTenantInterests);

// Owner's received requests
router.get("/received", authenticate, authorizeOwner, handleGetOwnerInterests);

// Owner accepts/rejects
router.put("/:id", authenticate, authorizeOwner, handleUpdateInterestStatus);

export default router;
