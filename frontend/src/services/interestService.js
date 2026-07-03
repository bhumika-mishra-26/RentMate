import API from "./api";

const interestService = {
  sendInterest: async (listingId) => {
    const response = await API.post(`/interests/${listingId}`);
    return response.data;
  },
  checkInterest: async (listingId) => {
    const response = await API.get(`/interests/check/${listingId}`);
    return response.data;
  },
  getSentInterests: async () => {
    const response = await API.get("/interests/sent");
    return response.data;
  },
  getReceivedInterests: async () => {
    const response = await API.get("/interests/received");
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await API.put(`/interests/${id}`, { status });
    return response.data;
  },
};

export default interestService;
