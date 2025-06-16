import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState({ id: '', email: '', balance: 0 });
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

      {/* 🔴 Logout Button */}
      <div className="logout-section" style={{ marginTop: '20px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default UserDashboard;
