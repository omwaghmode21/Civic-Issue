import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname + (location.search || ''));

  if (!currentUser) {
    // Not logged in → send to login, preserve intended path + query
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    // Logged in but wrong role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
