import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import api from "../services/api";
import "../styles/bet-history.css"; // 👈 add this

const EN_TO_HI = {
  umbrella: 'छतरी', football: 'फुटबॉल', sun: 'सूरज', diya: 'दीया', cow: 'गाय', bucket: 'बाल्टी',
  kite: 'पतंग', spinningTop: 'भंवरा', rose: 'गुलाब', butterfly: 'तितली', pigeon: 'कबूतर', rabbit: 'खरगोश'
};

export default function BetHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get("/bets/my-bet-history")
      .then(res => {
        setHistory(res.data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bh-root">
      <h2 className="bh-heading">
        <span className="bh-heading-icon">📜</span> My Bet History (Today)
      </h2>
      {loading ? <Loader /> : (
        history.length === 0 ?
          <div className="bh-empty">No bets placed in this session.</div>
          :
          <div className="bh-table-wrapper">
            <table className="bh-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Bets Placed</th>
                  <th>Winning Image</th>
                  <th>Win Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => {
                  const winImage = row.winner || "";
                  return (
                    <tr key={i} className={row.winAmount > 0 ? "bh-row-win" : ""}>
                      <td>{row.round}</td>
                      <td>
                        {row.bets.map((b, j) => {
                          const isWin = winImage === b.choice && row.winAmount > 0;
                          return (
                            <span key={j}>
                              <b className={isWin ? "bh-highlight" : ""}>
                                {EN_TO_HI[b.choice] || b.choice}
                              </b>: ₹{b.amount}
                              {j !== row.bets.length - 1 && ", "}
                            </span>
                          );
                        })}
                      </td>
                      <td>
                        {winImage
                          ? <span className="bh-win-img">{EN_TO_HI[winImage] || winImage}</span>
                          : "-"}
                      </td>
                      <td>
                        {row.winAmount > 0
                          ? <span className="bh-amount-win">₹{row.winAmount}</span>
                          : <span className="bh-amount-lose">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
}
