import React from 'react';
import '../styles/sidemenu.css';

const SideMenu = ({ open, onClose, user, numbers }) => {
  if (!open) return null;

  return (
    <div className="sidemenu-overlay" onClick={onClose}>
      <div className="sidemenu-drawer" onClick={e => e.stopPropagation()}>
        <button
          className="sidemenu-btn refer"
          onClick={() => window.location.href = '/referral'}
        >🎁 Refer & Earn ₹100</button>
        <button
          className="sidemenu-btn"
          onClick={() => window.location.href = `https://wa.me/${numbers.depositWhatsapp}?text=${encodeURIComponent(`I want to deposit. UserID: ${user.id}, Email: ${user.email}`)}`}
        >Deposit</button>
        <button
          className="sidemenu-btn"
          onClick={() => window.location.href = `https://wa.me/${numbers.withdrawWhatsapp}?text=${encodeURIComponent(`I want to withdraw. UserID: ${user.id}, Email: ${user.email}`)}`}
        >Withdraw</button>
        <button
          className="sidemenu-btn logout"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >Logout</button>

        <div className="sidemenu-tip">
          <div><b>TIP:</b></div>
          <div>
            डिपॉजिट: <b>₹100-₹10,000</b><br />
            विड्रॉल: <b>₹200-₹10,000</b><br />
            WhatsApp support se बात करें for help.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
