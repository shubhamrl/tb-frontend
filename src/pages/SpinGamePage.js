import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/spin.css';

// --- Helper functions for SVG arc (for colorful wheel segments) ---
function describeArc(cx, cy, r, startAngle, endAngle) {
  var start = polarToCartesian(cx, cy, r, endAngle);
  var end = polarToCartesian(cx, cy, r, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "L", cx, cy,
    "Z"
  ].join(" ");
  return d;
}
function polarToCartesian(cx, cy, r, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

const ROW1 = [0, 1, 2, 3, 4];
const ROW2 = [5, 6, 7, 8, 9];
const SEGMENT_COLORS = [
  '#FFEB3B', '#FF9800', '#8BC34A', '#03A9F4', '#E91E63',
  '#00BCD4', '#9C27B0', '#CDDC39', '#FF5722', '#607D8B'
];

const SpinGamePage = () => {
  const [balance, setBalance] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(90);
  const [selected, setSelected] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [userBets, setUserBets] = useState({}); // { [number]: amount }
  const [lastWins, setLastWins] = useState([]);
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  // --- Fetch initial data ---
  useEffect(() => {
    fetchUser();
    fetchRound();
    fetchLast10Wins();
    // eslint-disable-next-line
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      if (timer === 10) {
        startWheelSpin();
      }
      if (timer === 0) {
        fetchWinner();
        resetAfterRound();
      }
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [timer]);

  // --- API Calls ---
  const fetchUser = async () => {
    try {
      const res = await api.get('/user/profile');
      setBalance(res.data.balance);
    } catch {}
  };

  const fetchRound = async () => {
    try {
      const res = await api.get('/spin/round');
      setRound(res.data.round);
      setTimer(res.data.timer);
      setUserBets(res.data.userBets || {});
    } catch {}
  };

  const fetchLast10Wins = async () => {
    try {
      const res = await api.get('/spin/last-wins');
      setLastWins(res.data.wins || []);
    } catch {}
  };

  const fetchWinner = async () => {
    try {
      const res = await api.get(`/spin/winner/${round}`);
      setWinner(res.data.winner);

      // Animate wheel to winner
      if (typeof res.data.winner === 'number') {
        setSpinning(true);
        // 36deg per segment, +360*5 for multiple spins before stopping
        const finalAngle = (360 - (res.data.winner * 36)) + 360 * 5;
        setTimeout(() => setSpinAngle(finalAngle), 100); // Small delay before spin
        setTimeout(() => setSpinning(false), 4800);
      }

      fetchLast10Wins();
      fetchUser();
      setTimeout(() => setWinner(null), 5000);
    } catch {}
  };

  // --- Wheel Animation ---
  const startWheelSpin = () => {
    setSpinning(true);
    setSpinAngle(prev => prev + 600); // Fast spin first
    setTimeout(() => setSpinning(false), 1000);
  };

  // --- Round Reset ---
  const resetAfterRound = () => {
    setTimeout(() => {
      setTimer(90);
      setSelected(null);
      setBetAmount('');
      setUserBets({});
      setSpinAngle(0);
      setWinner(null);
      fetchRound();
    }, 6000); // next round after 6s
  };

  // --- Place Bet ---
  const handlePlaceBet = async () => {
    if (selected === null || !betAmount || Number(betAmount) <= 0) return;
    try {
      await api.post('/spin/bet', {
        choice: selected,
        amount: Number(betAmount),
      });
      setUserBets((b) => ({ ...b, [selected]: Number(betAmount) }));
      fetchUser();
      setBetAmount('');
      // No alert, no popup, fast UI!
    } catch (err) {
      // Optional: Show small error below input
    }
  };

  // --- UI Render ---
  return (
    <div className="spin-game-container">
      {/* Top: Balance, Round, Timer */}
      <div className="top-bar">
        <span>Balance: ₹{balance}</span>
        <span>Round: {round}</span>
        <span className={timer <= 15 ? "timer closed" : "timer"}>
          {timer > 0 ? `Time left: ${timer}s` : "Waiting..."}
        </span>
      </div>

      {/* Wheel Section */}
     <div className="wheel-section" style={{ position: "relative", width: 210, margin: "0 auto 25px auto" }}>
  {/* Arrow – now at bottom */}
 <div
    style={{
      position: 'absolute',
      left: '50%',
      top: 'calc(100% - 4px)',
      transform: 'translateX(-50%) rotate(180deg)',
      zIndex: 2,
      width: 0,
      height: 0,
      borderLeft: '14px solid transparent',
      borderRight: '14px solid transparent',
      borderTop: '32px solid #fb923c',
    }}
  />
  {/* Wheel */}
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    className="spin-wheel-svg"
    style={{
      display: 'block',
      margin: 'auto',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #a7c7e7 85%, #dbeafe 100%)',
      boxShadow: '0 2px 14px #b7b7b7',
      transform: `rotate(${spinAngle}deg)`,
      transition: spinning ? "transform 1.8s cubic-bezier(.34,1.56,.64,1)" : "transform 0.35s cubic-bezier(.34,1.56,.64,1)"
    }}
  >
    {/* Segments */}
    {Array.from({ length: 10 }).map((_, i) => {
      const rotate = (i * 36);
      // Text position (radius = 75), angle = middle of each segment
      const angle = (i * 36 + 18 - 90) * (Math.PI / 180); // +18 for center, -90 to start at top
      const x = 100 + 75 * Math.cos(angle);
      const y = 100 + 75 * Math.sin(angle);
      return (
        <g key={i}>
          <path
            d={describeArc(100, 100, 95, i * 36, (i + 1) * 36)}
            fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Number label */}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#222"
            fontSize="22"
            fontWeight={winner === i ? "bold" : "600"}
            style={{
              textShadow: winner === i ? "0 0 6px #f59e42" : "none",
              fill: winner === i ? "#dc2626" : "#222",
              userSelect: 'none',
            }}
            transform={`rotate(${rotate + 18} ${x} ${y})`}
          >
            {i}
          </text>
        </g>
      );
    })}
    {/* Center circle – no SPIN text */}
<text x={100} y={110} textAnchor="middle" fontSize={32}>🎡</text>
    {/* Center can be left blank or small logo */}
  </svg>
</div>


      {/* Numbers below wheel in two rows */}
      <div className="numbers-section">
        <div className="numbers-row">
          {ROW1.map((num) => (
            <div
              key={num}
              className={`number-box ${selected === num ? "selected" : ""}`}
              onClick={() => timer > 15 && setSelected(num)}
            >
              <div>{num}</div>
              <div className="bet-amount">
                {userBets[num] ? `₹${userBets[num]}` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="numbers-row">
          {ROW2.map((num) => (
            <div
              key={num}
              className={`number-box ${selected === num ? "selected" : ""}`}
              onClick={() => timer > 15 && setSelected(num)}
            >
              <div>{num}</div>
              <div className="bet-amount">
                {userBets[num] ? `₹${userBets[num]}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bet input & button */}
      <div className="bet-section">
        <input
          type="number"
          min={1}
          placeholder="Bet Amount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={timer <= 15 || selected === null}
        />
        <button
          onClick={handlePlaceBet}
          disabled={timer <= 15 || selected === null || !betAmount}
        >
          Place Bet
        </button>
      </div>
      {/* NO Betting Closed message here */}

      {/* Last 10 wins */}
      <div className="last10-wins-section">
        <h4>Last 10 Wins</h4>
        <div className="last10-list">
          {lastWins.map((win, idx) => (
            <div key={idx} className="last10-item">
              {win.winner} <span>({win.round})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpinGamePage;
