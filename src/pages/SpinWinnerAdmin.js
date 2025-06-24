import React, { useEffect, useState } from "react";
import api from "../services/api";

// 0-9 numbers for the wheel
const ROW1 = [0, 1, 2, 3, 4];
const ROW2 = [5, 6, 7, 8, 9];

const SpinWinnerAdmin = () => {
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(90);
  const [betSummary, setBetSummary] = useState({}); // {number: totalAmount}
  const [selected, setSelected] = useState(null);
  const [setting, setSetting] = useState(false);
  const [lastWins, setLastWins] = useState([]);

  // Fetch round and timer
  const fetchRound = async () => {
    try {
      const res = await api.get("/spin/round"); // API: current round, timer
      setRound(res.data.round);
      setTimer(res.data.timer);
    } catch {}
  };

  // Fetch bet summary (total bet per number for this round)
  const fetchBetSummary = async () => {
    try {
      const res = await api.get(`/spin/bets/summary/${round}`); // API: total bets per number
      setBetSummary(res.data.summary || {});
    } catch {}
  };

  // Fetch last 10 wins
  const fetchLastWins = async () => {
    try {
      const res = await api.get("/spin/last-wins");
      setLastWins(res.data.wins || []);
    } catch {}
  };

  useEffect(() => {
    fetchRound();
    fetchLastWins();
    // Timer interval for live update
    const interval = setInterval(() => {
      fetchRound();
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (round) fetchBetSummary();
    // eslint-disable-next-line
  }, [round]);

  // Set winner (manual)
  const handleSetWinner = async () => {
    if (selected === null) return;
    setSetting(true);
    try {
      await api.post("/spin/set-winner", {
        round,
        winner: selected,
      });
      setSelected(null);
      fetchLastWins();
      alert("Winner set successfully!");
    } catch (err) {
      alert("Failed to set winner.");
    }
    setSetting(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h2 style={{ textAlign: "center", marginBottom: 18, fontWeight: 700 }}>Spin to Win – Manual Winner</h2>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, marginBottom: 8 }}>
        <span>Round: <b>{round}</b></span>
        <span>Timer: <b style={{ color: timer <= 15 ? "#dc2626" : "#2563eb" }}>{timer}s</b></span>
      </div>

      {/* Numbers, 2 rows */}
      <div style={{ margin: "15px 0 8px 0" }}>
        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginBottom: 12 }}>
          {ROW1.map((num) => (
            <div
              key={num}
              style={{
                width: 50,
                height: 55,
                borderRadius: 15,
                border: selected === num ? "3px solid #1e40af" : "2px solid #e5e7eb",
                background: selected === num ? "#dbeafe" : "#fff",
                color: selected === num ? "#1e40af" : "#0f172a",
                boxShadow: selected === num ? "0 3px 9px #b6d4fe" : "0 1px 7px #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 21,
                position: "relative",
                transition: "all .18s"
              }}
              onClick={() => setSelected(num)}
            >
              {num}
              <span style={{ fontSize: 13, color: "#059669", fontWeight: 700, marginTop: 2 }}>
                ₹{betSummary[num] || 0}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginBottom: 7 }}>
          {ROW2.map((num) => (
            <div
              key={num}
              style={{
                width: 50,
                height: 55,
                borderRadius: 15,
                border: selected === num ? "3px solid #1e40af" : "2px solid #e5e7eb",
                background: selected === num ? "#dbeafe" : "#fff",
                color: selected === num ? "#1e40af" : "#0f172a",
                boxShadow: selected === num ? "0 3px 9px #b6d4fe" : "0 1px 7px #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 21,
                position: "relative",
                transition: "all .18s"
              }}
              onClick={() => setSelected(num)}
            >
              {num}
              <span style={{ fontSize: 13, color: "#059669", fontWeight: 700, marginTop: 2 }}>
                ₹{betSummary[num] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 20px 0" }}>
        <button
          onClick={handleSetWinner}
          disabled={selected === null || setting}
          style={{
            padding: "10px 38px",
            fontSize: 17,
            fontWeight: 700,
            background: selected !== null ? "#2563eb" : "#c7d3f8",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            boxShadow: selected !== null ? "0 3px 9px #b6d4fe" : "none",
            cursor: selected !== null ? "pointer" : "not-allowed",
            transition: "all 0.15s"
          }}
        >
          {setting ? "Setting..." : "Set Winner"}
        </button>
      </div>

      {/* Last 10 wins */}
      <div style={{ marginTop: 28 }}>
        <h4 style={{ marginBottom: 8, fontWeight: 700 }}>Last 10 Wins</h4>
        <table style={{ width: "100%", background: "#fff", borderRadius: 7, boxShadow: "0 1px 7px #e2e8f0" }}>
          <thead>
            <tr style={{ background: "#eff6ff" }}>
              <th style={{ padding: 7, fontWeight: 700, fontSize: 15 }}>Round</th>
              <th style={{ padding: 7, fontWeight: 700, fontSize: 15 }}>Winner</th>
              <th style={{ padding: 7, fontWeight: 700, fontSize: 15 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {lastWins.map((w, idx) => (
              <tr key={idx} style={{ textAlign: "center" }}>
                <td style={{ padding: 6 }}>{w.round}</td>
                <td style={{ padding: 6, fontWeight: 700, color: "#1e40af" }}>{w.winner}</td>
                <td style={{ padding: 6 }}>{w.time ? new Date(w.time).toLocaleTimeString() : "-"}</td>
              </tr>
            ))}
            {lastWins.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 12, color: "#666" }}>No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpinWinnerAdmin;
