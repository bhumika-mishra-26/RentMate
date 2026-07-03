import API from "./api";

const tenantService = {
  upsertProfile: async (data) => {
    const response = await API.post("/tenant/profile", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get("/tenant/profile");
    return response.data;
  },
};

export default tenantService;
