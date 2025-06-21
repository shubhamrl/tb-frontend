import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles/auth.css';

// Utility to get query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const OtpVerify = () => {
  const query = useQuery();
  const email = query.get('email') || ''; // email URL se milega
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      // API call
      const res = await axios.post(
        //  'http://localhost:5000/api/auth/verify-otp',
        'https://tb-backend-1.onrender.com/api/auth/verify-otp',
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setMsg(res.data.message || 'Email verified!');

      // 1s baad login pe bhej do
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-container">
        <h2>Invalid Access</h2>
        <p>Email missing. Please <Link to="/signup">signup</Link> again.</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Email OTP Verification</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
      <p style={{ marginTop: '10px' }}>
        Go back to <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
};

export default OtpVerify;
