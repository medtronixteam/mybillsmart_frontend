import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    role: null,
    userId: null,
    groupId: null,
    name: null,
    email: null,
    is2FAEnabled: false,
    isAuthenticated: false
  });
  const [initialized, setInitialized] = useState(false);

  const login = (newToken, newRole, newUserId, newGroupId, name, email, is2FAEnabled = false) => {
    const userData = {
      token: newToken,
      role: newRole,
      userId: newUserId,
      groupId: newGroupId,
      name,
      email,
      is2FAEnabled,
      isAuthenticated: true
    };

    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("groupId", newGroupId);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("is2FAEnabled", is2FAEnabled.toString());
    
    setAuthState(userData);
  };

  const update2FAStatus = (status) => {
    setAuthState(prev => ({
      ...prev,
      is2FAEnabled: status
    }));
    localStorage.setItem("is2FAEnabled", status.toString());
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("groupId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("is2FAEnabled");
    
    setAuthState({
      token: null,
      role: null,
      userId: null,
      groupId: null,
      name: null,
      email: null,
      is2FAEnabled: false,
      isAuthenticated: false
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");
    const storedGroupId = localStorage.getItem("groupId");
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const stored2FAStatus = localStorage.getItem("is2FAEnabled") === 'true';
    
    if (storedToken && storedRole && storedUserId) {
      setAuthState({
        token: storedToken,
        role: storedRole,
        userId: storedUserId,
        groupId: storedGroupId,
        name: storedName,
        email: storedEmail,
        is2FAEnabled: stored2FAStatus,
        isAuthenticated: true
      });
    }
    
    setInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login, 
      logout,
      update2FAStatus,
      initialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};