'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Target, MessageSquare, Heart, Zap, Save, Loader2, Plus, Trash2, PartyPopper, RefreshCw } from 'lucide-react';

const STAGES = [
  { id: 'review', title: '先週の振り返り', icon: <Target size={20} /> },
  { id: 'next', title: '来週の目標を作成', icon: <CheckCircle size={20} /> },
  { id: 'kaizen', title: '改善してほしいこと', icon: <Zap size={20} /> },
  { id: 'praise', title: 'ホメ', icon: <Heart size={20} /> }
];

export default function MeetingView({ onBack, user, meetingOffset = 0 }) {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [nextGoals, setNextGoals] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCutIn, setShowCutIn] = useState(true);

  const calculateMeetingCount = useCallback(() => {
    const baselineDate = new Date('2026-05-09');
    const baselineCount = 63;
    const today = new Date();
    const diffTime = today - baselineDate;
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return baselineCount + diffWeeks - meetingOffset;
  }, [meetingOffset]);

  const meetingNumber = calculateMeetingCount();

  const getMeetingPeriod = useCallback((number) => {
    const baselineDate = new Date('2026-05-09');
    const baselineCount = 63;
    const offsetWeeks = number - baselineCount;
    const meetingDate = new Date(baselineDate.getTime() + offsetWeeks * 7 * 24 * 60 * 60 * 1000);
    const startDate = new Date(meetingDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(meetingDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    
    const formatDate = (d) => {
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
      return `${month}/${date}(${dayOfWeek})`;
    };
    
    return `${formatDate(startDate)} 〜 ${formatDate(endDate)}`;
  }, []);

  const meetingPeriod = getMeetingPeriod(meetingNumber);

  const getMeetingQueryDates = useCallback(() => {
    const toISODate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    };

    const end = new Date(Date.now() - meetingOffset * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(Date.now() - (meetingOffset + 1) * 7 * 24 * 60 * 60 * 1000);

    return {
      startDate: toISODate(start),
      endDate: toISODate(end)
    };
  }, [meetingOffset]);

  const { startDate, endDate } = getMeetingQueryDates();

  const fetchData = useCallback(async (silent = false) => {
    // 入力中はバックグラウンド更新をスキップ（カーソル飛び防止）
    if (silent && (
      document.activeElement?.tagName === 'INPUT' || 
      document.activeElement?.tagName === 'TEXTAREA'
    )) {
      return;
    }

    if (!silent) setLoading(true);
    try {
      const { startDate, endDate } = getMeetingQueryDates();
      const [itemsRes, goalRes] = await Promise.all([
        fetch(`/api/items?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/goal?startDate=${startDate}&endDate=${endDate}`),
      ]);
      const itemsData = await itemsRes.json();
      const goalData = await goalRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setGoals(Array.isArray(goalData) ? goalData : []);
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getMeetingQueryDates]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
    
    // 2秒後にカットインを非表示にする
    const cutInTimer = setTimeout(() => {
      setShowCutIn(false);
    }, 2500);

    return () => {
      clearTimeout(cutInTimer);
    };
  }, [fetchData]);

  const handleUpdateAnswer = async (id, answer, isGoal = false) => {
    setSavingId(id);
    try {
      await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answer }),
      });
      if (isGoal) {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, answer } : g));
      } else {
        setItems(prev => prev.map(item => item.id === id ? { ...item, answer } : item));
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
    if (validGoals.length === 0) {
      setIsFinished(true);
      return;
    }
    
    setLoading(true);
    try {
      const goalDate = new Date(Date.now() - meetingOffset * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await Promise.all(validGoals.map(content => 
        fetch('/api/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, user, date: goalDate }),
        })
      ));
      setIsFinished(true);
    } catch (error) {
      console.error(error);
      alert('目標の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (showCutIn) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ fontSize: '24px', fontWeight: 600, opacity: 0.8, letterSpacing: '4px' }}>ファムトーク</span>
            <h1 style={{ fontSize: '64px', fontWeight: 900, margin: '20px 0', textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              第 {meetingNumber} 回<br />家族会議
            </h1>
            <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.9, display: 'block', marginTop: '-10px', marginBottom: '20px' }}>
              対象期間: {meetingPeriod}
            </span>
            <motion.div 
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{ height: '4px', background: 'white', borderRadius: '2px', margin: '0 auto', maxWidth: '300px' }} 
            />
            <p style={{ marginTop: '20px', fontSize: '18px', fontWeight: 500 }}>スタート！ 🚀</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isFinished) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '32px', margin: '0 auto 32px' }}>
            <PartyPopper size={40} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>会議お疲れ様でした！</h2>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginBottom: '48px' }}>
            来週も一緒に頑張ろう！
          </p>
          <button 
            className="btn btn-primary" 
            style={{ padding: '16px 32px', borderRadius: '16px' }}
            onClick={onBack}
          >
            ホームに戻る
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading && items.length === 0 && goals.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      <p style={{ color: 'var(--text-light)' }}>会議資料を準備中...</p>
    </div>
  );

  const currentStage = STAGES[step];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              第{meetingNumber}回 家族会議 ({meetingPeriod}) • ステップ {step + 1} / 4
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{currentStage.title}</h2>
          </div>
        </div>

        {/* 手動更新ボタン */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => fetchData(false)}
          disabled={loading}
          className="btn"
          style={{ 
            padding: '10px', 
            borderRadius: '14px', 
            background: 'white', 
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          title="データを更新"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} color="var(--primary)" />
          ) : (
            <RefreshCw size={20} color="var(--text-light)" />
          )}
        </motion.button>
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
            {/* ステージ1: 先週の振り返り */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {goals.filter(g => g.date === startDate).length === 0 ? (
                  <EmptyState message="振り返る目標がありません 🎯" />
                ) : (
                  goals.filter(g => g.date === startDate).map(goal => (
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

            {/* ステージ2: 来週の目標 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>来週の目標を立てましょう！</p>
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

            {/* ステージ3: 改善してほしいこと */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AddMeetingItemForm 
                  type="改善" 
                  user={user} 
                  meetingOffset={meetingOffset} 
                  onItemAdded={(newItem) => setItems(prev => [...prev, newItem])} 
                />
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
                <AddMeetingItemForm 
                  type="ホメ" 
                  user={user} 
                  meetingOffset={meetingOffset} 
                  onItemAdded={(newItem) => setItems(prev => [...prev, newItem])} 
                />
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
            disabled={loading}
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

const AddMeetingItemForm = memo(({ type, user, meetingOffset, onItemAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const to = user === 'あき' ? 'ゆうき' : 'あき';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const itemDate = new Date(Date.now() - meetingOffset * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, from: user, to, date: itemDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setContent('');
        const newItem = {
          id: data.id,
          content: content,
          type: type,
          from: user,
          to: to,
          date: itemDate,
          answer: ''
        };
        onItemAdded(newItem);
      } else {
        alert('追加に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setContent('');
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.65)', border: '2px dashed rgba(33, 150, 243, 0.25)', marginBottom: '16px', boxShadow: 'none' }}>
      <h5 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        会議中に追加で書き込む 📝
      </h5>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          className="input"
          style={{ padding: '10px 14px', fontSize: '14px', flex: 1, borderRadius: '12px', background: 'white' }}
          placeholder={`${to}への${type}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '12px', minWidth: '70px', height: '40px' }}
          disabled={loading || !content.trim()}
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : '追加'}
        </button>
      </form>
    </div>
  );
});

const ItemCard = memo(({ item, onUpdate, savingId }) => {
  return (
    <div className="glass-card" style={{ padding: '20px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className={`badge ${item.type === 'ホメ' ? 'badge-home' : 'badge-kaizen'}`}>
          {item.type}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600 }}>
          {item.from} → <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.to}</span>
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
});

const EmptyState = memo(({ message }) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '24px' }}>
      <p style={{ fontSize: '16px' }}>{message}</p>
    </div>
  );
});

AddMeetingItemForm.displayName = 'AddMeetingItemForm';
ItemCard.displayName = 'ItemCard';
EmptyState.displayName = 'EmptyState';
