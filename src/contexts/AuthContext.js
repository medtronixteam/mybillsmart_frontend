import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const login = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    // Save to localStorage to persist after page refresh
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    // Remove from localStorage to clear session
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
  };

  // Ensure token and role are set from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
