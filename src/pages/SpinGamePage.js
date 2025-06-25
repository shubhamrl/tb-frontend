// src/pages/SpinGamePage.js

import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import '../styles/spin.css';

// Helper for SVG arc (same as before)
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
  // State
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

  // For advanced animation
  const spinningRef = useRef(false);
  const spinTargetAngleRef = useRef(0);
  const spinStartAngleRef = useRef(0);

  // 1. Fetch User Balance
  const fetchUser = async () => {
    try {
      const res = await api.get('/user/me');
      setBalance(res.data.balance ?? (res.data.user?.balance ?? 0));
    } catch {}
  };

  // 2. Fetch Round & Timer
  const fetchRound = async () => {
    try {
      const res = await api.get('/spin/round');
      setRound(res.data.round);
      setTimer(res.data.timer);
    } catch {}
  };

  // 3. Fetch Last 10 Wins
  const fetchLastWins = async () => {
    try {
      const res = await api.get('/spin/last-wins');
      setLastWins(res.data.wins || []);
    } catch {}
  };

  // 4. Fetch User's Bets for Current Round
  const fetchUserBets = async () => {
    try {
      // Get all bets of user for this round (may need endpoint, else calculate client-side)
      const res = await api.get(`/spin/bets/${round}`);
      const thisUserId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
      const myBets = res.data.bets.filter(b => b.user === thisUserId);
      const betsObj = {};
      myBets.forEach(b => { betsObj[b.choice] = (betsObj[b.choice] || 0) + b.amount; });
      setUserBets(betsObj);
    } catch {}
  };

  // Live update: Timer/round/bets
  useEffect(() => {
    fetchUser();
    fetchRound();
    fetchLastWins();

    const interval = setInterval(() => {
      fetchRound();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (round) fetchUserBets();
    // eslint-disable-next-line
  }, [round]);

  // 5. Bet Placement
  const handlePlaceBet = async () => {
    if (selected === null || !betAmount || Number(betAmount) <= 0) return;
    try {
      await api.post('/spin/bet', {
        choice: selected,
        amount: Number(betAmount),
      });
      fetchUser();
      fetchUserBets();
      setBetAmount('');
      // No alert, UI updates instantly!
    } catch (err) {}
  };

  // Wheel Spin Logic: Fast (timer 10-6), Slow (timer 5-0), Stop at Winner
  useEffect(() => {
    if (timer === 10) {
      startFastSpin();
    }
    if (timer === 5) {
      startSlowSpin();
    }
    if (timer === 0 && round) {
      // Get winner and stop wheel at winner
      fetchWinnerAndSpin();
    }
    // eslint-disable-next-line
  }, [timer, round]);

  // Fast Spin
  const startFastSpin = () => {
    spinningRef.current = true;
    let angle = spinAngle;
    let step = 27; // Fast speed
    let count = 0;
    const fastSpin = setInterval(() => {
      angle += step;
      setSpinAngle(angle);
      count++;
      if (count >= 25) { // ~5sec
        clearInterval(fastSpin);
      }
    }, 50);
  };

  // Slow Spin
  const startSlowSpin = () => {
    spinningRef.current = true;
    let angle = spinAngle;
    let step = 7; // Slow speed
    let count = 0;
    const slowSpin = setInterval(() => {
      angle += step;
      setSpinAngle(angle);
      count++;
      if (count >= 35) { // 5 sec
        clearInterval(slowSpin);
        spinningRef.current = false;
      }
    }, 70);
  };

  // Fetch Winner and Final Spin to Winner
  const fetchWinnerAndSpin = async () => {
    try {
      const res = await api.get(`/spin/winner/${round}`);
      setWinner(res.data.winner);

      // Calculate final angle so winner number comes at arrow (bottom, angle 90deg)
      const winnerNum = res.data.winner;
      const finalAngle =
        360 * 4 + // 4 full rounds for drama
        (360 - (winnerNum * 36)) - 90; // winner segment to bottom (90deg)
      setTimeout(() => {
        setSpinning(true);
        setSpinAngle(finalAngle);
        setTimeout(() => {
          setSpinning(false);
          fetchLastWins();
          fetchUser();
          setUserBets({});
        }, 2000); // 2s for final slow spin
      }, 500); // 0.5s delay before final spin
      // After few sec, reset winner for next round
      setTimeout(() => setWinner(null), 4800);
    } catch (err) {}
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
      <div className="wheel-section" style={{ position: "relative", width: "100%", maxWidth: 240, margin: "0 auto 25px auto" }}>
        {/* Arrow */}
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
            transition: spinning ? "transform 2.2s cubic-bezier(.34,1.56,.64,1)" : "transform 0.5s cubic-bezier(.34,1.56,.64,1)"
          }}
        >
          {/* Segments */}
          {Array.from({ length: 10 }).map((_, i) => {
            // For number placement in segment
            const angle = (i * 36 + 18 - 90) * (Math.PI / 180);
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
                  transform={`rotate(${i * 36 + 18} ${x} ${y})`}
                >
                  {i}
                </text>
              </g>
            );
          })}
          {/* Center circle – blank */}
          <circle cx={100} cy={100} r={40} fill="#dbeafe" />
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
