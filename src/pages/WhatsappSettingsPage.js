import React, { useEffect, useState } from 'react';
import api from '../services/api';

const WhatsappSettingsPage = () => {
  const [deposit, setDeposit] = useState('');
  const [withdraw, setWithdraw] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        setDeposit(res.data?.depositWhatsapp || '');
        setWithdraw(res.data?.withdrawWhatsapp || '');
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', {
        depositWhatsapp: deposit,
        withdrawWhatsapp: withdraw
      });
      setMsg('Updated!');
    } catch {
      setMsg('Failed');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>WhatsApp Number Settings</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Deposit WhatsApp: </label>
        <input value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="Deposit Number" style={{ marginRight: 8 }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Withdraw WhatsApp: </label>
        <input value={withdraw} onChange={e => setWithdraw(e.target.value)} placeholder="Withdraw Number" style={{ marginRight: 8 }} />
      </div>
      <button onClick={handleSave} disabled={loading}>Save</button>
      <span style={{ marginLeft: 10, color: msg === 'Updated!' ? 'green' : 'red' }}>{msg}</span>
    </div>
  );
};

export default WhatsappSettingsPage;
