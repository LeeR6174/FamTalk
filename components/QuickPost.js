'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, Zap } from 'lucide-react';

export default function QuickPost({ user, onPost }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('ホメ');
  const [to, setTo] = useState(user === 'あき' ? 'ゆうき' : 'あき');
  const [loading, setLoading] = useState(false);

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
        if (onPost) onPost();
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
    >
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        クイック投稿
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="select-group">
          <button
            type="button"
            className={`tag-btn home ${type === 'ホメ' ? 'active' : ''}`}
            onClick={() => setType('ホメ')}
          >
            <Heart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            ホメ
          </button>
          <button
            type="button"
            className={`tag-btn kaizen ${type === '改善' ? 'active' : ''}`}
            onClick={() => setType('改善')}
          >
            <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            改善
          </button>
        </div>

        <textarea
          className="input"
          style={{ height: '100px', marginBottom: '16px', resize: 'none' }}
          placeholder={`${to}へのメッセージを入力...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button 
          className={`btn btn-primary`} 
          style={{ width: '100%', background: type === 'ホメ' ? 'var(--primary)' : 'var(--secondary)' }}
          disabled={loading}
        >
          {loading ? '送信中...' : <><Send size={18} /> 送信する</>}
        </button>
      </form>
    </motion.div>
  );
}
