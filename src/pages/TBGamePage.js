import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ADD THIS
import io from 'socket.io-client';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/game.css';

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
  const [lastWins, setLastWins] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(90);
  const [bets, setBets] = useState({});
  const [winnerChoice, setWinnerChoice] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userBets, setUserBets] = useState({});
  const [lastRound, setLastRound] = useState(1);
  const winnerTimeoutRef = useRef(null);

  // LOADER STATES
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingWins, setLoadingWins] = useState(true);

  // ⭐️ React Router navigation
  const navigate = useNavigate();

  // 1️⃣ LIVE STATE FETCH (every second)
  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await api.get('/bets/live-state');
        setCurrentRound(res.data.round);
        setTimer(res.data.timer);
        setBets(res.data.totals || {});
        setWinnerChoice(res.data.winnerChoice || null);
        if (typeof res.data.balance === "number") setBalance(res.data.balance);
        if (res.data.userBets) setUserBets(res.data.userBets);
        else setUserBets({});
        setLoadingGame(false); // Hide loader after first success
      } catch {
        setUserBets({});
        setBets({});
        setLoadingGame(false);
      }
    };
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2️⃣ LAST 10 WINS FETCH
  useEffect(() => {
    const fetchLastWins = async () => {
      try {
        const res = await api.get('/bets/last-wins');
        setLastWins(Array.isArray(res.data.wins) ? res.data.wins : []);
        setLoadingWins(false); // Hide loader after first success
      } catch {
        setLastWins([]);
        setLoadingWins(false);
      }
    };
    fetchLastWins();
    socket.on('payouts-distributed', fetchLastWins);
    return () => {
      socket.off('payouts-distributed', fetchLastWins);
    };
  }, []);

  // 3️⃣ TIMER 5 pe WINNER ANNOUNCE KARO (no payout, only announcement)
  useEffect(() => {
    if (timer === 5 && currentRound) {
      api.post('/bets/announce-winner', { round: currentRound }).catch(() => {});
    }
  }, [timer, currentRound]);

  // 4️⃣ SOCKET SE WINNER-ANNOUNCED PAR WINNER BOX SHOW KARO
  useEffect(() => {
    const winnerAnnounceHandler = ({ round, choice }) => {
      setWinnerChoice(choice || null);
      setShowWinner(true);
      if (winnerTimeoutRef.current) clearTimeout(winnerTimeoutRef.current);
      winnerTimeoutRef.current = setTimeout(() => setShowWinner(false), 10000);
    };
    socket.on('winner-announced', winnerAnnounceHandler);
    return () => {
      socket.off('winner-announced', winnerAnnounceHandler);
      if (winnerTimeoutRef.current) clearTimeout(winnerTimeoutRef.current);
    };
  }, []);

  // 5️⃣ TIMER 0 pe PAYOUT KARO
  useEffect(() => {
    if (timer === 0 && currentRound) {
      api.post('/bets/distribute-payouts', { round: currentRound }).catch(() => {});
    }
  }, [timer, currentRound]);

  // 6️⃣ NEW ROUND RESET LOGIC
  useEffect(() => {
    if (currentRound !== lastRound) {
      setHighlighted([]);
      setInputValues({});
      setUserBets({});
      setShowWinner(false);
      setLastRound(currentRound);
    }
  }, [currentRound, lastRound]);

  // BET INPUT HANDLER
  const handleInputChange = (name, val) => {
    if (/^\d*$/.test(val)) {
      setInputValues(prev => ({ ...prev, [name]: val }));
    }
  };

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
    setHighlighted(h => (h.includes(name) ? h : [...h, name]));
    setUserBets(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + amt
    }));
    setBalance(prev => prev - amt);
    setInputValues(iv => ({ ...iv, [name]: '' }));
    try {
      await api.post('/bets/place-bet', { choice: name, amount: amt, round: currentRound });
    } catch (e) {
      alert(e.response?.data?.message || 'Bet failed');
      try {
        const res = await api.get('/bets/live-state');
        setUserBets(res.data.userBets || {});
        setBalance(res.data.balance || 0);
      } catch {}
    }
  };

  // SHOW LOADER WHILE INITIAL DATA LOADING
  if (loadingGame || loadingWins) {
    return <Loader />;
  }

  return (
    <div className="game-container">
     

      <div className="tb-sticky-header">
        <div className="tb-round">Round: {currentRound}</div>
        <div className="tb-timer">⏱️ {timer}s</div>
        <div className="tb-balance">💰 ₹{balance}</div>
      </div>
      <div className="image-grid">
        {IMAGE_LIST.map(item => (
          <div
            key={item.name}
            className={`card ${highlighted.includes(item.name) ? 'selected' : ''}`}
          >
            <img src={item.src} alt={EN_TO_HI[item.name] || item.name} />
            <p className="name">{EN_TO_HI[item.name] || item.name}</p>
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
          {showWinner && winnerChoice ? (
            <>
              <img
                src={`/images/${winnerChoice}.png`}
                alt={EN_TO_HI[winnerChoice] || winnerChoice}
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
              />
              <p
                style={{
                  margin: '0.5rem 0',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                🎉 {(EN_TO_HI[winnerChoice] || winnerChoice).toUpperCase()} 🎉
              </p>
            </>
          ) : (
            <p style={{ margin: '0', color: '#555' }}>Waiting for winner...</p>
          )}
        </div>
             {/* ⭐️ My Bet History Button */}
      <button
        style={{
          position: 'absolute',
          top: 18,
          right: 36,
          zIndex: 20,
          background: '#36d7b7',
          color: '#fff',
          padding: '8px 20px',
          border: 'none',
          borderRadius: '22px',
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: 1,
          boxShadow: '0 4px 18px #0002',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/bet-history')}
      >
        My Bet History
      </button>
        <div className="last-wins">
          <h4>📜 Last 10 Wins</h4>
          <ul>
            {lastWins.map((w, i) => {
              const round = w && typeof w.round !== 'undefined' ? w.round : "-";
              const choice = w && w.choice ? w.choice : "-";
              const name = (EN_TO_HI[choice] || choice).toUpperCase();
              return (
                <li key={i}>
                  <b>Round {round}:</b> {name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
