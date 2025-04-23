import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { token, role, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!token) {
    // Save the full path including search params
    localStorage.setItem('redirectUrl', location.pathname + location.search);
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} />;
  }

  return element;
};

export default ProtectedRoute;