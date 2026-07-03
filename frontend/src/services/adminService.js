import API from "./api";

const adminService = {
  getStats: async () => {
    const response = await API.get("/admin/stats");
    return response.data;
  },

  getUsers: async (search = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const response = await API.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  toggleUserDisabled: async (id) => {
    const response = await API.patch(`/admin/user/${id}/toggle`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await API.delete(`/admin/user/${id}`);
    return response.data;
  },

  getListings: async () => {
    const response = await API.get("/admin/listings");
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await API.delete(`/admin/listing/${id}`);
    return response.data;
  },

  markListingFilled: async (id) => {
    const response = await API.patch(`/admin/listing/${id}/fill`);
    return response.data;
  },
};

export default adminService;
