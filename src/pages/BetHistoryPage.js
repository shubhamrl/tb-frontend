import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import api from "../services/api";

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
      <h2 style={{ textAlign: "center", marginBottom: 22 }}>📜 My Bet History</h2>
      {loading ? <Loader /> : (
        history.length === 0 ?
          <div style={{ color: "#888", textAlign: "center" }}>No bets placed yet.</div>
          :
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 17, background: "#f7f7ff"
          }}>
            <thead>
              <tr style={{ background: "#eceeff" }}>
                <th style={thStyle}>Round</th>
                <th style={thStyle}>Bets Placed</th>
                <th style={thStyle}>Win Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} style={{
                  background: row.win ? "#eaffea" : "#fff"
                }}>
                  <td style={tdStyle}>{row.round}</td>
                  <td style={tdStyle}>
                    {row.bets.map((b, j) =>
                      <span key={j}>
                        <b>{b.choice[0].toUpperCase() + b.choice.slice(1)}</b>: ₹{b.amount}
                        {j !== row.bets.length - 1 && ", "}
                      </span>
                    )}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: row.win ? "#0a8e16" : "#c10c0c",
                    fontWeight: 600
                  }}>
                    {row.win && row.winAmount > 0 ? `₹${row.winAmount}` : "-"}
                  </td>
                </tr>
              ))}
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
