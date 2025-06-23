import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  console.log("AdminRoute => token:", token, "| role:", role);

  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminRoute;
