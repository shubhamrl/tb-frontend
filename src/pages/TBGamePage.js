import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
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
  const [displayedWinner, setDisplayedWinner] = useState(null);
  const [balance, setBalance] = useState(0);
  const [userBets, setUserBets] = useState({});
  const [lastRound, setLastRound] = useState(1);

  // Fetch live-state and last-wins from backend
  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await api.get('/bets/live-state');
        setCurrentRound(res.data.round);
        setTimer(res.data.timer);
        setBets(res.data.totals || {});
        setWinnerChoice(res.data.winnerChoice || null);
        if (typeof res.data.balance === "number") setBalance(res.data.balance);

        if (res.data.userBets) {
          setUserBets(res.data.userBets);
        } else {
          setUserBets({});
        }
      } catch (err) {
        setUserBets({});
        setBets({});
      }
    };
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch last wins from backend, always show latest
  useEffect(() => {
    const fetchLastWins = async () => {
      try {
        const res = await api.get('/bets/last-wins');
        setLastWins(Array.isArray(res.data.wins) ? res.data.wins : []);
      } catch {
        setLastWins([]);
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

  // Winner display: Jab bhi winnerChoice update ho, displayedWinner set kar
  useEffect(() => {
    if (winnerChoice) {
      setDisplayedWinner(winnerChoice);
    } else {
      setDisplayedWinner(null);
    }
  }, [winnerChoice]);

  // Socket pe winner refresh: har round ke winner event par bhi winnerChoice update karo
  useEffect(() => {
    const refreshWinner = async () => {
      try {
        const res = await api.get('/bets/live-state');
        setWinnerChoice(res.data.winnerChoice || null);
      } catch {}
    };
    socket.on('winner-announced', refreshWinner);
    socket.on('payouts-distributed', refreshWinner);
    return () => {
      socket.off('winner-announced', refreshWinner);
      socket.off('payouts-distributed', refreshWinner);
    };
  }, []);

  // Next round pe sab reset kar do (highlight, input, userbets, winner, etc)
  useEffect(() => {
    if (currentRound !== lastRound) {
      setHighlighted([]);
      setInputValues({});
      setUserBets({});
      setDisplayedWinner(null);
      setLastRound(currentRound);
    }
  }, [currentRound, lastRound]);

  // Timer 0 pe payout trigger
  useEffect(() => {
    if (timer === 0) {
      api.post('/bets/distribute-payouts', { round: currentRound }).catch(() => {});
    }
  }, [timer, currentRound]);

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
