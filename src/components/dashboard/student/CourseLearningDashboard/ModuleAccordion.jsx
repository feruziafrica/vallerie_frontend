import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModuleAccordion({ modules, selectedLesson, completedLessons, onSelectLesson, theme }) {
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    if (!modules?.length) return;
    const initial = {};
    modules.forEach((mod, i) => {
      const hasSelected = mod.lessons?.some(l => l.id === selectedLesson?.id);
      initial[mod.id] = i === 0 || hasSelected;
    });
    setOpenModules(initial);
  }, [modules]);

  const toggle = id => setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

  const totalLessons   = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedCount = completedLessons.length;
  const progressPct    = totalLessons ? (completedCount / totalLessons) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
      {/* ── Progress header ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: theme.text, margin: 0 }}>
            Course Content
          </h3>
          <span style={{ fontSize: '12px', color: theme.textLight, fontWeight: '500' }}>
            {completedCount} / {totalLessons} lessons
          </span>
        </div>
        <div style={{ height: '3px', borderRadius: '999px', background: `${theme.primary}12`, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%', borderRadius: '999px', background: theme.primary }}
          />
        </div>
      </div>

      {/* ── Module list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {modules?.map((mod, modIdx) => {
          const isOpen       = openModules[mod.id];
          const modCompleted = mod.lessons?.filter(l => completedLessons.includes(l.id)).length || 0;
          const modTotal     = mod.lessons?.length || 0;

          return (
            <div key={mod.id} style={{
              borderRadius: '12px', border: `1px solid ${theme.border}`,
              overflow: 'hidden', background: theme.white,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              {/* Module header button */}
              <button
                onClick={() => toggle(mod.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '11px', padding: '13px 16px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: `${theme.primary}10`, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '800', color: theme.primary,
                }}>
                  {modIdx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: theme.text, margin: 0 }}>
                    {mod.title}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.textLight, margin: '2px 0 0', fontWeight: '500' }}>
                    {modCompleted}/{modTotal} completed
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: theme.textLight, flexShrink: 0 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </motion.div>
              </button>

              {/* Collapsible lesson list */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: `1px solid ${theme.border}` }}>
                      {/* Learning outcomes */}
                      {mod.learning_outcomes?.length > 0 && (
                        <div style={{
                          padding: '11px 14px', borderBottom: `1px solid ${theme.border}`,
                          display: 'flex', flexDirection: 'column', gap: '5px',
                        }}>
                          <p style={{
                            fontSize: '10px', fontWeight: '700', color: theme.textLight,
                            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px',
                          }}>
                            What you'll learn
                          </p>
                          {mod.learning_outcomes.map((outcome, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke={theme.primary} strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ marginTop: '2px', flexShrink: 0 }}>
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              <span style={{ fontSize: '12px', color: theme.textLight, lineHeight: 1.45 }}>
                                {outcome}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lessons */}
                      <div style={{ padding: '5px 6px 7px' }}>
                        {mod.lessons?.map((lesson, lesIdx) => {
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isSelected  = selectedLesson?.id === lesson.id;
                          return (
                            <motion.button
                              key={lesson.id}
                              onClick={() => onSelectLesson(lesson)}
                              whileHover={{ x: 2 }}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center',
                                gap: '11px', padding: '9px 11px', borderRadius: '9px',
                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                background: isSelected ? `${theme.primary}10` : 'transparent',
                                outline: isSelected ? `1.5px solid ${theme.primary}25` : 'none',
                                transition: 'all 0.13s',
                              }}
                            >
                              <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                flexShrink: 0, border: '1.5px solid',
                                borderColor: isCompleted ? theme.primary : isSelected ? theme.primary : theme.border,
                                background: isCompleted ? theme.primary : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.18s',
                              }}>
                                {isCompleted ? (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                ) : (
                                  <span style={{
                                    fontSize: '9px', fontWeight: '700',
                                    color: isSelected ? theme.primary : theme.textLight,
                                  }}>
                                    {lesIdx + 1}
                                  </span>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: '13px',
                                  fontWeight: isSelected ? '600' : '500',
                                  color: isSelected ? theme.primary : theme.text,
                                  margin: 0,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                  {lesson.title}
                                </p>
                                {isCompleted && !isSelected && (
                                  <p style={{ fontSize: '10px', color: theme.primary, margin: '2px 0 0', fontWeight: '600' }}>
                                    Completed
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  background: theme.primary, flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
                                    <polygon points="5,3 19,12 5,21"/>
                                  </svg>
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}