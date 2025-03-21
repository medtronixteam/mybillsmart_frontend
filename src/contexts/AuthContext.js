import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const login = (newToken, newRole, newUserId) => {
    console.log("Updating AuthContext with:", { newToken, newRole, newUserId }); // Debug
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  };

  // Ensure token, role, and userId are set from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");
    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};