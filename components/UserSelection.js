'use client';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function UserSelection({ onSelect }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '80vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-dark)' }}>
        あなたはだれ？
      </h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', border: 'none' }}
          onClick={() => onSelect('あき')}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={32} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>あき</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', border: 'none' }}
          onClick={() => onSelect('ゆうき')}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={32} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>ゆうき</span>
        </motion.button>
      </div>
    </div>
  );
}
