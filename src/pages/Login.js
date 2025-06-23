import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      // Check what the backend returns
      // console.log(res.data);

      // Save token and role to localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      // Role save logic—adjust if response changes
      if (res.data.role) {
        localStorage.setItem('role', res.data.role);
      } else if (res.data.user?.role) {
        localStorage.setItem('role', res.data.user.role);
      }

      // Redirect based on role
      const userRole = res.data.role || res.data.user?.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLoading(false);
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
};

export default Login;
