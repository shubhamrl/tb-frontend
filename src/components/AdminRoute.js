// src/components/AdminRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Agar token nahi hai ya role admin nahi hai to login pe redirect karo
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Warna children (yani admin panel ka component) render karo
  return children;
};

export default AdminRoute;
