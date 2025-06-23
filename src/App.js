import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OtpVerify from './pages/OtpVerify';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/DashboardPage';
import TBGamePage from './pages/TBGamePage';
import SpinGamePage from './pages/SpinGamePage';

function App() {
  const token = localStorage.getItem('token');
  return (import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OtpVerify from './pages/OtpVerify';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/DashboardPage';
import TBGamePage from './pages/TBGamePage';
import SpinGamePage from './pages/SpinGamePage';

// ===== AdminRoute ko import karo yaha! =====
import AdminRoute from './components/AdminRoute';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={token ? <UserDashboard /> : <Navigate to="/login" replace />}
        />
        {/* ==== ADMIN ROUTE YAHAN PROTECT KIYA ==== */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
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

    <Router>
      <Routes>
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={token ? <UserDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={token ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
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
