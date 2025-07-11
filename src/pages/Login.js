import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import '../styles/auth.css';

const girlImg = "/images/gaming-girl.png";
const particlesImg = "/images/particles.png";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        'https://tb-backend-1.onrender.com/api/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.role) localStorage.setItem('role', res.data.role);
      else if (res.data.user?.role) localStorage.setItem('role', res.data.user.role);

      const userRole = res.data.role || res.data.user?.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLoading(false);
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg" style={{ position: "relative", overflow: "hidden" }}>
      {/* Particle overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `url(${particlesImg}) repeat`,
          backgroundSize: '120px 120px',
          opacity: 0.7,
          zIndex: 1
        }}
      />
      <div className="auth-main" style={{ position: "relative", zIndex: 2 }}>
        {/* Cartoon Girl */}
        <div className="auth-img-wrapper">
          <img
            src={girlImg}
            alt="Gaming Girl"
            className="auth-girl-img"
          />
        </div>
        <div className="auth-container">
          <h2>Login</h2>
          {loading ? (
            <Loader />
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              <div className="auth-password-wrapper" style={{ position: "relative" }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-hide-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#FFD54F",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ textAlign: 'right', margin: '5px 0 10px 0' }}>
                <Link to="/forgot-password" style={{ fontSize: '13px' }}>
                  Forgot Password?
                </Link>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}
          <p style={{ marginTop: '10px' }}>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
