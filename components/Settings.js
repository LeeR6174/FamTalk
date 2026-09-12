'use client';
import { motion } from 'framer-motion';
import { X, Bug, Info } from 'lucide-react';

export default function Settings({ onClose, user, devMode, setDevMode, meetingDay, setMeetingDay }) {
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
            <div>
              <div style={{ fontWeight: 600 }}>家族会議の曜日</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>二人の都合に合わせて変更できます</div>
            </div>
            <select
              value={meetingDay}
              onChange={(e) => setMeetingDay(Number(e.target.value))}
              className="input"
              style={{ width: '96px', padding: '10px 8px', background: 'white' }}
            >
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <option key={day} value={index}>{day}曜日</option>
              ))}
            </select>
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

          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }} />

          {/* フィードバックフォーム */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '16px', display: 'block' }}>
              開発者へ意見を送る 💌
            </label>
            <form 
              name="contact" 
              method="POST" 
              data-netlify="true"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input type="hidden" name="form-name" value="contact" />
              
              <textarea 
                name="message" 
                placeholder="改善案や応援メッセージをお願いします！" 
                required
                className="input"
                style={{ height: '80px', fontSize: '14px', padding: '12px' }}
              />

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px', fontWeight: 700 }}
              >
                送信する
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
