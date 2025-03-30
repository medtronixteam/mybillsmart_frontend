import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const login = (newToken, newRole, newUserId, newGroupId) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("groupId", newGroupId);
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    setGroupId(newGroupId);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("groupId");
    setToken(null);
    setRole(null);
    setUserId(null);
    setGroupId(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");
    const storedGroupId = localStorage.getItem("groupId");
    
    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
      setGroupId(storedGroupId);
    }
    
    setInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      role, 
      userId,
      groupId,
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