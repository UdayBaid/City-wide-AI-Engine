import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = localStorage.getItem('currentUser');

  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
