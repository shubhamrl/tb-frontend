import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
import '../styles/game.css';

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

const socket = io('https://tb-backend-1.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 20000,
});

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

export default function TBGamePage() {
  const [inputValues, setInputValues] = useState({});
  const [highlighted, setHighlighted] = useState([]);
  const [lastWins, setLastWins] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('tbLastWins') || '[]');
    return Array.isArray(stored) ? stored : [];
  });

  // Live state from /live-state
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(90);
  const [bets, setBets] = useState({});
  const [winnerChoice, setWinnerChoice] = useState(null);
  const [displayedWinner, setDisplayedWinner] = useState(null);
  const [balance, setBalance] = useState(0);

  // LOCAL userBets (immediate update UI me) -- yahi use karo
  const [userBets, setUserBets] = useState({});
  const [lastRound, setLastRound] = useState(1); // For reset

  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await api.get('/bets/live-state');
        setCurrentRound(res.data.round);
        setTimer(res.data.timer);
        setBets(res.data.totals || {});
        setWinnerChoice(res.data.winnerChoice || null);
        if (typeof res.data.balance === "number") setBalance(res.data.balance);

        // === FIX: Always set userBets from backend every fetch ===
        if (res.data.userBets) {
          setUserBets(res.data.userBets);
        } else {
          setUserBets({});
        }
      } catch (err) {
        console.error("Error fetching live state:", err);
        // On error, show empty bets
        setUserBets({});
        setBets({});
      }
    };
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentRound]);

  // ========== Reset Highlights & Bets on New Round ==========
  useEffect(() => {
    if (currentRound !== lastRound) {
      setHighlighted([]);
      setInputValues({});
      setUserBets({});
      setLastRound(currentRound);
    }
  }, [currentRound, lastRound]);
  // ===========================================================

  useEffect(() => {
    const winnerListener = ({ round, choice }) => {
      setWinnerChoice(choice);
      setDisplayedWinner(choice);
      setLastWins(prev => {
        const updated = [choice, ...prev].slice(0, 10);
        localStorage.setItem('tbLastWins', JSON.stringify(updated));
        return updated;
      });
      setTimeout(() => setDisplayedWinner(null), 3000);
    };
    socket.on('winner-announced', winnerListener);

    return () => {
      socket.off('winner-announced', winnerListener);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      api.post('/bets/distribute-payouts', { round: currentRound })
        .catch(() => {});
    }
    // eslint-disable-next-line
  }, [timer, currentRound]);

  const handleInputChange = (name, val) => {
    if (/^\d*$/.test(val)) {
      setInputValues(prev => ({ ...prev, [name]: val }));
    }
  };

  // ======= Place Bet Function - Fully Optimistic UI =======
  const placeBetHandler = async (name) => {
    const amt = parseInt(inputValues[name] || '0', 10);
    if (timer <= 15) {
      alert('Betting closed for the last 15 seconds');
      return;
    }
    if (amt <= 0) return;
    if (balance < amt) {
      alert('Insufficient balance');
      return;
    }
    // === UI ko turant update kar do! ===
    setHighlighted(h => (h.includes(name) ? h : [...h, name]));
    setUserBets(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + amt
    }));
    setBalance(prev => prev - amt);
    setInputValues(iv => ({ ...iv, [name]: '' }));
    // === Backend API (async) ===
    try {
      await api.post('/bets/place-bet', { choice: name, amount: amt, round: currentRound });
      // Optionally handle server-side error by refreshing state
    } catch (e) {
      alert(e.response?.data?.message || 'Bet failed');
      // On error, ideally refresh state from backend:
      // Try to fetch live state again to sync
      try {
        const res = await api.get('/bets/live-state');
        setUserBets(res.data.userBets || {});
        setBalance(res.data.balance || 0);
      } catch {}
    }
  };

  return (
    <div className="game-container">
      {/* Sticky Header: Round, Timer, Balance */}
      <div className="tb-sticky-header">
        <div className="tb-round">Round: {currentRound}</div>
        <div className="tb-timer">⏱️ {timer}s</div>
        <div className="tb-balance">💰 ₹{balance}</div>
      </div>
      {/* Image Grid */}
      <div className="image-grid">
        {IMAGE_LIST.map(item => (
          <div
            key={item.name}
            className={`card ${highlighted.includes(item.name) ? 'selected' : ''}`}
          >
            <img src={item.src} alt={EN_TO_HI[item.name] || item.name} />
            <p className="name">{EN_TO_HI[item.name] || item.name}</p>
            {/* BET: always show actual userBets (backend source of truth) */}
            <p className="bet">₹{userBets[item.name] || 0}</p>
            <div className="bet-input-row">
              <input
                type="text"
                disabled={timer <= 15}
                value={inputValues[item.name] || ''}
                onChange={e => handleInputChange(item.name, e.target.value)}
                placeholder="₹"
              />
              <button
                disabled={timer <= 15}
                onClick={() => placeBetHandler(item.name)}
              >
                Bet
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Winner Box */}
      <div className="right-panel">
        <div
          className="winner-box"
          style={{
            margin: '1rem auto',
            padding: '1rem',
            background: '#ffe082',
            borderRadius: '8px',
            textAlign: 'center',
            width: '220px',
            minHeight: '140px'
          }}
        >
          {displayedWinner ? (
            <>
              <img
                src={`/images/${displayedWinner}.png`}
                alt={EN_TO_HI[displayedWinner] || displayedWinner}
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
              />
              <p
                style={{
                  margin: '0.5rem 0',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                🎉 {(EN_TO_HI[displayedWinner] || displayedWinner).toUpperCase()} 🎉
              </p>
            </>
          ) : (
            <p style={{ margin: '0', color: '#555' }}>Waiting for winner...</p>
          )}
        </div>
        {/* Last 10 Wins Section */}
        <div className="last-wins">
          <h4>📜 Last 10 Wins</h4>
          <ul>
            {lastWins.map((w, i) => (
              <li key={i}>{(EN_TO_HI[w] || w).toUpperCase()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
