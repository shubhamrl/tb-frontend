import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminRoundsSummary = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);

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

    fetchSummary();
    // Optional: auto-refresh every 30 sec
    const interval = setInterval(fetchSummary, 30000);
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
                <td>{r.winner}</td>
                <td>₹{r.totalPayout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoundsSummary;
