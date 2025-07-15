import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/game.css';

const EN_TO_HI = {
  umbrella: 'छतरी', football: 'फुटबॉल', sun: 'सूरज', diya: 'दीया', cow: 'गाय', bucket: 'बाल्टी',
  kite: 'पतंग', spinningTop: 'भंवरा', rose: 'गुलाब', butterfly: 'तितली', pigeon: 'कबूतर', rabbit: 'खरगोश'
};

const socket = io('https://tb-backend-1.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 20000,
});

const IMAGE_LIST = [
  { name: 'umbrella', src: '/images/umbrella.png' },
  { name: 'football', src: '/images/Football.png' },
  { name: 'sun', src: '/images/sun.png' },
  { name: 'diya', src: '/images/diya.png' },
  { name: 'cow', src: '/images/cow.png' },
  { name: 'bucket', src: '/images/Bucket.png' },
  { name: 'kite', src: '/images/kite.png' },
  { name: 'spinningTop', src: '/images/spinning_Top.png' },
  { name: 'rose', src: '/images/rose.png' },
  { name: 'butterfly', src: '/images/Butterfly.png' },
  { name: 'pigeon', src: '/images/pigeon.png' },
  { name: 'rabbit', src: '/images/rabbit.png' }
];

const COINS = [10, 20, 30, 40, 50, 100];

export default function TBGamePage() {
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const [lastWins, setLastWins] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(40);
  const [bets, setBets] = useState({});
  const [winnerChoice, setWinnerChoice] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userBets, setUserBets] = useState({});
  const winnerTimeoutRef = useRef(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingWins, setLoadingWins] = useState(true);

  // LIVE STATE FETCH & strict reset on round change!
  useEffect(() => {
    let prevRound = -1;
    const fetchLiveState = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/bets/live-state', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentRound(res.data.round);
        setTimer(res.data.timer);
        setBets(res.data.totals || {});
        setWinnerChoice(res.data.winnerChoice || null);
        setBalance(typeof res.data.balance === "number" ? res.data.balance : 0);
        setUserBets(res.data.userBets || {});
        setLoadingGame(false);

        // Hard reset all bets on round switch (no carry forward ever!)
        if (prevRound !== -1 && prevRound !== res.data.round) {
          setUserBets({});
          setBets({});
          setWinnerChoice(null);
          setShowWinner(false);
          setHighlighted([]);
          setSelectedCoin(null);
        }
        prevRound = res.data.round;
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

  // LAST 10 WINS FETCH (no token needed)
  useEffect(() => {
    const fetchLastWins = async () => {
      try {
        const res = await api.get('/bets/last-wins');
        setLastWins(Array.isArray(res.data.wins) ? res.data.wins : []);
        setLoadingWins(false);
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

  // TIMER 10 pe LOCK WINNER (admin/auto)
  useEffect(() => {
    if (timer === 10 && currentRound) {
      const token = localStorage.getItem('token');
      api.post('/bets/lock-winner', { round: currentRound }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }, [timer, currentRound]);

  // TIMER 5 pe WINNER ANNOUNCE (API call)
  useEffect(() => {
    if (timer === 5 && currentRound) {
      const token = localStorage.getItem('token');
      api.post('/bets/announce-winner', { round: currentRound }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }, [timer, currentRound]);

  // SOCKET WINNER-ANNOUNCED
  useEffect(() => {
    const winnerAnnounceHandler = ({ round, choice }) => {
      setWinnerChoice(choice || null);
    };
    socket.on('winner-announced', winnerAnnounceHandler);
    return () => {
      socket.off('winner-announced', winnerAnnounceHandler);
    };
  }, []);

  // WINNER POPUP: Only timer===5 pe popup dikhana, 5 sec tak
  useEffect(() => {
    if (timer === 5 && winnerChoice) {
      setShowWinner(true);
      if (winnerTimeoutRef.current) clearTimeout(winnerTimeoutRef.current);
      winnerTimeoutRef.current = setTimeout(() => setShowWinner(false), 5000); // exactly 5 sec
    }
  }, [timer, winnerChoice]);

  // TIMER 0 pe PAYOUT
  useEffect(() => {
    if (timer === 0 && currentRound) {
      const token = localStorage.getItem('token');
      api.post('/bets/distribute-payouts', { round: currentRound }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }, [timer, currentRound]);

  // COIN SELECT & BET LOGIC
  const handleCoinSelect = (value) => setSelectedCoin(value);
  const handleImageBet = async (name) => {
    if (!selectedCoin) return alert("Select a coin first!");
    if (timer <= 15) return alert('Betting closed for the last 15 seconds');
    if (balance < selectedCoin) return alert('Insufficient balance');
    setHighlighted(h => (h.includes(name) ? h : [...h, name]));
    setUserBets(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + selectedCoin
    }));
    setBalance(prev => prev - selectedCoin);
    try {
      const token = localStorage.getItem('token');
      await api.post('/bets/place-bet', { choice: name, amount: selectedCoin, round: currentRound }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Success pe backend state fetch karein (optional), ya next interval pe aa jayega
    } catch (e) {
      alert(e.response?.data?.message || 'Bet failed');
      setUserBets(prev => ({
        ...prev,
        [name]: (prev[name] || 0) - selectedCoin
      }));
      setBalance(prev => prev + selectedCoin);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/bets/live-state', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserBets(res.data.userBets || {});
        setBalance(res.data.balance || 0);
      } catch {}
    }
  };

  const userTotalBet = Object.values(userBets || {}).reduce((sum, val) => sum + val, 0);

  if (loadingGame || loadingWins) {
    return <Loader />;
  }

  return (
  <div className="tb-game-root">
    {/* Top Row: Profile | Balance | Last Win */}
    <div className="tb-header-row">
      <img
        src="/images/profile.png"
        alt="profile"
        className="tb-profile-pic"
        style={{ cursor: "pointer" }}
        onClick={() => navigate('/dashboard')}
      />
      <div className="tb-balance-row">
        <img src="/images/coin.png" alt="coin" className="tb-coin-icon" />
        <span>₹{balance}</span>
      </div>
      <button className="tb-last-win-btn" onClick={() => document.getElementById('tb-lastwin-modal').showModal()}>
        <img src="/images/trophy.png" alt="last win" />
      </button>
    </div>
    {/* Round and Timer */}
    <div className="tb-round-timer-row">
      <div className="tb-round">Round: #{currentRound}</div>
      <div className="tb-timer">⏱ {timer}s</div>
    </div>
    {/* Images */}
    <div className="tb-image-flex">
      {IMAGE_LIST.map((item) => (
        <div
          key={item.name}
          className={`tb-card ${highlighted.includes(item.name) ? 'selected' : ''} ${winnerChoice === item.name && showWinner ? 'winner' : ''}`}
          onClick={() => handleImageBet(item.name)}
          style={{ cursor: timer <= 15 ? "not-allowed" : "pointer" }}
        >
          <img src={item.src} alt={EN_TO_HI[item.name] || item.name} />
          {!!userBets[item.name] &&
            <div className="tb-card-coin">
              <img src="/images/coin.png" alt="coin" />
              <span>{userBets[item.name]}</span>
            </div>
          }
          <div className="tb-card-label">{EN_TO_HI[item.name]}</div>
        </div>
      ))}
    </div>
    {/* Winner Popup */}
    <div className="tb-winner-popup-block">
      {!winnerChoice && timer <= 5 &&
        <div className="tb-winner-pending">Status: Pending...</div>
      }
      {showWinner && winnerChoice &&
        <div className="tb-winner-popup">
          <img src={`/images/${winnerChoice}.png`} alt={winnerChoice} />
          <div className="tb-winner-label">
            🎉 {(EN_TO_HI[winnerChoice] || winnerChoice).toUpperCase()} 🎉
          </div>
        </div>
      }
    </div>
    {/* Bet Bar */}
    <div className="tb-total-bet-row">
      <span>Your Bet This Round: </span>
      <b>₹{userTotalBet}</b>
    </div>
    {/* Coins Row */}
    <div className="tb-coin-row">
      {COINS.map(val => (
        <button
          key={val}
          className={`tb-coin-btn ${selectedCoin === val ? 'selected' : ''}`}
          onClick={() => handleCoinSelect(val)}
          disabled={timer <= 15}
        >
          <img src="/images/coin.png" alt="coin" />
          <span>{val}</span>
        </button>
      ))}
    </div>
    {/* Coin Cancel Button */}
    {selectedCoin &&
      <button
        className="tb-coin-cancel-btn"
        onClick={() => setSelectedCoin(null)}
      >
        Cancel Coin
      </button>
    }
    {/* Last Win Modal */}
    <dialog id="tb-lastwin-modal" className="tb-lastwin-modal">
      <div className="tb-lastwin-modal-content">
        <h2 className="tb-lastwin-title">🏆 Last 10 Wins</h2>
        <ul className="tb-lastwin-list">
          {lastWins.map((w, i) => {
            const round = w && typeof w.round !== 'undefined' ? w.round : "-";
            const choice = w && w.choice ? w.choice : "-";
            const name = (EN_TO_HI[choice] || choice).toUpperCase();
            return (
              <li key={i}>
                <span className="tb-lastwin-round">Round {round}:</span>{" "}
                <span className="tb-lastwin-choice">{name}</span>
              </li>
            );
          })}
        </ul>
        <button className="tb-lastwin-close-btn" onClick={() => document.getElementById('tb-lastwin-modal').close()}>
          Close
        </button>
      </div>
    </dialog>
  </div>
);
}
