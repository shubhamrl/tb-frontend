import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import SideMenu from '../components/SideMenu';
import '../styles/userdashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState({ id: '', email: '', balance: 0 });
  const [numbers, setNumbers] = useState({ depositWhatsapp: '', withdrawWhatsapp: '' });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const resUser = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(resUser.data);

        const resSettings = await api.get('/settings');
        setNumbers(resSettings.data || {});
      } catch (err) {
        console.error('Failed to fetch user or settings:', err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-mobile-bg">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} numbers={numbers} />
      <div className="dashboard-mobile-main">

        {/* Top Row: Hamburger Menu + Logo (optional) */}
        <div className="dashboard-header-row">
          <button
            className="menu-icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="menu-icon-bar"></span>
            <span className="menu-icon-bar"></span>
            <span className="menu-icon-bar"></span>
          </button>
          <div className="dashboard-logo">
            {/* Optional logo image/text */}
          </div>
        </div>

        <div className="dashboard-welcome">
          <div className="welcome-title">Welcome,</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="dashboard-balance">
          Balance: <span className="balance-amount">₹{user.balance || 0}</span>
        </div>

        {/* 🔥 Play buttons */}
        <div className="dashboard-play-buttons">
          <button onClick={() => navigate('/game/tb')}>Play Titali Bhavara</button>
          <button onClick={() => navigate('/game/spin')}>Play Spin to Win</button>
        </div>

        {/* 🔥 My Bet History Button */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/bet-history')}
            style={{
              background: '#4629e6',
              color: '#fff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: 7,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 16,
              boxShadow: '0 2px 10px #0002'
            }}
          >
            📜 My Bet History
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
