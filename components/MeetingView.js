'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle, Target, MessageSquare, Heart, Zap, Save, Loader2 } from 'lucide-react';

export default function MeetingView({ onBack, user }) {
  const [items, setItems] = useState([]);
  const [goal, setGoal] = useState(null);
  const [nextGoal, setNextGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, goalRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/goal'),
      ]);
      const itemsData = await itemsRes.json();
      const goalData = await goalRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setGoal(goalData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswer = async (id, answer) => {
    setSavingId(id);
    try {
      await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answer }),
      });
      // Update local state to avoid full refetch
      setItems(items.map(item => item.id === id ? { ...item, answer } : item));
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setSavingId(null), 1000);
    }
  };

  const handleSetGoal = async () => {
    if (!nextGoal.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: nextGoal }),
      });
      setNextGoal('');
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const homeCount = items.filter(i => i.type === 'ホメ').length;
  const kaizenCount = items.filter(i => i.type === '改善').length;

  if (loading && items.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      <p style={{ color: 'var(--text-light)' }}>家族会議を準備中...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="btn" 
          style={{ padding: '10px', borderRadius: '50%', background: 'white', minWidth: '44px' }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>家族会議</h2>
      </header>

      {/* 統計セクション */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ flex: 1, margin: 0, padding: '12px 8px', textAlign: 'center', background: 'var(--primary-light)' }}>
          <Heart size={20} fill="var(--primary)" color="var(--primary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{homeCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>ホメ</div>
        </div>
        <div className="glass-card" style={{ flex: 1, margin: 0, padding: '12px 8px', textAlign: 'center', background: 'var(--secondary-light)' }}>
          <Zap size={20} fill="var(--secondary)" color="var(--secondary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{kaizenCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>改善</div>
        </div>
      </div>

      {/* 今週の目標振り返り */}
      <div className="glass-card" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2e7d32' }}>
          <Target size={18} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>今週の目標</span>
        </div>
        <p style={{ fontSize: '20px', fontWeight: 700, color: '#1b5e20' }}>{goal?.content || '未設定'}</p>
      </div>

      {/* ホメ・改善一覧 */}
      <h3 style={{ margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
        <MessageSquare size={22} /> 今週のログ
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '24px' }}>
            今週の投稿はありません 🕊️
          </div>
        ) : items.map((item, index) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card" 
            style={{ padding: '20px', background: 'white' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className={`badge ${item.type === 'ホメ' ? 'badge-home' : 'badge-kaizen'}`}>
                {item.type}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 500 }}>
                {item.from} → {item.to}
              </span>
            </div>
            <p style={{ fontSize: '17px', marginBottom: '16px', fontWeight: 500, lineHeight: 1.5 }}>{item.content}</p>
            
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', position: 'relative' }}>
              <input 
                className="input" 
                style={{ padding: '12px 16px', fontSize: '14px', background: 'rgba(0,0,0,0.02)' }}
                placeholder="アンサーを入力..."
                defaultValue={item.answer}
                onBlur={(e) => handleUpdateAnswer(item.id, e.target.value)}
              />
              <div style={{ position: 'absolute', right: '12px', bottom: '12px', color: 'var(--accent)' }}>
                {savingId === item.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : item.answer ? (
                  <Save size={16} opacity={0.3} />
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 来週の目標 */}
      <div className="glass-card" style={{ marginTop: '40px', background: 'white' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎯 来週の目標
        </h3>
        <textarea
          className="input"
          style={{ height: '100px', marginBottom: '16px', resize: 'none' }}
          placeholder="来週の目標を入力..."
          value={nextGoal}
          onChange={(e) => setNextGoal(e.target.value)}
        />
        <button onClick={handleSetGoal} className="btn btn-accent" style={{ width: '100%' }}>
          <CheckCircle size={18} /> 目標を確定する
        </button>
      </div>

      <div style={{ height: '40px' }} />
    </div>
  );
}
