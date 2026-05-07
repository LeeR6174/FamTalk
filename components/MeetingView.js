'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Target, MessageSquare, Heart, Zap, Save, Loader2, Plus, Trash2 } from 'lucide-react';

const STAGES = [
  { id: 'review', title: '先週の目標の振り返り', icon: <Target size={20} /> },
  { id: 'next', title: '来週の目標設定', icon: <CheckCircle size={20} /> },
  { id: 'kaizen', title: '改善の振り返り', icon: <Zap size={20} /> },
  { id: 'praise', title: 'ホメの振り返り', icon: <Heart size={20} /> }
];

export default function MeetingView({ onBack, user }) {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [nextGoals, setNextGoals] = useState(['']);
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
      setGoals(Array.isArray(goalData) ? goalData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswer = async (id, answer, isGoal = false) => {
    setSavingId(id);
    try {
      await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answer }),
      });
      if (isGoal) {
        setGoals(goals.map(g => g.id === id ? { ...g, answer } : g));
      } else {
        setItems(items.map(item => item.id === id ? { ...item, answer } : item));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setSavingId(null), 800);
    }
  };

  const handleAddNextGoal = () => setNextGoals([...nextGoals, '']);
  const handleRemoveNextGoal = (index) => setNextGoals(nextGoals.filter((_, i) => i !== index));
  const handleNextGoalChange = (index, value) => {
    const updated = [...nextGoals];
    updated[index] = value;
    setNextGoals(updated);
  };

  const handleSaveAllGoals = async () => {
    const validGoals = nextGoals.filter(g => g.trim() !== '');
    if (validGoals.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(validGoals.map(content => 
        fetch('/api/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
      ));
      onBack();
    } catch (error) {
      console.error(error);
      alert('目標の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0 && goals.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      <p style={{ color: 'var(--text-light)' }}>会議資料を準備中...</p>
    </div>
  );

  const currentStage = STAGES[step];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={step === 0 ? onBack : () => setStep(step - 1)} 
          className="btn" 
          style={{ padding: '10px', borderRadius: '50%', background: 'white', minWidth: '44px' }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
            STEP {step + 1} OF 4
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{currentStage.title}</h2>
        </div>
      </header>

      {/* プログレスバー */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
        {STAGES.map((_, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              height: '6px', 
              borderRadius: '3px', 
              background: i <= step ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
              transition: 'background 0.5s'
            }} 
          />
        ))}
      </div>

      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* ステージ1: 目標評価 */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {goals.length === 0 ? (
                  <EmptyState message="今週設定した目標はありません 🎯" />
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className="glass-card" style={{ background: 'white', padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <Target size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{goal.content}</h4>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '8px' }}>達成度・振り返り</p>
                        <textarea 
                          className="input" 
                          style={{ height: '80px', fontSize: '14px', background: 'rgba(0,0,0,0.02)', padding: '12px' }}
                          placeholder="できたこと、できなかったことを記入..."
                          defaultValue={goal.answer}
                          onBlur={(e) => handleUpdateAnswer(goal.id, e.target.value, true)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', color: 'var(--accent)' }}>
                          {savingId === goal.id ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} opacity={0.3} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ステージ2: 次週目標 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {nextGoals.map((goal, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      className="input"
                      placeholder={`来週の目標 ${idx + 1}...`}
                      value={goal}
                      onChange={(e) => handleNextGoalChange(idx, e.target.value)}
                    />
                    {nextGoals.length > 1 && (
                      <button 
                        onClick={() => handleRemoveNextGoal(idx)}
                        style={{ background: 'var(--primary-light)', border: 'none', padding: '12px', borderRadius: '12px', color: '#ad1457' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={handleAddNextGoal}
                  className="btn"
                  style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-dark)', width: '100%', border: '2px dashed rgba(0,0,0,0.1)' }}
                >
                  <Plus size={20} /> 目標を追加
                </button>
              </div>
            )}

            {/* ステージ3: 改善 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.filter(i => i.type === '改善').length === 0 ? (
                  <EmptyState message="今週の改善案はありませんでした ✨" />
                ) : (
                  items.filter(i => i.type === '改善').map(item => (
                    <ItemCard key={item.id} item={item} onUpdate={handleUpdateAnswer} savingId={savingId} />
                  ))
                )}
              </div>
            )}

            {/* ステージ4: ホメ */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.filter(i => i.type === 'ホメ').length === 0 ? (
                  <EmptyState message="今週のホメはありませんでした 🕊️" />
                ) : (
                  items.filter(i => i.type === 'ホメ').map(item => (
                    <ItemCard key={item.id} item={item} onUpdate={handleUpdateAnswer} savingId={savingId} />
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* フッターナビ */}
      <footer style={{ marginTop: '40px', paddingBottom: '20px' }}>
        {step < 3 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '18px' }}
          >
            次へ進む <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleSaveAllGoals}
            disabled={loading || nextGoals.every(g => !g.trim())}
            className="btn btn-accent"
            style={{ width: '100%', padding: '18px', fontSize: '18px' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> 会議を終了する</>}
          </button>
        )}
      </footer>
    </div>
  );
}

function ItemCard({ item, onUpdate, savingId }) {
  return (
    <div className="glass-card" style={{ padding: '20px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
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
          placeholder="アンサー・コメントを入力..."
          defaultValue={item.answer}
          onBlur={(e) => onUpdate(item.id, e.target.value)}
        />
        <div style={{ position: 'absolute', right: '12px', bottom: '12px', color: 'var(--accent)' }}>
          {savingId === item.id ? <Loader2 className="animate-spin" size={16} /> : item.answer ? <Save size={16} opacity={0.3} /> : null}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '24px' }}>
      <p style={{ fontSize: '16px' }}>{message}</p>
    </div>
  );
}
