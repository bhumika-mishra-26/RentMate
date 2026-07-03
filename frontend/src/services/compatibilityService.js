import API from "./api";

const compatibilityService = {
  getScore: async (listingId) => {
    const response = await API.get(`/compatibility/${listingId}`);
    return response.data;
  },
};

export default compatibilityService;
