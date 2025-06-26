// src/pages/SpinGamePage.js
import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import '../styles/spin.css';

const ROW1 = [0, 1, 2, 3, 4];
const ROW2 = [5, 6, 7, 8, 9];
const SEGMENT_COLORS = [
  '#FFEB3B', '#FF9800', '#8BC34A', '#03A9F4', '#E91E63',
  '#00BCD4', '#9C27B0', '#CDDC39', '#FF5722', '#607D8B'
];

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

const SpinGamePage = () => {
  const [balance, setBalance] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(90);
  const [selected, setSelected] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [userBets, setUserBets] = useState({});
  const [lastWins, setLastWins] = useState([]);
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  // NEW: For auto spinning wheel in last 10 sec
  const spinIntervalRef = useRef(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // Poll everything every 1s
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const roundRes = await api.get('/spin/round');
        setRound(roundRes.data.round);
        setTimer(roundRes.data.timer);

        // /api/users/me is used here (not /user/me)
        const userRes = await api.get('/users/me');
        setBalance(userRes.data.balance ?? 0);

        const betsRes = await api.get(`/spin/bets/${roundRes.data.round}`);
        const thisUserId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
        const myBets = betsRes.data.bets.filter(b => b.user === thisUserId);
        const betsObj = {};
        myBets.forEach(b => { betsObj[b.choice] = (betsObj[b.choice] || 0) + b.amount; });
        setUserBets(betsObj);

        const winsRes = await api.get('/spin/last-wins');
        setLastWins(winsRes.data.wins || []);
      } catch {}
    };
    fetchAll();
    const interval = setInterval(fetchAll, 1000);
    return () => clearInterval(interval);
  }, []);

  // Place Bet
  const handlePlaceBet = async () => {
    if (selected === null || !betAmount || Number(betAmount) <= 0) return;
    try {
      await api.post('/spin/bet', {
        choice: selected,
        amount: Number(betAmount)
      });
      setBetAmount('');
    } catch (err) {
      alert(err.response?.data?.error || "Bet failed");
    }
  };

  // Auto spinning logic (wheel spin in last 10 sec, then stop on winner)


useEffect(() => {
  if (timer === 10 && !isAutoSpinning) {
    setIsAutoSpinning(true);
    spinIntervalRef.current = setInterval(() => {
      setSpinAngle(prev => prev + 32);
    }, 60);
  }
  if (timer === 0 && isAutoSpinning) {
    setIsAutoSpinning(false);
    clearInterval(spinIntervalRef.current);
    fetchWinnerAndSpin();
  }
  return () => clearInterval(spinIntervalRef.current);
  // eslint-disable-next-line
}, [timer]);

  // Winner par rukwao (arrow ke aage winner)
  const fetchWinnerAndSpin = async () => {
    try {
      const res = await api.get(`/spin/winner/${round}`);
      setWinner(res.data.winner);

      const winnerNum = res.data.winner;
      const currentSpin = spinAngle % 360;
      const targetAngle = (360 - (winnerNum * 36)) - 90;
      const finalAngle = currentSpin + (4 * 360) + (targetAngle - currentSpin);

      setSpinning(true);
      setSpinAngle(finalAngle);

      setTimeout(() => {
        setSpinning(false);
      }, 2200);
      setTimeout(() => setWinner(null), 4800);
    } catch (err) {}
  };

  // --- UI Render ---
  return (
    // <div className="spin-game-container">
    //   <div className="top-bar">
    //     <span>Balance: ₹{balance}</span>
    //     <span>Round: {round}</span>
    //     <span className={timer <= 15 ? "timer closed" : "timer"}>
    //       {timer > 0 ? `Time left: ${timer}s` : "Waiting..."}
    //     </span>
    //   </div>
    //   <div className="wheel-section" style={{ position: "relative", width: "100%", maxWidth: 240, margin: "0 auto 25px auto" }}>
    //     <div
    //       style={{
    //         position: 'absolute',
    //         left: '50%',
    //         top: 'calc(100% - 4px)',
    //         transform: 'translateX(-50%) rotate(180deg)',
    //         zIndex: 2,
    //         width: 0,
    //         height: 0,
    //         borderLeft: '14px solid transparent',
    //         borderRight: '14px solid transparent',
    //         borderTop: '32px solid #fb923c',
    //       }}
    //     />
    //     <svg
    //       width="100%"
    //       height="100%"
    //       viewBox="0 0 200 200"
    //       className="spin-wheel-svg"
    //       style={{
    //         display: 'block',
    //         margin: 'auto',
    //         borderRadius: '50%',
    //         background: 'linear-gradient(135deg, #a7c7e7 85%, #dbeafe 100%)',
    //         boxShadow: '0 2px 14px #b7b7b7',
    //         transform: `rotate(${spinAngle}deg)`,
    //         transition: spinning
    //           ? "transform 2.2s cubic-bezier(.34,1.56,.64,1)"
    //           : isAutoSpinning
    //           ? "transform 0.08s linear"
    //           : "transform 0.5s cubic-bezier(.34,1.56,.64,1)"
    //       }}
    //     >
    //       {Array.from({ length: 10 }).map((_, i) => {
    //         const angle = (i * 36 + 18 - 90) * (Math.PI / 180);
    //         const x = 100 + 75 * Math.cos(angle);
    //         const y = 100 + 75 * Math.sin(angle);
    //         return (
    //           <g key={i}>
    //             <path
    //               d={describeArc(100, 100, 95, i * 36, (i + 1) * 36)}
    //               fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
    //               stroke="#fff"
    //               strokeWidth="2"
    //             />
    //             <text
    //               x={x}
    //               y={y}
    //               textAnchor="middle"
    //               alignmentBaseline="middle"
    //               fill="#222"
    //               fontSize="22"
    //               fontWeight={winner === i ? "bold" : "600"}
    //               style={{
    //                 textShadow: winner === i ? "0 0 6px #f59e42" : "none",
    //                 fill: winner === i ? "#dc2626" : "#222",
    //                 userSelect: 'none',
    //               }}
    //               transform={`rotate(${i * 36 + 18} ${x} ${y})`}
    //             >
    //               {i}
    //             </text>
    //           </g>
    //         );
    //       })}
    //       <circle cx={100} cy={100} r={40} fill="#dbeafe" />
    //     </svg>
    //   </div>
    //   <div className="numbers-section">
    //     <div className="numbers-row">
    //       {ROW1.map((num) => (
    //         <div
    //           key={num}
    //           className={`number-box ${selected === num ? "selected" : ""}`}
    //           onClick={() => timer > 15 && setSelected(num)}
    //         >
    //           <div>{num}</div>
    //           <div className="bet-amount">
    //             {userBets[num] ? `₹${userBets[num]}` : ""}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //     <div className="numbers-row">
    //       {ROW2.map((num) => (
    //         <div
    //           key={num}
    //           className={`number-box ${selected === num ? "selected" : ""}`}
    //           onClick={() => timer > 15 && setSelected(num)}
    //         >
    //           <div>{num}</div>
    //           <div className="bet-amount">
    //             {userBets[num] ? `₹${userBets[num]}` : ""}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    //   <div className="bet-section">
    //     <input
    //       type="number"
    //       min={1}
    //       placeholder="Bet Amount"
    //       value={betAmount}
    //       onChange={(e) => setBetAmount(e.target.value)}
    //       disabled={timer <= 15 || selected === null}
    //     />
    //     <button
    //       onClick={handlePlaceBet}
    //       disabled={timer <= 15 || selected === null || !betAmount}
    //     >
    //       Place Bet
    //     </button>
    //   </div>
    //   <div className="last10-wins-section">
    //     <h4>Last 10 Wins</h4>
    //     <div className="last10-list">
    //       {lastWins.map((win, idx) => (
    //         <div key={idx} className="last10-item">
    //           {win.winner !== undefined ? win.winner : '-'} <span>({win.round})</span>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
                          <div>
    <h4>COMING SOON </h4>
    </div> );
};

export default SpinGamePage;
