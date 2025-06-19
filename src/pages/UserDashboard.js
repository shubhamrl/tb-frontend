import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState({ email: "", balance: 0, id: "" });
  const navigate = useNavigate();

  // Example: Fetch user data from backend (modify URL as needed)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Replace URL as per your backend route
        const token = localStorage.getItem("token");
        const res = await fetch("https://tb-backend-1.onrender.com/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        // If not logged in, redirect to login
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // WhatsApp deposit handler
  const handleDeposit = () => {
    const message = `नमस्ते, मेरा यूजर आईडी: ${user.id}, ईमेल: ${user.email}\nमुझे अपने अकाउंट में ₹ [AMOUNT] डिपॉजिट करना है। (न्यूनतम ₹100, अधिकतम ₹10,000)`;
    window.open(
      `https://wa.me/7770023792?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // WhatsApp withdrawal handler
  const handleWithdraw = () => {
    const message = `नमस्ते, मेरा यूजर आईडी: ${user.id}, ईमेल: ${user.email}\nमैं अपने अकाउंट से ₹ [AMOUNT] विड्रॉल करना चाहता हूँ। (न्यूनतम ₹200, अधिकतम ₹10,000)`;
    window.open(
      `https://wa.me/7770023792?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        padding: "24px",
        borderRadius: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
        background: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "18px" }}>यूजर डैशबोर्ड</h2>
      <div style={{ marginBottom: "15px", fontWeight: 600 }}>
        <div>ईमेल: {user.email}</div>
        <div>बैलेंस: ₹{user.balance}</div>
        <div>यूजर आईडी: {user.id}</div>
      </div>
      <div style={{ marginBottom: "32px" }}>
        <button
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            background: "#1FA863",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleDeposit}
        >
          डिपॉजिट करें
        </button>
        <div
          style={{
            fontSize: "14px",
            color: "#888",
            marginTop: "2px",
            textAlign: "center",
          }}
        >
          (न्यूनतम ₹100 | अधिकतम ₹10,000)
        </div>
      </div>
      <div>
        <button
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            background: "#F44336",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleWithdraw}
        >
          विड्रॉल करें
        </button>
        <div
          style={{
            fontSize: "14px",
            color: "#888",
            marginTop: "2px",
            textAlign: "center",
          }}
        >
          (न्यूनतम ₹200 | अधिकतम ₹10,000)
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
