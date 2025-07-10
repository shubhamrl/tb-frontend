import React, { useEffect, useState } from 'react';
import api from '../services/api';

// English to Hindi Mapping
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

const AdminRoundsSummary = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBetsAmount: 0,
    totalPayout: 0,
    profit: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/today-rounds-summary');
        setRounds(res.data.rounds || []);
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
      setLoading(false);
    };

    const fetchProfit = async () => {
      try {
        const res = await api.get('/bets/today-summary');
        setSummary(res.data || {});
      } catch (err) {
        setSummary({ totalBetsAmount: 0, totalPayout: 0, profit: 0 });
      }
    };

    fetchSummary();
    fetchProfit();

    // Optional: auto-refresh every 30 sec
    const interval = setInterval(() => {
      fetchSummary();
      fetchProfit();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Today Rounds Summary</h2>
      {loading && <p>Loading...</p>}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        maxHeight: 400,
        overflowY: 'auto',
        marginBottom: 28
      }}>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Round</th>
              <th>Total Bet</th>
              <th>Winner</th>
              <th>Total Payout</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r, idx) => (
              <tr key={idx}>
                <td>{r.round}</td>
                <td>₹{r.totalBet}</td>
                <td>{EN_TO_HI[r.winner] || r.winner}</td>
                <td>₹{r.totalPayout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------- NEW: Profit & Payout Summary Section ------- */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
        <div style={{
          background: "#f3fff4", borderRadius: 14, padding: 22, minWidth: 240, boxShadow: "0 2px 12px #0001"
        }}>
          <div style={{ color: "#888", marginBottom: 6 }}>आज का Total Payout</div>
          <div style={{ fontSize: 26, color: "#16a085", fontWeight: 700 }}>₹{summary.totalPayout}</div>
        </div>
        <div style={{
          background: "#fff5ee", borderRadius: 14, padding: 22, minWidth: 240, boxShadow: "0 2px 12px #0001"
        }}>
          <div style={{ color: "#888", marginBottom: 6 }}>आज का Company Profit</div>
          <div style={{ fontSize: 26, color: "#e67e22", fontWeight: 700 }}>₹{summary.profit}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoundsSummary;
