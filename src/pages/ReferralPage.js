import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ReferralPage() {
  const [user, setUser] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get('/users/me');
      setUser(res.data);
      setReferralLink(`${window.location.origin}/signup?ref=${res.data.id}`);
      setEarnings(res.data.referralEarnings || 0);
      setHistory(res.data.referralHistory || []);
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ maxWidth: 540, margin: "40px auto", background: "#fff", borderRadius: 10, padding: 32, boxShadow: "0 1px 8px #dbeafe" }}>
      <h2 style={{ color: "#fb923c" }}>Referral & Earn</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#888", fontSize: 15 }}>Your Invite Link</label>
          <input
            style={{ width: "100%", padding: 8, fontSize: 16, marginTop: 4, border: "1px solid #ccc", borderRadius: 4 }}
            value={referralLink}
            readOnly
          />
        </div>
        <button
          style={{ padding: "10px 18px", marginLeft: 5, background: copied ? "#22c55e" : "#6366f1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ==== SOCIAL SHARE SECTION HERE ==== */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ color: "#888", fontSize: 14 }}>Share Via Social</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563eb", fontWeight: 500 }}
        >
          Facebook
        </a>
        <a
          href={`https://x.com/intent/tweet?url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#111", fontWeight: 500 }}
        >
          X (Twitter)
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563eb", fontWeight: 500 }}
        >
          LinkedIn
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#25D366", fontWeight: 500 }}
        >
          WhatsApp
        </a>
      </div>
      {/* ==== END SOCIAL SHARE ==== */}

      {/* Earnings & History */}
      <div style={{ marginTop: 32 }}>
        <div style={{ marginBottom: 14, fontSize: 17 }}>
          <b>Total Referral Earnings:</b> <span style={{ color: "#16a34a" }}>₹{earnings}</span>
        </div>
        <div style={{ fontSize: 16, marginBottom: 8, fontWeight: 600 }}>Referral History</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, maxHeight: 170, overflow: "auto", background: "#f8fafc" }}>
          <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: 8 }}>User</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#888", padding: 14 }}>No referrals yet.</td></tr>}
              {history.map((h, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 7 }}>{h.referredUser || "N/A"}</td>
                  <td style={{ padding: 7 }}>₹{h.amount}</td>
                  <td style={{ padding: 7 }}>{h.note || "Rewarded"}</td>
                  <td style={{ padding: 7 }}>{h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
