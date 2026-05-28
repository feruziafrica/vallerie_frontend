import { motion } from 'framer-motion';

export default function VideoEndedNudge({ isCompleted, onMarkComplete, onNextLesson, hasNext, markingComplete, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      style={{
        borderRadius: '12px',
        border: `1px solid ${theme.primary}30`,
        background: `linear-gradient(135deg, ${theme.primary}08, ${theme.primary}04)`,
        padding: '14px 18px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: `${theme.primary}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={theme.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: theme.text }}>
            Video finished
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: theme.textLight }}>
            {isCompleted
              ? 'Already marked complete.'
              : 'Mark this lesson as complete to track your progress.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {!isCompleted && (
          <motion.button
            onClick={onMarkComplete}
            disabled={markingComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 14px', borderRadius: '8px',
              background: theme.primary, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              opacity: markingComplete ? 0.65 : 1, transition: 'all 0.15s',
            }}
          >
            {markingComplete ? 'Saving…' : 'Mark Complete'}
          </motion.button>
        )}
        {hasNext && (
          <motion.button
            onClick={onNextLesson}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 14px', borderRadius: '8px',
              background: 'transparent', color: theme.primary,
              border: `1.5px solid ${theme.primary}40`,
              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              transition: 'all 0.15s',
            }}
          >
            Next →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}