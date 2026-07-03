import API from "./api";

const chatService = {
  getConversations: async () => {
    const response = await API.get("/chat/conversations");
    return response.data;
  },

  getMessages: async (interestId) => {
    const response = await API.get(`/chat/${interestId}`);
    return response.data;
  },
};

export default chatService;
