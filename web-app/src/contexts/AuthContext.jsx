import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (token, role) => {
    Cookies.set("token", token, { expires: 1 / 24 }); // 1 hour
    Cookies.set("role", role, { expires: 1 / 24 });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = Cookies.get("token");
    try {
      if (token) {
        await axios.post(
          `${SERVER_URL}/api/admin/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error(
        "Failed to record logout audit event:",
        err?.response?.data || err.message
      );
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("pendingEmail");
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
