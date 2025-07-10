import React, { useEffect, useState } from 'react';
import api from '../services/api';

// English to Hindi Mapping
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

const AdminRoundsSummary = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBetsAmount: 0,
    totalPayout: 0,
    profit: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/today-rounds-summary');
        setRounds(res.data.rounds || []);
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
      setLoading(false);
    };

    const fetchProfit = async () => {
      try {
        const res = await api.get('/bets/today-summary');
        setSummary(res.data || {});
      } catch (err) {
       
