import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManageUserPage = () => {
  const [users, setUsers] = useState([]);
  const [editAmounts, setEditAmounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Fetch users (with optional search)
  const fetchUsers = async (search = '') => {
    try {
      const params = search.trim() ? { search } : {};
      const res = await api.get('/admin/users', { params });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.users || [];
      // Sort: newest first
      setUsers(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setTotalUsers(data.total || 0);
      setActiveUsers(data.active || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setTotalUsers(0);
      setActiveUsers(0);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = () => { fetchUsers(searchTerm); };

  const handleBalanceChange = (id, value) => {
    setEditAmounts(prev => ({ ...prev, [id]: value }));
  };

  const updateBalance = async (id, isAdd) => {
    try {
      const val = Number(editAmounts[id] || 0);
      const amount = isAdd ? val : -val;
      const res = await api.put(`/admin/users/${id}/balance`, { amount });
      setUsers(users.map(u =>
        u._id === id ? { ...u, balance: res.data.balance } : u
      ));
      alert(`Balance updated: ₹${res.data.balance}`);
      setEditAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Error updating balance:', err);
      alert('Error updating balance');
    }
  };

  // Referral reward
  const handleReward = async (userId) => {
    if (!window.confirm("Are you sure to give referral reward?")) return;
    try {
      await api.post(`/admin/users/${userId}/reward-referral`);
      alert('Referral reward given!');
      fetchUsers(searchTerm);
    } catch (err) {
      alert(err?.response?.data?.message || "Reward failed");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Enter user ID or email"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginRight: '0.5rem', padding: '0.5rem' }}
      />
      <button onClick={handleSearch}>Search</button>

      <h2 style={{ marginTop: '2rem' }}>Manage User Balances</h2>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        maxHeight: 320,
        overflowY: 'auto',
        marginBottom: 28
      }}>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Balance</th>
              <th>Amount</th>
              <th>Actions</th>
              <th>Referral Reward</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>₹{user.balance}</td>
                <td>
                  <input
                    type="number"
                    value={editAmounts[user._id] || ''}
                    onChange={e => handleBalanceChange(user._id, e.target.value)}
                    placeholder="₹"
                    style={{ width: '80px', padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <button onClick={() => updateBalance(user._id, true)}>Add</button>{' '}
                  <button onClick={() => updateBalance(user._id, false)}>Minus</button>
                </td>
                <td>
                  {(user.referrerId && !user.referralRewarded) ? (
                    <button
                      style={{
                        background: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '7px 16px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleReward(user._id)}
                    >
                      Reward
                    </button>
                  ) : user.referralRewarded ? (
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>Rewarded</span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <b>Total Users:</b> {totalUsers} &nbsp; | &nbsp;
        <b>Active (last 10 min):</b> {activeUsers}
      </div>
    </div>
  );
};

export default ManageUserPage;
