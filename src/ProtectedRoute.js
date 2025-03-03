import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { token, role } = useAuth();

  if (!token) {
    localStorage.setItem('redirectUrl', window.location.pathname); 
    return <Navigate to="/login" />;
  }

  if (role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} />;
  }

  return element;
};

export default ProtectedRoute;
