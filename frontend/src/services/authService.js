import API from "./api";

const authService = {
  login: async (email, password) => {
    const response = await API.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await API.post("/auth/logout");
    return response.data;
  },
};

export default authService;
