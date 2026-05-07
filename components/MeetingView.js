'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, CheckCircle, Target, MessageSquare } from 'lucide-react';

export default function MeetingView({ onBack, user }) {
  const [items, setItems] = useState([]);
  const [goal, setGoal] = useState(null);
  const [nextGoal, setNextGoal] = useState('');
  const [loading, setLoading] = useState(true);

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
      setItems(itemsData);
      setGoal(goalData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswer = async (id, answer) => {
    try {
      await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answer }),
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetGoal = async () => {
    if (!nextGoal.trim()) return;
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
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>読み込み中...</div>;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn" style={{ padding: '8px', borderRadius: '50%', background: 'white' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '24px' }}>家族会議モード</h2>
      </header>

      {/* 今週の目標振り返り */}
      <div className="glass-card" style={{ background: 'var(--accent)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} /> 今週の目標
        </h3>
        <p style={{ fontSize: '20px', fontWeight: 600 }}>{goal?.content || '未設定'}</p>
      </div>

      {/* ホメ・改善一覧 */}
      <h3 style={{ margin: '24px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={20} /> 今週の振り返り
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => (
          <motion.div key={item.id} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className={`badge ${item.type === 'ホメ' ? 'badge-home' : 'badge-kaizen'}`}>
                {item.type}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                {item.from} → {item.to}
              </span>
            </div>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>{item.content}</p>
            
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
              <input 
                className="input" 
                style={{ padding: '8px 12px', fontSize: '14px' }}
                placeholder="アンサーを入力..."
                defaultValue={item.answer}
                onBlur={(e) => handleUpdateAnswer(item.id, e.target.value)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 来週の目標 */}
      <div className="glass-card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>🎯 来週の目標</h3>
        <textarea
          className="input"
          style={{ height: '80px', marginBottom: '12px' }}
          placeholder="来週の目標を入力..."
          value={nextGoal}
          onChange={(e) => setNextGoal(e.target.value)}
        />
        <button onClick={handleSetGoal} className="btn btn-accent" style={{ width: '100%' }}>
          <CheckCircle size={18} /> 目標を確定する
        </button>
      </div>
    </div>
  );
}
