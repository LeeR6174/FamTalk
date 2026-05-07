'use client';
import { useState, useEffect } from 'react';
import UserSelection from '@/components/UserSelection';
import QuickPost from '@/components/QuickPost';
import MeetingView from '@/components/MeetingView';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [isSaturday, setIsSaturday] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user in LocalStorage
    const savedUser = localStorage.getItem('famtalk_user');
    if (savedUser) {
      setUser(savedUser);
    }

    // Check if today is Saturday
    const today = new Date();
    setIsSaturday(today.getDay() === 6);

    fetchGoal();
    setLoading(false);
  }, []);

  const fetchGoal = async () => {
    try {
      const res = await fetch('/api/goal');
      const data = await res.json();
      setCurrentGoal(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSelect = (selectedUser) => {
    localStorage.setItem('famtalk_user', selectedUser);
    setUser(selectedUser);
  };

  if (loading) return null;

  if (!user) {
    return <UserSelection onSelect={handleUserSelect} />;
  }

  if (isMeetingMode) {
    return <MeetingView onBack={() => setIsMeetingMode(false)} user={user} />;
  }

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-dark)' }}>FamTalk</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Welcome back, {user} ✨</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('famtalk_user');
            setUser(null);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
        >
          <Users size={24} />
        </button>
      </header>

      {/* 今週の目標 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ background: 'var(--accent)', color: 'var(--text-dark)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.8 }}>
          <Target size={18} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>今週の目標</span>
        </div>
        <h2 style={{ fontSize: '20px' }}>{currentGoal?.content || '目標を立てましょう！'}</h2>
      </motion.div>

      {/* クイック投稿 */}
      <QuickPost user={user} onPost={() => {}} />

      {/* 家族会議ボタン (土曜日のみ) */}
      <AnimatePresence>
        {isSaturday && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ marginTop: 'auto', paddingBottom: '20px' }}
          >
            <button 
              className="btn btn-primary floating" 
              style={{ width: '100%', padding: '20px', borderRadius: '24px', fontSize: '20px', background: 'linear-gradient(45deg, var(--primary), #f48fb1)' }}
              onClick={() => setIsMeetingMode(true)}
            >
              家族会議をはじめる 🚀
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSaturday && (
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)', fontSize: '14px' }}>
            土曜日になると家族会議モードがオープンします 🛋️
          </div>
      )}
    </div>
  );
}
