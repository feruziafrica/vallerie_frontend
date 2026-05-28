import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = {
  kes:     (n) => n >= 1_000_000 ? `KES ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `KES ${(n / 1_000).toFixed(0)}K` : `KES ${n}`,
  pct:     (n) => `${Math.round(n)}%`,
  compact: (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(Math.round(n ?? 0)),
  date: (s) => {
    if (!s) return '—';
    const d    = new Date(s);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  },
  name: (item) => {
    // Try every possible name field the backend might return
    if (item.student_name)  return item.student_name;
    if (item.full_name)     return item.full_name;
    if (item.admin_name)    return item.admin_name;
    if (item.first_name && item.last_name) return `${item.first_name} ${item.last_name}`;
    if (item.first_name)    return item.first_name;
    if (item.user_name)     return item.user_name;
    if (item.student_email) return item.student_email.split('@')[0];
    if (item.admin_email)   return item.admin_email.split('@')[0];
    return null;
  },
};

// ── Activity description builder ──────────────────────────────────────────────
const buildActivityDescription = (item) => {
  const action  = item.action || item.type || '';
  const name    = fmt.name(item);
  const course  = item.course_name  || item.course  || '';
  const company = item.company_name || '';
  const role    = item.role         || '';

  if (item.description && item.description.length > 20 && !/^\w{5,}$/.test(item.description)) {
    return item.description;
  }

  switch (action) {
    case 'approve_certificate':
    case 'cert_issued':
    case 'certificate':
      return name && course
        ? `Certificate approved — ${name} · ${course}`
        : name
          ? `Certificate issued for ${name}`
          : 'Certificate approved and issued';

    case 'reject_certificate':
      return name ? `Certificate rejected — ${name}` : 'Certificate rejected';

    case 'enrollment':
    case 'enrolment':
    case 'enroll':
      return name && course
        ? `${name} enrolled in ${course}`
        : name
          ? `New enrollment — ${name}`
          : 'New student enrolled';

    case 'course_completed':
    case 'completion':
    case 'complete':
      return name && course
        ? `${name} completed ${course}`
        : name
          ? `${name} completed a course`
          : 'Course completed';

    case 'payment':
    case 'payment_received':
      return name
        ? `Payment from ${name}${item.amount ? ` — ${fmt.kes(item.amount)}` : ''}`
        : 'Payment received';

    case 'approve_job_posting':
    case 'job_posting':
    case 'job_post':
      return company && role
        ? `Job posting approved — ${role} at ${company}`
        : company
          ? `Job posting approved for ${company}`
          : 'Job posting approved';

    case 'reject_job_posting':
      return company ? `Job posting rejected — ${company}` : 'Job posting rejected';

    case 'archive_job_posting':
      return company ? `Job posting archived — ${company}` : 'Job posting archived';

    case 'forward_application':
    case 'job_application':
    case 'job_seeker':
      return name && company
        ? `${name}'s application → ${company}`
        : name
          ? `${name}'s application forwarded`
          : company
            ? `Application forwarded to ${company}`
            : 'Application forwarded';

    case 'send_message':
      return item.recipient_count
        ? `Bulk message sent to ${item.recipient_count} students`
        : name
          ? `Message sent to ${name}`
          : 'Bulk message sent';

    default:
      return item.description || item.event || action || 'Activity recorded';
  }
};

// ── Activity type resolver ────────────────────────────────────────────────────
const ACTION_TYPE_MAP = {
  enrollment: 'enroll', enrolment: 'enroll',
  course_completed: 'complete', completion: 'complete', complete: 'complete',
  payment: 'payment', payment_received: 'payment',
  certificate: 'cert', cert_issued: 'cert',
  approve_certificate: 'cert', reject_certificate: 'cert_reject',
  approve_job_posting: 'job_post', reject_job_posting: 'job_post',
  archive_job_posting: 'job_post', job_posting: 'job_post',
  forward_application: 'job_seeker', job_application: 'job_seeker',
  send_message: 'message',
};

const ACTIVITY_CFG = {
  enroll:      { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', dot: '#3B82F6',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
  complete:    { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', dot: '#10B981',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  payment:     { bg: 'rgba(184,101,47,0.1)',   color: '#B8652F', dot: '#B8652F',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  cert:        { bg: 'rgba(245,158,11,0.1)',   color: '#F59E0B', dot: '#F59E0B',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  cert_reject: { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', dot: '#EF4444',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  job_post:    { bg: 'rgba(245,158,11,0.08)',  color: '#D97706', dot: '#D97706',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  job_seeker:  { bg: 'rgba(139,92,246,0.1)',   color: '#8B5CF6', dot: '#8B5CF6',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><circle cx="19" cy="10" r="3" fill="currentColor" fillOpacity="0.15"/><path d="M19 8v4M17 10h4"/></svg> },
  message:     { bg: 'rgba(99,102,241,0.1)',   color: '#6366F1', dot: '#6366F1',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  default:     { bg: 'rgba(107,114,128,0.1)',  color: '#6B7280', dot: '#6B7280',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
};

// ── Revenue sources ───────────────────────────────────────────────────────────
const REVENUE_SOURCES = [
  { label: 'M-Pesa',        key: 'mobile_money', color: '#10B981', altKey: 'mpesa_total'  },
  { label: 'Card',          key: 'card',         color: '#3B82F6', altKey: 'card_total'   },
  { label: 'Bank Transfer', key: 'bank',         color: '#B8652F', altKey: 'paypal_total' },
];

// ── Month delta ───────────────────────────────────────────────────────────────
const monthDelta = (current, previous) => {
  if (!previous || previous === 0) return null;
  const pct  = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return { label: `${sign}${pct.toFixed(1)}% vs last month`, up: pct >= 0 };
};

// ── Skeleton block ────────────────────────────────────────────────────────────
function Skel({ w = '100%', h = 12, r = 6, style = {} }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style }} />
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, trend, trendUp, accentColor, icon, delay, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle gradient accent in top-right */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: '80px', height: '80px', background: `radial-gradient(circle at 100% 0%, ${accentColor}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', right: '16px', top: '16px', width: '36px', height: '36px', borderRadius: '10px', background: `${accentColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
        {icon}
      </div>

      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '10px' }}>{title}</div>

      {loading
        ? <Skel w={80} h={28} r={6} style={{ marginBottom: 6 }} />
        : <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '5px' }}>{value}</div>
      }

      <div style={{ fontSize: '11px', color: '#9b9b9b' }}>{subtitle}</div>

      {trend && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', marginTop: '10px', background: trendUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: trendUp ? '#059669' : '#DC2626' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {trendUp
              ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
              : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>
            }
          </svg>
          {trend}
        </div>
      )}
    </motion.div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({ title, description, count, countLabel, color, icon, onClick, delay, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px ${color}18` }}
      onClick={onClick}
      style={{ background: '#ffffff', border: `1px solid ${color}20`, borderRadius: '14px', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg, ${color}, ${color}80)`, borderRadius: '14px 0 0 14px' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '7px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em' }}>{title}</span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b6b6b', lineHeight: 1.55 }}>{description}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {loading
            ? <Skel w={48} h={32} r={6} />
            : <div style={{ fontSize: '30px', fontWeight: 700, color, letterSpacing: '-0.05em', lineHeight: 1 }}>{count ?? '—'}</div>
          }
          <div style={{ fontSize: '10px', color: '#9b9b9b', marginTop: '3px', fontWeight: 500 }}>{countLabel}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '14px', fontSize: '12px', color, fontWeight: 600 }}>
        Review now
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminOverview({ onNavigate }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoints.dashboard.stats);
      setStats(res.data);
    } catch {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const s = stats || {};

  const enrollmentData   = Array.isArray(s.enrollment_trend) ? s.enrollment_trend : [];
  const maxBar           = enrollmentData.length > 0 ? Math.max(...enrollmentData, 1) : 1;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const enrollmentLabels = Array.isArray(s.enrollment_labels) && s.enrollment_labels.length === enrollmentData.length
    ? s.enrollment_labels
    : Array.from({ length: enrollmentData.length }, (_, i) => {
        const d = new Date(new Date().getFullYear(), new Date().getMonth() - (enrollmentData.length - 1 - i), 1);
        return MONTHS[d.getMonth()];
      });

  const studentDelta = enrollmentData.length >= 2
    ? monthDelta(enrollmentData.at(-1), enrollmentData.at(-2))
    : null;

  const completionRate = (s.completed_students > 0 && s.total_students > 0)
    ? Math.round((s.completed_students / s.total_students) * 100)
    : null;

  const revenueByMethod = {};
  if (Array.isArray(s.revenue_by_method)) {
    s.revenue_by_method.forEach((r) => { revenueByMethod[r.payment_method] = r.total; });
  }
  REVENUE_SOURCES.forEach((src) => {
    if (s[src.altKey]) revenueByMethod[src.key] = s[src.altKey];
  });

  const recentActivity = Array.isArray(s.recent_activity) ? s.recent_activity : [];
  const avgRevenue     = (s.total_revenue > 0 && s.total_students > 0)
    ? Math.round(s.total_revenue / s.total_students)
    : null;

  const totalRevenue = Number(s.total_revenue) || 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .ov-row:hover { background: rgba(0,0,0,0.015) !important; }
        
        /* Responsive breakpoints */
        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .action-grid { grid-template-columns: 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .right-column { order: 2; }
        }
        
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
          .activity-section { max-height: 400px; overflow-y: auto; }
        }
      `}</style>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '10px', padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
            <button onClick={fetchStats} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#DC2626', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', padding: '4px 10px' }}>
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI grid */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
        <KPICard
          title="Total Students" delay={0} loading={loading} accentColor="#3B82F6"
          value={s.total_students != null ? String(s.total_students) : '—'}
          subtitle={s.active_students != null ? `${s.active_students} currently active` : 'Active enrollments'}
          trend={studentDelta?.label} trendUp={studentDelta?.up}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <KPICard
          title="Total Revenue" delay={0.07} loading={loading} accentColor="#10B981"
          value={totalRevenue > 0 ? fmt.kes(totalRevenue) : '—'}
          subtitle="All payment channels"
          trend={null} trendUp={true}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KPICard
          title="Completion Rate" delay={0.14} loading={loading} accentColor="#F59E0B"
          value={completionRate != null ? fmt.pct(completionRate) : '—'}
          subtitle={s.completed_students != null ? `${s.completed_students} students completed` : 'Course completions'}
          trend={null} trendUp={true}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <KPICard
          title="Pending Certs" delay={0.21} loading={loading} accentColor="#EF4444"
          value={s.pending_certificates != null ? String(s.pending_certificates) : '—'}
          subtitle="Awaiting admin review"
          trend={null} trendUp={false}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      </div>

      {/* Job action cards */}
      <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ActionCard
          title="Job Posting Approvals"
          description="Employer listings awaiting review before going live on the platform."
          count={s.pending_job_postings} countLabel="pending review"
          color="#F59E0B" delay={0.26} loading={loading}
          onClick={() => onNavigate?.('job_postings')}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>}
        />
        <ActionCard
          title="Job Seeker Applications"
          description="Candidates ready for matching — review profiles and forward to companies."
          count={s.pending_job_seekers} countLabel="new applications"
          color="#8B5CF6" delay={0.32} loading={loading}
          onClick={() => onNavigate?.('job_seekers')}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        />
      </div>

      {/* Main body grid - RESPONSIVE */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '16px' }}>

        {/* ── Left ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Enrollment chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Enrollment Trend</div>
              <span style={{ fontSize: '11px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace" }}>
                {enrollmentData.length > 0 ? `Last ${enrollmentData.length} months` : 'No data'}
              </span>
            </div>

            <div style={{ padding: '20px 20px 14px' }}>
              {loading ? (
                <div style={{ height: '96px', borderRadius: '8px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ) : enrollmentData.length === 0 ? (
                <div style={{ height: '96px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9b9b9b' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span style={{ fontSize: '12px' }}>No enrollment data available yet</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '96px' }}>
                    {enrollmentData.map((val, i) => {
                      const isLast    = i === enrollmentData.length - 1;
                      const isRecent  = i >= enrollmentData.length - 3;
                      const heightPct = Math.max(Math.round((val / maxBar) * 100), 4);
                      return (
                        <motion.div key={i} title={`${enrollmentLabels[i]}: ${val} students`}
                          initial={{ height: 0 }} animate={{ height: `${heightPct}%` }}
                          transition={{ delay: 0.28 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                          style={{ flex: 1, borderRadius: '4px 4px 0 0', cursor: 'default',
                            background: isLast
                              ? '#B8652F'
                              : isRecent
                                ? 'rgba(184,101,47,0.45)'
                                : 'rgba(184,101,47,0.15)',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                    {enrollmentLabels.map((m, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: i === enrollmentLabels.length - 1 ? '#B8652F' : '#9b9b9b', fontFamily: "'DM Mono', monospace", fontWeight: i === enrollmentLabels.length - 1 ? 600 : 400 }}>{m}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Recent activity - COMPACT & CLEAN */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Recent Activity</div>
              <button
                onClick={() => onNavigate?.('analytics')}
                style={{ background: 'none', border: 'none', color: '#B8652F', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
                View all →
              </button>
            </div>

            <div className="activity-section">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <Skel w={28} h={28} r={8} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                      <Skel w={`${60 + Math.random() * 25}%`} h={11} />
                      <Skel w={50} h={8} />
                    </div>
                    <Skel w={32} h={8} style={{ flexShrink: 0 }} />
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9b9b9b', fontSize: '13px' }}>No recent activity recorded yet.</div>
              ) : (
                recentActivity.slice(0, 10).map((item, idx) => {
                  const typeKey     = ACTION_TYPE_MAP[item.action || item.type || ''] || 'default';
                  const cfg         = ACTIVITY_CFG[typeKey] || ACTIVITY_CFG.default;
                  const description = buildActivityDescription(item);
                  const time        = fmt.date(item.created_at || item.time);
                  const isLast      = idx === Math.min(recentActivity.length, 10) - 1;

                  return (
                    <motion.div key={item.id ?? idx}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + idx * 0.04 }}
                      className="ov-row"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 20px', borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.04)', transition: 'background 0.12s', cursor: 'default' }}
                    >
                      {/* Icon */}
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {cfg.svg}
                      </div>

                      {/* Content - COMPACT */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.4, wordBreak: 'break-word' }}>{description}</div>
                        {/* Show admin name in smaller text only if different from student */}
                        {item.admin_email && item.admin_email !== item.student_email && (
                          <div style={{ fontSize: '10px', color: '#9b9b9b', marginTop: '2px' }}>
                            by {item.admin_name || item.admin_email.split('@')[0]}
                          </div>
                        )}
                      </div>

                      {/* Time - RIGHT SIDE */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '9px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace" }}>{time}</span>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Right column - RESPONSIVE ── */}
        <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Revenue breakdown */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Revenue Breakdown</div>
              {!loading && totalRevenue > 0 && (
                <div style={{ fontSize: '11px', color: '#9b9b9b', marginTop: '2px' }}>Total: {fmt.kes(totalRevenue)}</div>
              )}
            </div>
            <div style={{ padding: '16px 20px' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ marginBottom: '18px' }}>
                    <Skel w="100%" h={11} style={{ marginBottom: 8 }} />
                    <Skel w="100%" h={4} r={99} />
                  </div>
                ))
              ) : totalRevenue === 0 ? (
                <div style={{ textAlign: 'center', color: '#9b9b9b', fontSize: '12px', padding: '12px 0' }}>No revenue data yet.</div>
              ) : (
                <>
                  {REVENUE_SOURCES.map((src, srcIdx) => {
                    const amount  = Number(revenueByMethod[src.key] || 0);
                    const percent = Math.round((amount / totalRevenue) * 100);
                    return (
                      <div key={src.key} style={{ marginBottom: srcIdx < REVENUE_SOURCES.length - 1 ? '16px' : '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: src.color }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{src.label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', fontFamily: "'DM Mono', monospace" }}>{fmt.compact(amount)}</span>
                            <span style={{ fontSize: '10px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace", minWidth: '26px', textAlign: 'right' }}>{percent}%</span>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                            transition={{ delay: 0.34 + srcIdx * 0.07, duration: 0.7, ease: 'easeOut' }}
                            style={{ height: '100%', background: src.color, borderRadius: '99px' }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Stacked bar */}
                  <div style={{ height: '6px', borderRadius: '99px', overflow: 'hidden', display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {REVENUE_SOURCES.map((src, i) => {
                      const amount = Number(revenueByMethod[src.key] || 0);
                      const flex   = Math.round((amount / totalRevenue) * 100) || 1;
                      return (
                        <div key={src.key} style={{ flex, background: src.color, borderRadius: i === 0 ? '99px 0 0 99px' : i === REVENUE_SOURCES.length - 1 ? '0 99px 99px 0' : 0 }} />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Platform snapshot */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.30 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '16px 20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '14px' }}>Platform Snapshot</div>
            {[
              { label: 'Total courses',         value: s.total_courses != null ? String(s.total_courses) : '—' },
              { label: 'Active students',        value: s.active_students != null ? String(s.active_students) : '—' },
              { label: 'Completed',              value: s.completed_students != null ? String(s.completed_students) : '—' },
              { label: 'Avg. revenue / student', value: avgRevenue != null ? fmt.kes(avgRevenue) : '—' },
              { label: 'Job postings pending',   value: s.pending_job_postings != null ? String(s.pending_job_postings) : '—', accent: s.pending_job_postings > 0 ? '#F59E0B' : null },
              { label: 'Job seekers pending',    value: s.pending_job_seekers != null ? String(s.pending_job_seekers) : '—', accent: s.pending_job_seekers > 0 ? '#8B5CF6' : null },
              { label: 'Pending certificates',   value: s.pending_certificates != null ? String(s.pending_certificates) : '—', accent: s.pending_certificates > 0 ? '#EF4444' : null },
            ].map((row, i, arr) => (
              <div key={row.label} className="ov-row"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', transition: 'background 0.12s' }}>
                <span style={{ fontSize: '12px', color: '#6b6b6b' }}>{row.label}</span>
                {loading
                  ? <Skel w={48} h={12} />
                  : <span style={{ fontSize: '13px', fontWeight: 600, color: row.accent || '#1a1a1a', fontFamily: "'DM Mono', monospace" }}>{row.value}</span>
                }
              </div>
            ))}
          </motion.div>

          {/* Quick nav shortcuts */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '16px 20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '12px' }}>Quick Access</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Manage Students',     section: 'students',     color: '#3B82F6' },
                { label: 'Certificate Approvals', section: 'certificates', color: '#F59E0B' },
                { label: 'Analytics',            section: 'analytics',    color: '#10B981' },
                { label: 'Bulk Messaging',       section: 'messaging',    color: '#6366F1' },
              ].map((item) => (
                <button key={item.section} onClick={() => onNavigate?.(item.section)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(0,0,0,0.02)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${item.color}08`; e.currentTarget.style.borderColor = `${item.color}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a1a1a' }}>{item.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

AdminOverview.propTypes = { onNavigate: PropTypes.func };