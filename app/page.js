'use client';
import { useState, useEffect } from 'react';
import UserSelection from '@/components/UserSelection';
import QuickPost from '@/components/QuickPost';
import MeetingView from '@/components/MeetingView';
import Settings from '@/components/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Settings as SettingsIcon, LogOut, Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [meetingDay, setMeetingDay] = useState(6); // Default Saturday
  const [devMode, setDevMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    // Load config from LocalStorage
    const savedUser = localStorage.getItem('famtalk_user');
    const savedDay = localStorage.getItem('famtalk_meeting_day');
    const savedDevMode = localStorage.getItem('famtalk_dev_mode');

    if (savedUser) setUser(savedUser);
    if (savedDay !== null) setMeetingDay(parseInt(savedDay));
    if (savedDevMode === 'true') setDevMode(true);
    
    setIsConfigLoaded(true);
    fetchGoal();
  }, []);

  // Save config when changed
  useEffect(() => {
    if (isConfigLoaded) {
      localStorage.setItem('famtalk_meeting_day', meetingDay);
      localStorage.setItem('famtalk_dev_mode', devMode);
    }
  }, [meetingDay, devMode, isConfigLoaded]);

  const fetchGoal = async () => {
    try {
      const res = await fetch('/api/goal');
      const data = await res.json();
      setCurrentGoal(data?.error ? null : data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    localStorage.setItem('famtalk_user', selectedUser);
    setUser(selectedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('famtalk_user');
    setUser(null);
  };

  const today = new Date().getDay();
  const isMeetingOpen = devMode || today === meetingDay;

  if (!isConfigLoaded) return null;

  if (!user) {
    return <UserSelection onSelect={handleUserSelect} />;
  }

  if (isMeetingMode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="meeting"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <MeetingView onBack={() => setIsMeetingMode(false)} user={user} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="header-title" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>FamTalk</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 500 }}>Hello, {user} ✨</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="btn"
            style={{ padding: '10px', background: 'white', borderRadius: '14px', minWidth: '44px' }}
          >
            <SettingsIcon size={22} color="var(--text-light)" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="btn"
            style={{ padding: '10px', background: 'white', borderRadius: '14px', minWidth: '44px' }}
          >
            <LogOut size={22} color="var(--text-light)" />
          </motion.button>
        </div>
      </header>

      {/* 今週の目標 */}
      <motion.div 
        layoutId="goal-card"
        className="glass-card" 
        style={{ 
          background: 'linear-gradient(135deg, #66bb6a, #43a047)', 
          color: 'white',
          border: 'none',
          boxShadow: '0 12px 30px rgba(67, 160, 71, 0.3)',
          padding: '28px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', opacity: 0.9 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '10px' }}>
            <Target size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>This Week's Goal</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '24px', width: '90%', opacity: 0.2, borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '24px', width: '70%', opacity: 0.2, borderRadius: '8px' }} />
          </div>
        ) : currentGoal && currentGoal.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentGoal.map((goal, idx) => (
              <div key={goal.id} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                <div style={{ fontSize: '18px', marginTop: '2px' }}>🎯</div>
                <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4 }}>{goal.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>今週の目標を立てましょう！</h2>
        )}
      </motion.div>

      {/* クイック投稿 */}
      <QuickPost user={user} onPost={() => {}} />

      {/* 家族会議ボタン */}
      <div style={{ marginTop: '32px' }}>
        <AnimatePresence>
          {isMeetingOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="floating"
            >
              <button 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  fontSize: '20px', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--primary), #ec407a)',
                  boxShadow: '0 15px 35px rgba(244, 143, 177, 0.4)'
                }}
                onClick={() => setIsMeetingMode(true)}
              >
                家族会議をはじめる 🚀
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                textAlign: 'center', 
                padding: '24px', 
                borderRadius: '24px',
                background: 'rgba(0,0,0,0.03)',
                color: 'var(--text-light)', 
                fontSize: '15px',
                fontWeight: 500,
                border: '2px dashed rgba(0,0,0,0.05)'
              }}
            >
              次の会議は {['日', '月', '火', '水', '木', '金', '土'][meetingDay]}曜日 です 🛋️
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSettings && (
          <Settings 
            onClose={() => setShowSettings(false)}
            meetingDay={meetingDay}
            setMeetingDay={setMeetingDay}
            devMode={devMode}
            setDevMode={setDevMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
