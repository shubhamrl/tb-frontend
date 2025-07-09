import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OtpVerify from './pages/OtpVerify';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/DashboardPage';
import TBGamePage from './pages/TBGamePage';
import SpinGamePage from './pages/SpinGamePage';
import WhatsappSettingsPage from './pages/WhatsappSettingsPage';
import ManageUserPage from './pages/ManageUserPage';
import AdminRoundsSummary from './pages/AdminRoundsSummary';
import SpinWinnerAdmin from './pages/SpinWinnerAdmin';
import ReferralPage from './pages/ReferralPage';
import AdminRoute from './components/AdminRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// ⭐️ BET HISTORY PAGE KA IMPORT ADD KARO
import BetHistoryPage from './pages/BetHistoryPage';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  console.log("App.js => token:", token, "| role:", role);

  return (
    <Router>
      <Routes>
        <Route path="/verify-otp" element={<OtpVerify />} />

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

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={token ? <UserDashboard /> : <Navigate to="/login" replace />}
        />

        {/* ⭐️ BET HISTORY ROUTE ADD KARO */}
        <Route
          path="/bet-history"
          element={token ? <BetHistoryPage /> : <Navigate to="/login" replace />}
        />

        {/* NEW: Referral page route */}
        <Route
          path="/referral"
          element={token ? <ReferralPage /> : <Navigate to="/login" replace />}
        />

        {/* ----- ADMIN PANEL ROUTES ------ */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/whatsapp"
          element={
            <AdminRoute>
              <WhatsappSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-user"
          element={
            <AdminRoute>
              <ManageUserPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/summary"
          element={
            <AdminRoute>
              <AdminRoundsSummary />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/spin-winner"
          element={
            <AdminRoute>
              <SpinWinnerAdmin />
            </AdminRoute>
          }
        />

        {/* ----- GAMES ----- */}
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
