import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import { setApiToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // Push current tab's token into the axios client immediately
        setApiToken(storedToken);
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data.user) {
            setUser(response.data.user);
          } else {
            // Token invalid or user not found
            handleLogout();
          }
        } catch (error) {
          console.error("Failed to restore auth session:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setApiToken(null);
    setUser(null);
    setToken(null);
  };

  const loginUser = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setApiToken(response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setApiToken(response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || "Registration failed" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Registration failed",
      };
    }
  };


  const logoutUser = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API request failed:", error);
    } finally {
      handleLogout();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
