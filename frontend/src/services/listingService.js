import API from "./api";

const listingService = {
  createListing: async (data) => {
    const response = await API.post("/listings", data);
    return response.data;
  },

  getMyListings: async () => {
    const response = await API.get("/listings/my");
    return response.data;
  },

  getAllListings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.location) params.append("location", filters.location);
    if (filters.maxRent) params.append("maxRent", filters.maxRent);
    if (filters.minRent) params.append("minRent", filters.minRent);
    if (filters.roomType) params.append("roomType", filters.roomType);
    if (filters.furnishingStatus) params.append("furnishingStatus", filters.furnishingStatus);
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const response = await API.get(`/listings?${params.toString()}`);
    return response.data;
  },

  getListingById: async (id) => {
    const response = await API.get(`/listings/${id}`);
    return response.data;
  },

  updateListing: async (id, data) => {
    const response = await API.put(`/listings/${id}`, data);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await API.delete(`/listings/${id}`);
    return response.data;
  },

  uploadPhoto: async (listingId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("listingId", listingId);
    const response = await API.post("/upload/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default listingService;
