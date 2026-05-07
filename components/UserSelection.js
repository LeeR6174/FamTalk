'use client';
import { motion } from 'framer-motion';
import { User, Heart, Zap } from 'lucide-react';

export default function UserSelection({ onSelect }) {
  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="header-title" style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--text-dark)' }}>
          FamTalk
        </h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '48px', fontWeight: 500 }}>
          Welcome back
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: '12px', padding: '0 4px' }}>
        <motion.button
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer', 
            border: 'none',
            padding: '24px 12px',
            background: 'white'
          }}
          onClick={() => onSelect('あき')}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '32px', 
            background: 'linear-gradient(135deg, var(--primary), #ec407a)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            boxShadow: '0 8px 20px rgba(244, 143, 177, 0.3)'
          }}>
            <Heart size={32} fill="currentColor" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px' }}>あき</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer', 
            border: 'none',
            padding: '24px 12px',
            background: 'white'
          }}
          onClick={() => onSelect('ゆうき')}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '32px', 
            background: 'linear-gradient(135deg, var(--secondary), #42a5f5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            boxShadow: '0 8px 20px rgba(144, 202, 249, 0.3)'
          }}>
            <Zap size={32} fill="currentColor" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px' }}>ゆうき</span>
        </motion.button>
      </div>
      
    </div>
  );
}
