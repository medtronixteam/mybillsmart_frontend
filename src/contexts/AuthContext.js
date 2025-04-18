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
    subscriptionId: null,
    growthSubscriptionId: null,
    planName: null,
    isAuthenticated: false
  });
  const [initialized, setInitialized] = useState(false);

  const login = (
    newToken, 
    newRole, 
    newUserId, 
    newGroupId, 
    name, 
    email, 
    is2FAEnabled = false,
    subscriptionId = null,
    growthSubscriptionId = null,
    planName = null
  ) => {
    const userData = {
      token: newToken,
      role: newRole,
      userId: newUserId,
      groupId: newGroupId,
      name,
      email,
      is2FAEnabled,
      subscriptionId,
      growthSubscriptionId,
      planName,
      isAuthenticated: true
    };

    localStorage.setItem("authToken", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("groupId", newGroupId);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("is2FAEnabled", is2FAEnabled.toString());
    localStorage.setItem("subscriptionId", subscriptionId || '');
    localStorage.setItem("growthSubscriptionId", growthSubscriptionId || '');
    localStorage.setItem("planName", planName || '');
    
    setAuthState(userData);
  };

  const update2FAStatus = (status) => {
    setAuthState(prev => ({
      ...prev,
      is2FAEnabled: status
    }));
    localStorage.setItem("is2FAEnabled", status.toString());
  };

  const updateSubscription = (subscriptionData) => {
    setAuthState(prev => ({
      ...prev,
      ...subscriptionData
    }));
    
    if (subscriptionData.subscriptionId !== undefined) {
      localStorage.setItem("subscriptionId", subscriptionData.subscriptionId || '');
    }
    if (subscriptionData.growthSubscriptionId !== undefined) {
      localStorage.setItem("growthSubscriptionId", subscriptionData.growthSubscriptionId || '');
    }
    if (subscriptionData.planName !== undefined) {
      localStorage.setItem("planName", subscriptionData.planName || '');
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("groupId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("is2FAEnabled");
    localStorage.removeItem("subscriptionId");
    localStorage.removeItem("growthSubscriptionId");
    localStorage.removeItem("planName");
    
    setAuthState({
      token: null,
      role: null,
      userId: null,
      groupId: null,
      name: null,
      email: null,
      is2FAEnabled: false,
      subscriptionId: null,
      growthSubscriptionId: null,
      planName: null,
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
    const storedSubscriptionId = localStorage.getItem("subscriptionId");
    const storedGrowthSubscriptionId = localStorage.getItem("growthSubscriptionId");
    const storedPlanName = localStorage.getItem("planName");
    
    if (storedToken && storedRole && storedUserId) {
      setAuthState({
        token: storedToken,
        role: storedRole,
        userId: storedUserId,
        groupId: storedGroupId,
        name: storedName,
        email: storedEmail,
        is2FAEnabled: stored2FAStatus,
        subscriptionId: storedSubscriptionId || null,
        growthSubscriptionId: storedGrowthSubscriptionId || null,
        planName: storedPlanName || null,
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
      updateSubscription,
      initialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};