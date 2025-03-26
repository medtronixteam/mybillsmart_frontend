import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const login = (newToken, newRole, newUserId) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  // Initialize auth state from localStorage only once
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");
    
    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
    }
    
    setInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      role, 
      userId, 
      login, 
      logout,
      isAuthenticated: !!token,
      initialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};