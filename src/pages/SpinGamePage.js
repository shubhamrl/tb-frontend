// src/pages/SpinGamePage.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/spin.css';

const ROW1 = [0, 1, 2, 3, 4];
const ROW2 = [5, 6, 7, 8, 9];

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
      if (timer === 16) {
        // Bet close
      }
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
      fetchLast10Wins();
      fetchUser();
      setTimeout(() => setWinner(null), 5000);
    } catch {}
  };

  // --- Wheel Animation ---
  const startWheelSpin = () => {
    setSpinning(true);
    let fast = 0;
    let slow = 0;
    // Fast spin for 5 sec
    const fastSpin = setInterval(() => {
      setSpinAngle((prev) => prev + 30);
      fast++;
      if (fast >= 50) {
        clearInterval(fastSpin);
        // Slow spin for 5 sec
        const slowSpin = setInterval(() => {
          setSpinAngle((prev) => prev + 6);
          slow++;
          if (slow >= 50) {
            clearInterval(slowSpin);
            setSpinning(false);
          }
        }, 100);
      }
    }, 20);
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

      {/* Wheel */}
      <div className="wheel-section">
        <div
          className={`spin-wheel ${spinning ? "spinning" : ""} ${winner !== null ? "winner-show" : ""}`}
          style={{
            transform: `rotate(${spinAngle}deg)`,
            transition: spinning ? "transform 0.2s linear" : "none",
          }}
        >
          <span className="wheel-center-text">
            {winner !== null ? `Winner: ${winner}` : "SPIN"}
          </span>
        </div>
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
      {timer <= 15 && <div className="bet-section-closed">Betting Closed!</div>}

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
