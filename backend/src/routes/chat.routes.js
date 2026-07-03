import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { handleGetMessages, handleGetConversations } from "../controllers/chat.controller.js";

const router = express.Router();

// Get active conversations list
router.get("/conversations", authenticate, handleGetConversations);

// Get message history for a specific room interest chat
router.get("/:interestId", authenticate, handleGetMessages);

export default router;
