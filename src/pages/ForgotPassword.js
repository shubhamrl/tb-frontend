import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await axios.post('https://tb-backend-1.onrender.com/api/auth/forgot-password', { email });
      setMsg('Reset link sent to your email (check spam folder also).');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgot}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {msg && <p style={{ color: msg.startsWith('Reset') ? 'green' : 'red', marginTop: '10px' }}>{msg}</p>}
    </div>
  );
};

export default ForgotPassword;
