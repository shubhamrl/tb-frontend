import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../styles/auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get ref from URL param
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const referrerId = query.get('ref'); // Ye null ho sakta hai, toh koi problem nahi

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call with referrerId
      await axios.post(
        // 'http://localhost:5000/api/auth/signup',
        'https://tb-backend-1.onrender.com/api/auth/signup',
        { email, password, referrerId }, // ← yahan pass ho raha hai
        { headers: { 'Content-Type': 'application/json' } }
      );
      setLoading(false);

      // Signup success: go to OTP page and pass email in URL
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Signup failed';
      alert(`Signup failed: ${msg}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
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

      <p style={{ marginTop: '10px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Signup;
