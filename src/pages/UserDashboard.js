// src/pages/UserDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/userdashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState({ id: '', email: '', balance: 0, referralEarnings: 0 });
  const [numbers, setNumbers] = useState({ depositWhatsapp: '', withdrawWhatsapp: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();

    api.get('/settings')
      .then(res => setNumbers(res.data || {}))
      .catch(() => {});
  }, []);

  const createWhatsAppLink = (action) => {
    const message = `I want to ${action}. UserID: ${user.id}, Email: ${user.email}`;
    const number =
      action === 'deposit' ? numbers.depositWhatsapp
      : action === 'withdraw' ? numbers.withdrawWhatsapp
      : '';
    if (!number) {
      alert('WhatsApp number not available!');
      return '#';
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.email}</h1>
      <p>Your Balance: ₹{user.balance}</p>

      {/* ---------- Referral Button + Quick Earning ---------- */}
      <div style={{
        margin: '24px 0 18px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 22
      }}>
        <button
          style={{
            padding: "13px 35px",
            background: "#fb923c",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: 9,
            cursor: "pointer",
            fontSize: "1.15rem",
            letterSpacing: 0.5,
            boxShadow: '0 2px 12px #ffebc2',
            transition: "all 0.2s"
          }}
          onClick={() => navigate('/referral')}
        >
          🎁 Refer & Earn ₹100
        </button>
        <div style={{
          background: "#f9fbe7",
          color: "#16a34a",
          fontWeight: 700,
          fontSize: "1.1rem",
          borderRadius: 6,
          padding: "10px 18px",
          border: "1px solid #dbeafe"
        }}>
          Referral Earnings: ₹{user.referralEarnings || 0}
        </div>
      </div>

      <div className="dashboard-buttons">
        <button onClick={() => window.location.href = createWhatsAppLink('deposit')}>
          Deposit
        </button>
        <button onClick={() => window.location.href = createWhatsAppLink('withdraw')}>
          Withdraw
        </button>
      </div>

      <div className="game-buttons">
        <button onClick={() => navigate('/game/tb')}>Play Titali Bhavara</button>
        <button onClick={() => navigate('/game/spin')}>Play Spin to Win</button>
      </div>

      <div className="logout-section" style={{ marginTop: '20px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div
        className="tip-section"
        style={{
          marginTop: '32px',
          background: '#FFFDE7',
          border: '1px solid #FFD54F',
          borderRadius: '10px',
          padding: '16px',
          color: '#6D4C00',
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '1.6',
        }}
      >
        <span style={{ fontWeight: 700 }}>TIP:</span>
        &nbsp;डिपॉजिट के लिए <b>न्यूनतम ₹100</b> और <b>अधिकतम ₹10,000</b>।
        विड्रॉल के लिए <b>न्यूनतम ₹200</b> और <b>अधिकतम ₹10,000</b>।
        कृपया इन्हीं लिमिट्स का पालन करें।
        अधिक जानकारी के लिए व्हाट्सएप सपोर्ट पर मैसेज करें।
      </div>
    </div>
  );
};

export default UserDashboard;
