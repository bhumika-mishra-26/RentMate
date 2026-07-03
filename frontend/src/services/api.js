import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Module-level token store — set by AuthContext on login/logout
// This avoids reading from localStorage (shared across browser tabs),
// which causes cross-tab token pollution when Owner + Tenant are open simultaneously.
let _authToken = localStorage.getItem("token");

export const setApiToken = (token) => {
  _authToken = token;
};

// Interceptor to attach JWT token to headers dynamically
API.interceptors.request.use(
  (config) => {
    if (_authToken) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
