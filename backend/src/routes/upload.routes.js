import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeOwner } from "../middlewares/role.middleware.js";
import { upload } from "../services/upload.service.js";
import { handleUploadPhoto } from "../controllers/upload.controller.js";

const router = express.Router();

// POST /api/upload/photo  — owner only, single image, 5MB limit
router.post(
  "/photo",
  authenticate,
  authorizeOwner,
  upload.single("photo"),
  handleUploadPhoto
);

export default router;
