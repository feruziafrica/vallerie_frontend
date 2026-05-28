import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

// ── Animated circular ring ────────────────────────────────────────────────────
function RingProgress({ value, size = 120, stroke = 8, color = '#c97a3a', label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: '22px', fontWeight: '800', color: '#f5efe7', lineHeight: 1 }}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#f5efe7', margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Module progress row ───────────────────────────────────────────────────────
function ModuleRow({ label, value, index, watched, total }) {
  const isComplete = value >= 100;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        background: isComplete
          ? 'linear-gradient(135deg, rgba(201,122,58,0.12), rgba(139,69,19,0.08))'
          : 'rgba(255,255,255,0.03)',
        border: isComplete
          ? '1px solid rgba(201,122,58,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        {/* Status icon */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isComplete
            ? 'linear-gradient(135deg, #c97a3a, #8B4513)'
            : 'rgba(255,255,255,0.06)',
          boxShadow: isComplete ? '0 4px 10px rgba(180,83,9,0.35)' : 'none',
        }}>
          {isComplete ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '12px', fontWeight: '600',
            color: isComplete ? '#f5efe7' : 'rgba(255,255,255,0.55)',
            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {label}
          </p>
          {watched !== undefined && total !== undefined && (
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '1px 0 0' }}>
              {watched} of {total} lessons watched
            </p>
          )}
        </div>

        <span style={{
          fontSize: '11px', fontWeight: '800', flexShrink: 0,
          color: isComplete ? '#c97a3a' : 'rgba(255,255,255,0.3)',
        }}>
          {Math.round(value)}%
        </span>
      </div>

      {/* Progress track */}
      <div style={{
        height: '4px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: '100%', borderRadius: '999px',
            background: isComplete
              ? 'linear-gradient(to right, #c97a3a, #f59e0b)'
              : 'linear-gradient(to right, rgba(201,122,58,0.6), rgba(245,158,11,0.5))',
            boxShadow: isComplete ? '0 0 8px rgba(201,122,58,0.5)' : 'none',
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Milestone badge ───────────────────────────────────────────────────────────
function Milestone({ icon, label, desc, unlocked, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: unlocked ? 1 : 0.4, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      style={{
        padding: '16px 12px',
        borderRadius: '14px',
        textAlign: 'center',
        background: unlocked
          ? 'linear-gradient(135deg, rgba(201,122,58,0.15), rgba(139,69,19,0.1))'
          : 'rgba(255,255,255,0.03)',
        border: unlocked
          ? '1px solid rgba(201,122,58,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Glow on unlock */}
      {unlocked && (
        <div style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,122,58,0.25), transparent)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        margin: '0 auto 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
        background: unlocked
          ? 'linear-gradient(135deg, rgba(201,122,58,0.2), rgba(139,69,19,0.15))'
          : 'rgba(255,255,255,0.04)',
        border: unlocked
          ? '1px solid rgba(201,122,58,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
      }}>
        {unlocked ? icon : '🔒'}
      </div>
      <p style={{ fontSize: '11px', fontWeight: '700', color: unlocked ? '#f5efe7' : 'rgba(255,255,255,0.3)', margin: '0 0 2px' }}>
        {label}
      </p>
      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.4 }}>
        {desc}
      </p>
    </motion.div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ value, label, icon }) {
  return (
    <div style={{
      flex: 1, padding: '16px 12px', borderRadius: '14px', textAlign: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <p style={{ fontSize: '20px', margin: '0 0 4px' }}>{icon}</p>
      <p style={{ fontSize: '20px', fontWeight: '900', color: '#c97a3a', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#f5efe7', margin: '0 0 3px', letterSpacing: '0.01em' }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: '18px',
        background: '#1a1410',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CourseProgress({ progressData, loading, error, theme }) {

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '2px solid rgba(201,122,58,0.2)',
              borderTopColor: '#c97a3a',
              margin: '0 auto 14px',
            }}
          />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Loading your progress…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{error}</p>
        </div>
      </Card>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!progressData) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>📖</p>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#f5efe7', marginBottom: '6px' }}>
            No progress yet
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Start watching lessons to track your journey here.
          </p>
        </div>
      </Card>
    );
  }

  const completion   = progressData?.completion_percentage   || 0;
  const moduleProg   = progressData?.module_progress         || {};
  const lessonsWatched = progressData?.lessons_watched       ?? null;
  const totalLessons   = progressData?.total_lessons         ?? null;
  const hoursSpent     = progressData?.hours_spent           ?? null;
  const streak         = progressData?.streak_days           ?? null;

  // Build module rows — handle both object and array shapes
  const moduleEntries = Array.isArray(moduleProg)
    ? moduleProg.map(m => [m.name || m.title, m.progress ?? m.completion_percentage ?? 0, m.watched, m.total])
    : Object.entries(moduleProg).map(([k, v]) => [
        k,
        typeof v === 'object' ? (v.progress ?? v.completion_percentage ?? 0) : v,
        typeof v === 'object' ? v.watched : undefined,
        typeof v === 'object' ? v.total   : undefined,
      ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>

      {/* ── Hero: ring + stats ── */}
      <Card delay={0}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '32px',
          flexWrap: 'wrap',
        }}>
          {/* Ring */}
          <RingProgress
            value={completion}
            size={130}
            stroke={9}
            color="#c97a3a"
            label="Overall"
            sublabel="Completion"
          />

          {/* Stats */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <p style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Your Journey
            </p>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#f5efe7', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {completion < 25
                ? 'Just Getting Started'
                : completion < 50
                ? 'Building Momentum'
                : completion < 75
                ? 'Halfway There'
                : completion < 100
                ? 'Almost Done!'
                : 'Course Complete 🎉'}
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px', lineHeight: 1.5 }}>
              {completion < 100
                ? `${Math.round(100 - completion)}% remaining — keep going!`
                : 'Congratulations on completing the course.'}
            </p>

            {/* Mini stats row */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {lessonsWatched !== null && (
                <StatPill value={lessonsWatched} label="Lessons" icon="🎬" />
              )}
              {hoursSpent !== null && (
                <StatPill value={`${hoursSpent}h`} label="Time spent" icon="⏱" />
              )}
              {streak !== null && (
                <StatPill value={`${streak}d`} label="Streak" icon="🔥" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Module breakdown ── */}
      {moduleEntries.length > 0 && (
        <Card delay={0.1}>
          <SectionHeader
            title="Module Breakdown"
            subtitle="Your progress across each module"
          />
          <div>
            {moduleEntries.map(([label, value, watched, total], i) => (
              <ModuleRow
                key={label}
                label={label}
                value={value}
                index={i}
                watched={watched}
                total={total}
              />
            ))}
          </div>
        </Card>
      )}

      {/* ── Milestones ── */}
      <Card delay={0.2}>
        <SectionHeader
          title="Milestones"
          subtitle="Unlock achievements as you progress"
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '10px',
        }}>
          {[
            { icon: '🎯', label: 'First Step',    desc: 'Reach 25% completion',  threshold: 25  },
            { icon: '⚡', label: 'Halfway',        desc: 'Reach 50% completion',  threshold: 50  },
            { icon: '🚀', label: 'Almost There',  desc: 'Reach 75% completion',  threshold: 75  },
            { icon: '🏆', label: 'Graduate',      desc: 'Complete the course',    threshold: 100 },
          ].map((m, i) => (
            <Milestone
              key={m.label}
              icon={m.icon}
              label={m.label}
              desc={m.desc}
              unlocked={completion >= m.threshold}
              index={i}
            />
          ))}
        </div>
      </Card>

      {/* ── Motivational footer ── */}
      <AnimatePresence>
        {completion > 0 && completion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(201,122,58,0.12), rgba(139,69,19,0.08))',
              border: '1px solid rgba(201,122,58,0.2)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#f5efe7', margin: '0 0 2px' }}>
                Keep the momentum going
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                Students who study consistently are 3× more likely to complete their course.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

CourseProgress.propTypes = {
  progressData: PropTypes.shape({
    completion_percentage: PropTypes.number,
    module_progress:       PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    lessons_watched:       PropTypes.number,
    total_lessons:         PropTypes.number,
    hours_spent:           PropTypes.number,
    streak_days:           PropTypes.number,
  }),
  loading: PropTypes.bool,
  error:   PropTypes.string,
  theme:   PropTypes.object.isRequired,
};

CourseProgress.defaultProps = {
  progressData: null,
  loading:      false,
  error:        null,
};






// import { motion } from 'framer-motion';
// import PropTypes from 'prop-types';

// export default function CourseProgress({ progressData, loading, error, theme }) {
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Infinity }}
//             className="w-10 h-10 border-2 rounded-full mx-auto mb-4"
//             style={{
//               borderColor: `${theme.primary}20`,
//               borderTopColor: theme.primary,
//             }}
//           />
//           <p style={{ color: theme.textLight }}>Loading progress…</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 rounded-lg" style={{ backgroundColor: theme.lightCream }}>
//         <p style={{ color: theme.text }}>{error}</p>
//       </div>
//     );
//   }

//   if (!progressData) {
//     return (
//       <div className="p-6 rounded-lg" style={{ backgroundColor: theme.lightCream }}>
//         <p style={{ color: theme.text }}>No progress data available</p>
//       </div>
//     );
//   }

//   const completion = progressData?.completion_percentage || 0;

//   return (
//     <div className="space-y-8">
//       {/* Progress Rings */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="rounded-lg p-8"
//         style={{ backgroundColor: theme.white, border: `1px solid ${theme.border}` }}
//       >
//         <h3 className="text-lg font-light mb-8" style={{ color: theme.text }}>
//           Your Progress
//         </h3>

//         <div className="space-y-6">
//           <ProgressItem
//             label="Overall Completion"
//             value={completion}
//             theme={theme}
//           />
//           {progressData?.module_progress &&
//             Object.entries(progressData.module_progress).map(([module, progress]) => (
//               <ProgressItem
//                 key={module}
//                 label={module}
//                 value={progress}
//                 theme={theme}
//               />
//             ))}
//         </div>
//       </motion.div>

//       {/* Achievements */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="rounded-lg p-8"
//         style={{ backgroundColor: theme.white, border: `1px solid ${theme.border}` }}
//       >
//         <h3 className="text-lg font-light mb-8" style={{ color: theme.text }}>
//           Milestones
//         </h3>

//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {[
//             { icon: '🎯', label: '25%', unlocked: completion >= 25 },
//             { icon: '⭐', label: '50%', unlocked: completion >= 50 },
//             { icon: '🚀', label: '75%', unlocked: completion >= 75 },
//             { icon: '🏆', label: 'Complete', unlocked: completion === 100 },
//           ].map((achievement, i) => (
//             <div
//               key={i}
//               className="text-center p-4 rounded-lg transition-all"
//               style={{
//                 backgroundColor: achievement.unlocked
//                   ? `${theme.primary}08`
//                   : `${theme.text}04`,
//                 border: achievement.unlocked
//                   ? `1px solid ${theme.primary}`
//                   : `1px solid ${theme.border}`,
//                 opacity: achievement.unlocked ? 1 : 0.5,
//               }}
//             >
//               <p className="text-2xl mb-2">{achievement.icon}</p>
//               <p className="text-xs font-medium" style={{ color: theme.text }}>
//                 {achievement.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// CourseProgress.propTypes = {
//   progressData: PropTypes.object,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   theme: PropTypes.object.isRequired,
// };

// function ProgressItem({ label, value, theme }) {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-2">
//         <p className="text-sm" style={{ color: theme.text }}>
//           {label}
//         </p>
//         <p className="text-sm font-medium" style={{ color: theme.primary }}>
//           {Math.round(value)}%
//         </p>
//       </div>
//       <div
//         className="h-1.5 rounded-full overflow-hidden"
//         style={{ backgroundColor: theme.border }}
//       >
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${value}%` }}
//           transition={{ duration: 0.8 }}
//           className="h-full rounded-full"
//           style={{ backgroundColor: theme.primary }}
//         />
//       </div>
//     </div>
//   );
// }

// ProgressItem.propTypes = {
//   label: PropTypes.string.isRequired,
//   value: PropTypes.number.isRequired,
//   theme: PropTypes.object.isRequired,
// };