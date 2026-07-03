import { getMessages, getConversations } from "../services/chat.service.js";

export const handleGetMessages = async (req, res) => {
  try {
    const messages = await getMessages(req.params.interestId, req.user.id);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 403 : 404;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const handleGetConversations = async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
