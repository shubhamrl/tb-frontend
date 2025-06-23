import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OtpVerify from './pages/OtpVerify';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/DashboardPage';
import TBGamePage from './pages/TBGamePage';
import SpinGamePage from './pages/SpinGamePage';
import AdminRoute from './components/AdminRoute'; // Make sure path is correct

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/verify-otp" element={<OtpVerify />} />
        
        {/* Home page route: now checks role */}
        <Route
          path="/"
          element={
            token
              ? (role === 'admin'
                  ? <Navigate to="/admin" replace />
                  : <Navigate to="/dashboard" replace />
                )
              : <Navigate to="/signup" replace />
          }
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* User dashboard route */}
        <Route
          path="/dashboard"
          element={token ? <UserDashboard /> : <Navigate to="/login" replace />}
        />

        {/* Admin dashboard route, fully protected */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Game pages, protected by token */}
        <Route
          path="/game/tb"
          element={token ? <TBGamePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/game/spin"
          element={token ? <SpinGamePage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
