import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import api from "../services/api";

// ⭐️ Hindi mapping
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
    <div style={{
      maxWidth: 760, margin: "40px auto", background: "#fff",
      borderRadius: 16, boxShadow: "0 4px 28px #0001", padding: 28
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 22 }}>📜 My Bet History (Today)</h2>
      {loading ? <Loader /> : (
        history.length === 0 ?
          <div style={{ color: "#888", textAlign: "center" }}>No bets placed in this session.</div>
          :
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 17, background: "#f7f7ff"
          }}>
            <thead>
              <tr style={{ background: "#eceeff" }}>
                <th style={thStyle}>Round</th>
                <th style={thStyle}>Bets Placed</th>
                <th style={thStyle}>Winning Image</th>
                <th style={thStyle}>Win Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => {
                // Winner image directly from backend
                const winImage = row.winner || "";

                // Highlight color
                const highlightColor = "#26a641"; // Green
                return (
                  <tr key={i} style={{
                    background: row.winAmount > 0 ? "#eaffea" : "#fff"
                  }}>
                    <td style={tdStyle}>{row.round}</td>
                    <td style={tdStyle}>
                      {row.bets.map((b, j) => {
                        const isWin = winImage === b.choice && row.winAmount > 0;
                        return (
                          <span key={j}>
                            <b style={isWin ? { color: highlightColor, fontWeight: "bold" } : {}}>
                              {EN_TO_HI[b.choice] || b.choice}
                            </b>: ₹{b.amount}
                            {j !== row.bets.length - 1 && ", "}
                          </span>
                        )
                      })}
                    </td>
                    <td style={{
                      ...tdStyle,
                      color: winImage ? highlightColor : "#333",
                      fontWeight: winImage ? 700 : 500
                    }}>
                      {winImage ? (EN_TO_HI[winImage] || winImage) : "-"}
                    </td>
                    <td style={{
                      ...tdStyle,
                      color: row.winAmount > 0 ? "#0a8e16" : "#c10c0c",
                      fontWeight: 600
                    }}>
                      {row.winAmount > 0 ? `₹${row.winAmount}` : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px 8px", textAlign: "left", fontWeight: "bold", fontSize: 17
};
const tdStyle = {
  padding: "10px 8px", textAlign: "left"
};
