import React from 'react';
import { NavLink } from 'react-router-dom';

const sidebarStyle = {
  width: '210px',
  minHeight: '100vh',
  background: '#183153',
  color: '#fff',
  padding: '32px 12px',
  boxSizing: 'border-box',
  position: 'fixed',
  left: 0,
  top: 0,
  fontSize: '18px'
};
const linkStyle = {
  display: 'block',
  color: '#fff',
  textDecoration: 'none',
  margin: '18px 0',
  padding: '10px 20px',
  borderRadius: '6px',
  fontWeight: 500
};
const activeStyle = {
  background: '#fff',
  color: '#183153',
  fontWeight: 700
};

const AdminSidebar = () => (
  <nav style={sidebarStyle}>
    <h2 style={{ color: '#f8e71c', marginBottom: 35 }}>Admin Panel</h2>
    <NavLink
      to="/admin"
      style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}
    >
      Dashboard
    </NavLink>
    <NavLink
      to="/admin/whatsapp"
      style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}
    >
      WhatsApp Settings
    </NavLink>
    <NavLink
      to="/admin/manage-user"
      style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}
    >
      Search / Manage User
    </NavLink>
    <NavLink
      to="/admin/summary"
      style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}
    >
      Today Rounds Summary
    </NavLink>
    <NavLink
      to="/admin/spin-winner"
      style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}
    >
      Spin Winner (Manual)
    </NavLink>
  </nav>
);

export default AdminSidebar;
