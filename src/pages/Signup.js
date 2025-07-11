import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import '../styles/auth.css';

const girlImg = "/images/gaming-girl.png"; // Transparent PNG required
const particlesImg = "/images/particles.png"; // Overlay PNG from public

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get ref from URL param
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const referrerId = query.get('ref'); // null if not present

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signupData = { email, password };
      if (referrerId) signupData.referrerId = referrerId;

      await axios.post(
        'https://tb-backend-1.onrender.com/api/auth/signup',
        signupData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setLoading(false);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Signup failed';
      alert(`Signup failed: ${msg}`);
    }
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
          <h2>Sign Up</h2>
          {loading ? (
            <Loader />
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          )}
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
