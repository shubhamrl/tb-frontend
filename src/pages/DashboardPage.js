// src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
import '../styles/dashboard.css';
import AdminSidebar from '../components/AdminSidebar'; // Sidebar import

// English-to-Hindi mapping
const EN_TO_HI = {
  umbrella: 'छतरी',
  football: 'फुटबॉल',
  sun: 'सूरज',
  diya: 'दीया',
  cow: 'गाय',
  bucket: 'बाल्टी',
  kite: 'पतंग',
  spinningTop: 'भंवरा',
  rose: 'गुलाब',
  butterfly: 'तितली',
  pigeon: 'कबूतर',
  rabbit: 'खरगोश'
};

// Image list (name: English, src: same as before)
const IMAGE_LIST = [
  { name: 'umbrella',    src: '/images/umbrella.png'     },
  { name: 'football',    src: '/images/Football.png'     },
  { name: 'sun',         src: '/images/sun.png'          },
  { name: 'diya',        src: '/images/diya.png'         },
  { name: 'cow',         src: '/images/cow.png'          },
  { name: 'bucket',      src: '/images/Bucket.png'       },
  { name: 'kite',        src: '/images/kite.png'         },
  { name: 'spinningTop', src: '/images/spinning_Top.png' },
  { name: 'rose',        src: '/images/rose.png'         },
  { name: 'butterfly',   src: '/images/Butterfly.png'    },
  { name: 'pigeon',      src: '/images/pigeon.png'       },
  { name: 'rabbit',      src: '/images/rabbit.png'       }
];

const socket = io('https://tb-backend-1.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 20000,
});

const WhatsappSettings = () => {
  const [deposit, setDeposit] = useState('');
  const [withdraw, setWithdraw] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        setDeposit(res.data?.depositWhatsapp || '');
        setWithdraw(res.data?.withdrawWhatsapp || '');
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', {
        depositWhatsapp: deposit,
        withdrawWhatsapp: withdraw
      });
      setMsg('Updated!');
    } catch {
      setMsg('Failed');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8, background: '#f9f9f9' }}>
      <h2>WhatsApp Number Settings</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Deposit WhatsApp: </label>
        <input value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="Deposit Number" style={{ marginRight: 8 }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Withdraw WhatsApp: </label>
        <input value={withdraw} onChange={e => setWithdraw(e.target.value)} placeholder="Withdraw Number" style={{ marginRight: 8 }} />
      </div>
      <button onClick={handleSave} disabled={loading}>Save</button>
      <span style={{ marginLeft: 10, color: msg === 'Updated!' ? 'green' : 'red' }}>{msg}</span>
    </section>
  );
};

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [editAmounts, setEditAmounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastWins, setLastWins] = useState([]); // NO LOCALSTORAGE!

  // Real-time state (from /live-state)
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(90);
  const [totals, setTotals] = useState({});
  const [winnerChoice, setWinnerChoice] = useState(null);

  // ========== Last 10 Wins fetch from backend ==========
  useEffect(() => {
    const fetchLastWins = async () => {
      try {
        const res = await api.get('/bets/last-wins');
        setLastWins(res.data.wins || []);
      } catch (err) {
        setLastWins([]); // fallback
      }
    };
    fetchLastWins();
    socket.on('winner-announced', fetchLastWins);
    socket.on('payouts-distributed', fetchLastWins);

    return () => {
      socket.off('winner-announced', fetchLastWins);
      socket.off('payouts-distributed', fetchLastWins);
    };
  }, []);
  // ====================================================

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await api.get('/bets/live-state');
        setCurrentRound(res.data.round);
        setTimer(res.data.timer);
        setTotals(res.data.totals || {});
        setWinnerChoice(res.data.winnerChoice || null);
      } catch (err) {
        console.error("Error fetching live-state:", err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Users data fetch
  const fetchUsers = async (search = '') => {
    try {
      const params = search.trim() ? { search } : {};
      const res = await api.get('/admin/users', { params });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.users || [];
      setUsers(list);
      setTotalUsers(data.total || 0);
      setActiveUsers(data.active || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = () => { fetchUsers(searchTerm); };
  const handleBalanceChange = (id, value) => { setEditAmounts(prev => ({ ...prev, [id]: value })); };
  const updateBalance = async (id, isAdd) => {
    try {
      const val = Number(editAmounts[id] || 0);
      const amount = isAdd ? val : -val;
      const res = await api.put(`/admin/users/${id}/balance`, { amount });
      setUsers(users.map(u =>
        u._id === id ? { ...u, balance: res.data.balance } : u
      ));
      alert(`Balance updated: ₹${res.data.balance}`);
      setEditAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Error updating balance:', err);
      alert('Error updating balance');
    }
  };

  const handleSetWinner = async (choice) => {
    try {
      await api.post('/bets/set-winner', { choice, round: currentRound });
      alert(`Winner set: ${EN_TO_HI[choice] || choice} (Payout will run when user timer 0)`);
    } catch (err) {
      console.error('Error setting winner:', err);
      alert('Error setting winner');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 220, width: '100%' }}>
        <div className="admin-dashboard-container" style={{ padding: '2rem' }}>
          <h1>Admin Dashboard</h1>

          {/* ====== Total/Active Users Row ====== */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <div style={{
              background: '#f1f3f6',
              padding: '18px 36px',
              borderRadius: 14,
              fontWeight: 'bold',
              fontSize: 20,
              minWidth: 150,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              Total Users<br />
              <span style={{ fontSize: 28, color: '#2d72e2' }}>{totalUsers}</span>
            </div>
            <div style={{
              background: '#f1f3f6',
              padding: '18px 36px',
              borderRadius: 14,
              fontWeight: 'bold',
              fontSize: 20,
              minWidth: 150,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              Active Users<br />
              <span style={{ fontSize: 28, color: '#18c964' }}>{activeUsers}</span>
            </div>
          </div>

          {/* ===== Current Round Section ===== */}
          <section className="current-round-section" style={{ marginTop: '2rem' }}>
            <h2>
              Current Round: {currentRound} | ⏱️ {timer}s left
            </h2>
            <div className="admin-image-grid">
              {IMAGE_LIST.map(item => {
                const amount = totals[item.name] || 0;
                const payout = amount * 10;
                return (
                  <div key={item.name} className="admin-card">
                    <img
                      src={item.src}
                      alt={EN_TO_HI[item.name] || item.name}
                      className="admin-card-image"
                    />
                    <p className="admin-card-name">{EN_TO_HI[item.name] || item.name}</p>
                    <p className="admin-card-bet">
                      Total Bet: <b>₹{amount}</b>
                    </p>
                    {/* Show payout if any bet is placed */}
                    <p className="admin-card-payout" style={{ color: '#e67e22', fontWeight: 'bold' }}>
                      Payout: ₹{payout}
                    </p>
                    <button
                      className="admin-card-button"
                      onClick={() => handleSetWinner(item.name)}
                      // Optionally disable except last 15 sec:
                      // disabled={timer > 15}
                    >
                      Set Winner
                    </button>
                  </div>
                );
              })}
            </div>
            {winnerChoice && <p style={{ color: "green", fontWeight: "bold" }}>Set Winner: {(EN_TO_HI[winnerChoice] || winnerChoice).toUpperCase()}</p>}
          </section>

          {/* ===== Last 10 Wins Section ===== */}
          <section className="last-wins-section" style={{ marginTop: '2rem' }}>
            <h2>Last 10 Wins</h2>
            <ul className="last-wins-list">
              {lastWins.map((winChoice, idx) => (
                <li key={idx}>{(EN_TO_HI[winChoice] || winChoice).toUpperCase()}</li>
              ))}
            </ul>
          </section>

          {/* ==== User Search and Manage Balance section (if you have it) ==== */}
          {/* Add here if needed */}

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
