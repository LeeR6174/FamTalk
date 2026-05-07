'use client';
import { motion } from 'framer-motion';
import { X, Calendar, Bug, Info } from 'lucide-react';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function Settings({ onClose, meetingDay, setMeetingDay, devMode, setDevMode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '400px', margin: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            設定
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 家族会議の曜日 */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> 家族会議の日
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setMeetingDay(index)}
                  style={{
                    flex: 1,
                    minWidth: '40px',
                    padding: '10px 0',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    background: meetingDay === index ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                    color: meetingDay === index ? 'white' : 'var(--text-dark)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
              選択した曜日になると「家族会議モード」がオープンします。
            </p>
          </div>

          {/* デベロッパーモード */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bug size={16} /> テストモード
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>常に会議モードを表示する</div>
            </div>
            <div 
              onClick={() => setDevMode(!devMode)}
              style={{
                width: '50px',
                height: '26px',
                background: devMode ? 'var(--primary)' : '#ccc',
                borderRadius: '13px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <motion.div
                animate={{ x: devMode ? 26 : 2 }}
                style={{
                  width: '22px',
                  height: '22px',
                  background: 'white',
                  borderRadius: '11px',
                  position: 'absolute',
                  top: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px', padding: '12px', background: 'var(--accent-light)', borderRadius: '12px', color: '#2e7d32', fontSize: '12px' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              設定はブラウザに保存されます。家族で共有する場合は、それぞれの端末で設定してください。
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
