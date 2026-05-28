import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';

/* ── Skeleton helpers ── */
function Skel({ w = '100%', h = 12, r = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

/* ── Trend badge ── */
function TrendBadge({ text, up }) {
  if (!text) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '11px', fontWeight: 600,
      padding: '2px 7px', borderRadius: '99px',
      background: up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      color: up ? '#059669' : '#DC2626',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {up
          ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
          : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>
        }
      </svg>
      {text}
    </span>
  );
}

/* ── KPI icons ── */
const KPI_META = {
  avg_completion_time: {
    title: 'Avg. Completion Time', color: '#3B82F6',
    format: (v) => v != null ? `${v}w` : '—',
    sub: 'Per course module',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  retention_rate: {
    title: 'Student Retention', color: '#10B981',
    format: (v) => v != null ? `${v}%` : '—',
    sub: 'Across all cohorts',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  avg_course_rating: {
    title: 'Course Rating', color: '#F59E0B',
    format: (v) => v != null ? Number(v).toFixed(1) : '—',
    sub: 'Average across all courses',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
};

const KPI_KEYS = ['avg_completion_time', 'retention_rate', 'avg_course_rating'];

/* ── Main ── */
export default function Analytics() {
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoints.dashboard.stats);
      setStats(res.data);
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* Derived */
  const kpis         = stats?.kpis          ?? {};
  const demographics = stats?.demographics  ?? [];
  const monthlyPerf  = stats?.monthly_performance ?? [];
  const coursePerf   = stats?.course_performance  ?? [];
  const ratingDist   = stats?.rating_distribution ?? [];
  const snapshot     = stats?.performance_snapshot ?? {};

  const maxEnrolled = monthlyPerf.length ? Math.max(...monthlyPerf.map((d) => d.enrolled ?? 0)) || 1 : 1;

  return (
    <>
      <style>{`
        @keyframes shimmer { to { background-position: -200% 0; } }
        .an-tr { transition: background 0.12s; }
        .an-tr:hover { background: rgba(0,0,0,0.015) !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#DC2626' }}>
            {error}
            <button onClick={fetchStats} style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Retry</button>
          </div>
        )}

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
          {KPI_KEYS.map((key, i) => {
            const meta = KPI_META[key];
            const kpi  = kpis[key] ?? {};
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.3 }}
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', right: '16px', top: '16px', width: '34px', height: '34px', borderRadius: '9px', background: `${meta.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                  {meta.icon}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b' }}>{meta.title}</div>
                <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.03em', marginTop: '6px', lineHeight: 1 }}>
                  {loading ? <Skel w={64} h={26} style={{ marginTop: 4 }} /> : meta.format(kpi.value)}
                </div>
                <div style={{ fontSize: '11px', color: '#9b9b9b', marginTop: '5px' }}>{meta.sub}</div>
                <div style={{ marginTop: '8px', minHeight: '22px' }}>
                  {loading
                    ? <Skel w={80} h={18} r={99} />
                    : kpi.trend
                      ? <TrendBadge text={kpi.trend} up={kpi.trend_up ?? true} />
                      : null
                  }
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Body grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Enrollment vs Completion</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(184,101,47,0.3)' }} />
                    <span style={{ fontSize: '11px', color: '#9b9b9b' }}>Enrolled</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#B8652F' }} />
                    <span style={{ fontSize: '11px', color: '#9b9b9b' }}>Completed</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 20px 14px' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100%' }}>
                        <Skel w="100%" h={`${30 + Math.random() * 60}%`} r={3} />
                        <Skel w="100%" h={`${20 + Math.random() * 50}%`} r={3} />
                      </div>
                    ))}
                  </div>
                ) : monthlyPerf.length === 0 ? (
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#9b9b9b' }}>No data available</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                      {monthlyPerf.map((d, i) => (
                        <div key={d.month} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100%' }}>
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: `${Math.round(((d.enrolled ?? 0) / maxEnrolled) * 100)}%` }}
                            transition={{ delay: 0.25 + i * 0.04, duration: 0.45, ease: 'easeOut' }}
                            style={{ flex: 1, borderRadius: '3px 3px 0 0', background: 'rgba(184,101,47,0.2)', cursor: 'pointer' }}
                            title={`${d.month} enrolled: ${d.enrolled}`}
                          />
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: `${Math.round(((d.completed ?? 0) / maxEnrolled) * 100)}%` }}
                            transition={{ delay: 0.3 + i * 0.04, duration: 0.45, ease: 'easeOut' }}
                            style={{ flex: 1, borderRadius: '3px 3px 0 0', background: '#B8652F', cursor: 'pointer' }}
                            title={`${d.month} completed: ${d.completed}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {monthlyPerf.map((d) => (
                        <div key={d.month} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: '#9b9b9b', fontFamily: 'monospace' }}>{d.month}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Course performance table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Course Performance</div>
                <span style={{ fontSize: '12px', color: '#B8652F', cursor: 'pointer', fontWeight: 500 }}>Export →</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {['Course', 'Students', 'Rating', 'Completion', 'Revenue'].map((h) => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9b9b9b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        {[140, 40, 40, 80, 60].map((w, j) => (
                          <td key={j} style={{ padding: '14px 20px' }}><Skel w={w} /></td>
                        ))}
                      </tr>
                    ))
                  ) : coursePerf.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No course data available.</td></tr>
                  ) : coursePerf.map((course, i) => (
                    <motion.tr
                      key={course.name ?? i}
                      className="an-tr"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{course.name}</td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: '#6b6b6b', fontFamily: 'monospace' }}>{course.students ?? '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace' }}>{course.rating != null ? Number(course.rating).toFixed(1) : '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '52px', height: '4px', background: 'rgba(0,0,0,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${course.completion ?? 0}%` }}
                              transition={{ delay: 0.3 + i * 0.05, duration: 0.55, ease: 'easeOut' }}
                              style={{ height: '100%', background: (course.completion ?? 0) >= 85 ? '#10B981' : '#B8652F', borderRadius: '99px' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b6b6b', fontFamily: 'monospace' }}>{course.completion != null ? `${course.completion}%` : '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace' }}>
                        {course.revenue != null ? `KES ${course.revenue}` : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Demographics */}
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Student Demographics</div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ marginBottom: i < 3 ? '16px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <Skel w={80} /><Skel w={32} />
                      </div>
                      <Skel w="100%" h={4} r={99} />
                    </div>
                  ))
                ) : demographics.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#9b9b9b', textAlign: 'center', padding: '12px 0' }}>No data</div>
                ) : demographics.map((item, i) => (
                  <div key={item.label ?? i} style={{ marginBottom: i < demographics.length - 1 ? '16px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#9b9b9b', fontFamily: 'monospace' }}>{item.count}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#B8652F', fontFamily: 'monospace', minWidth: '28px', textAlign: 'right' }}>{item.percent}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${item.percent}%` }}
                        transition={{ delay: 0.28 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', background: `rgba(184,101,47,${0.3 + i * 0.2})`, borderRadius: '99px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rating distribution */}
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.26 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Rating Distribution</div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < 4 ? '10px' : 0 }}>
                      <Skel w={60} h={9} />
                      <Skel w="100%" h={4} r={99} />
                      <Skel w={24} h={10} />
                    </div>
                  ))
                ) : ratingDist.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#9b9b9b', textAlign: 'center', padding: '12px 0' }}>No data</div>
                ) : ratingDist.map((row, i) => (
                  <div key={row.stars ?? i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < ratingDist.length - 1 ? '10px' : 0 }}>
                    <div style={{ display: 'flex', gap: '2px', width: '60px', flexShrink: 0 }}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg key={s} width="9" height="9" viewBox="0 0 24 24" fill={s < (row.stars ?? 0) ? '#F59E0B' : 'rgba(0,0,0,0.1)'} stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${row.pct ?? row.percent ?? 0}%` }}
                        transition={{ delay: 0.35 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        style={{ height: '100%', background: '#F59E0B', borderRadius: '99px', opacity: 0.4 + (row.pct ?? row.percent ?? 0) / 100 }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#9b9b9b', fontFamily: 'monospace', minWidth: '24px', textAlign: 'right' }}>{row.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance snapshot */}
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '16px 20px' }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '14px' }}>Performance Snapshot</div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <Skel w={110} /><Skel w={40} />
                  </div>
                ))
              ) : (
                [
                  { label: 'Avg. session length', key: 'avg_session_length' },
                  { label: 'Support tickets',     key: 'open_support_tickets', suffix: ' open' },
                  { label: 'Refund rate',         key: 'refund_rate', suffix: '%' },
                  { label: 'NPS score',           key: 'nps_score', prefix: '+' },
                ].map((row, i) => {
                  const raw = snapshot[row.key];
                  const display = raw != null ? `${row.prefix ?? ''}${raw}${row.suffix ?? ''}` : '—';
                  return (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <span style={{ fontSize: '12px', color: '#6b6b6b' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace' }}>{display}</span>
                    </div>
                  );
                })
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}