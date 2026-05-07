'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Zap, CheckCircle2 } from 'lucide-react';

export default function QuickPost({ user, onPost }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('ホメ');
  const [to, setTo] = useState(user === 'あき' ? 'ゆうき' : 'あき');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, from: user, to }),
      });
      if (res.ok) {
        setContent('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (onPost) onPost();
      } else {
        alert('送信に失敗しました。Notionの設定を確認してください。');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--accent)'
            }}
          >
            <CheckCircle2 size={48} />
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-dark)' }}>送信しました！</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        クイック投稿
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="select-group" style={{ gap: '8px' }}>
          <button
            type="button"
            className={`tag-btn home ${type === 'ホメ' ? 'active' : ''}`}
            onClick={() => setType('ホメ')}
            style={{ padding: '14px 10px' }}
          >
            <Heart size={20} fill={type === 'ホメ' ? 'currentColor' : 'none'} />
            ホメ
          </button>
          <button
            type="button"
            className={`tag-btn kaizen ${type === '改善' ? 'active' : ''}`}
            onClick={() => setType('改善')}
            style={{ padding: '14px 10px' }}
          >
            <Zap size={20} fill={type === '改善' ? 'currentColor' : 'none'} />
            改善
          </button>
        </div>

        <textarea
          className="input"
          style={{ height: '140px', marginBottom: '20px', resize: 'none', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}
          placeholder={`${to}へのメッセージを入力...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button 
          className={`btn btn-primary`} 
          style={{ 
            width: '100%', 
            background: type === 'ホメ' ? 'linear-gradient(135deg, var(--primary), #ec407a)' : 'linear-gradient(135deg, var(--secondary), #42a5f5)',
            boxShadow: type === 'ホメ' ? '0 4px 15px rgba(244, 143, 177, 0.4)' : '0 4px 15px rgba(144, 202, 249, 0.4)'
          }}
          disabled={loading}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Zap size={18} />
            </motion.div>
          ) : (
            <><Send size={18} /> 送信する</>
          )}
        </button>
      </form>
    </motion.div>
  );
}
