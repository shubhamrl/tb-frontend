// src/pages/SpinGamePage.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const NUMBERS = Array.from({ length: 10 }, (_, i) => i);

const SpinGamePage = () => {
  const [balance, setBalance] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [placingBet, setPlacingBet] = useState(false);
  const [lastWins, setLastWins] = useState([]);
  const [winner, setWinner] = useState(null);

  // Fetch user balance (example API)
  const fetchBalance = async () => {
    const res = await api.get('/user/profile'); // adjust if needed
    setBalance(res.data.balance);
  };

  // Fetch round and timer
  const fetchRound = async () => {
    const res = await api.get('/spin/round');
    setRound(res.data.round);
    setTimer(res.data.timer);
  };

  // Fetch last 10 wins
  const fetchLastWins = async () => {
    const res = await api.get('/spin/last-wins');
    setLastWins(res.data.wins || []);
  };

  // Fetch winner after round ends
  const fetchWinner = async (r) => {
    const res = await api.get(`/spin/winner/${r}`);
    setWinner(res.data.winner);
  };

  // Live timer effect
  useEffect(() => {
    fetchBalance();
    fetchRound();
    fetchLastWins();
    const interval = setInterval(() => {
      fetchRound();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // When timer reaches 0, fetch winner & update last wins
  useEffect(() => {
    if (timer === 0 && round) {
      fetchWinner(round);
      setTimeout(() => {
        fetchLastWins();
        setWinner(null);
      }, 3000); // after 3s, hide winner highlight
    }
  }, [timer, round]);

  // Place bet
  const handleBet = async () => {
    if (placingBet) return;
    if (selectedNumber === null || !betAmount) return alert('Select number and amount!');
    setPlacingBet(true);
    try {
      const res = await api.post('/spin/bet', {
        choice: selectedNumber,
        amount: Number(betAmount)
      });
      setBalance(res.data.balance);
      alert('Bet placed!');
      setBetAmount('');
      setSelectedNumber(null);
    } catch (err) {
      alert(err?.response?.data?.error || 'Bet failed!');
    }
    setPlacingBet(false);
  };

  // Render wheel (simple SVG, update later for animation)
  const renderWheel = () => (
    <div className="wheel-container" style={{ position: 'relative', width: 220, height: 220, margin: 'auto' }}>
      <svg width="220" height="220">
        <circle cx="110" cy="110" r="100" fill="#eee" stroke="#333" strokeWidth="4" />
        {NUMBERS.map((num, idx) => {
          const angle = (idx / 10) * 2 * Math.PI;
          const x = 110 + 80 * Math.cos(angle - Math.PI / 2);
          const y = 110 + 80 * Math.sin(angle - Math.PI / 2);
          return (
            <text
              key={num}
              x={x}
              y={y}
              fontSize={winner === num ? 26 : 22}
              fill={winner === num ? 'red' : '#333'}
              fontWeight={winner === num ? 'bold' : 'normal'}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {num}
            </text>
          );
        })}
      </svg>
      {/* Arrow */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '35px solid orange',
        transform: 'translateX(-50%)'
      }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 16 }}>
      <h2>Spin to Win</h2>
      <div>Balance: ₹{balance}</div>
      <div>Current Round: {round}</div>
      <div>Time Left: <b>{timer}</b> sec</div>
      <br />

      {renderWheel()}

      <div style={{ marginTop: 24 }}>
        <b>Select Number:</b>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0' }}>
          {NUMBERS.map(num => (
            <button
              key={num}
              style={{
                padding: 12,
                background: selectedNumber === num ? 'orange' : '#f1f1f1',
                fontWeight: selectedNumber === num ? 'bold' : 'normal',
                border: '1px solid #ccc',
                borderRadius: 6
              }}
              onClick={() => setSelectedNumber(num)}
              disabled={timer <= 15}
            >
              {num}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          placeholder="Bet Amount"
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          disabled={timer <= 15}
          style={{ width: 100, padding: 8 }}
        />
        <button onClick={handleBet} disabled={timer <= 15 || placingBet} style={{ marginLeft: 10 }}>
          Place Bet
        </button>
        {timer <= 15 && <div style={{ color: 'red', marginTop: 8 }}>Betting Closed!</div>}
      </div>

      <hr style={{ margin: '32px 0 16px 0' }} />

      <div>
        <b>Last 10 Wins:</b>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {lastWins.map((win, idx) => (
            <span key={idx} style={{
              padding: '6px 10px', background: '#f6f6f6', borderRadius: 4,
              color: win.winner === winner ? 'green' : '#111'
            }}>
              #{win.round}: <b>{win.winner}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpinGamePage;
