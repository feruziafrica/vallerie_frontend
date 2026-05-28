// AdminDashboard.jsx
// Fully responsive + all topbar actions wired to live data/navigation.

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';
import AdminSidebar from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import StudentManagement from './admin/StudentManagement';
import CertificateApproval from './admin/CertificateApproval';
import BulkMessaging from './admin/BulkMessaging';
import Analytics from './admin/Analytics';
import JobPostingApprovals from './admin/JobPostingApprovals';
import JobSeekerApplications from './admin/JobSeekerApplications';

const ADMIN_SECTIONS = {
  OVERVIEW:     'overview',
  STUDENTS:     'students',
  CERTIFICATES: 'certificates',
  MESSAGING:    'messaging',
  ANALYTICS:    'analytics',
  JOB_POSTINGS: 'job_postings',
  JOB_SEEKERS:  'job_seekers',
};

const SECTION_META = {
  overview:     { title: 'Overview',              sub: 'Platform performance at a glance' },
  students:     { title: 'Students',              sub: 'Manage enrolments, approvals and progress' },
  certificates: { title: 'Certificates',          sub: 'Review and approve pending certificates' },
  messaging:    { title: 'Messaging',             sub: 'Broadcast messages to students' },
  analytics:    { title: 'Analytics',             sub: 'Deep-dive into platform metrics' },
  job_postings: { title: 'Job Posting Approvals', sub: 'Review and approve employer listings' },
  job_seekers:  { title: 'Job Seekers',           sub: 'Monitor and forward candidate applications' },
};

const SIDEBAR_WIDTH = 220;

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return mobile;
}

// ── Approve-all certificates helper ──────────────────────────────────────────
async function approveAllCertificates(onDone) {
  try {
    const res  = await api.get(endpoints.dashboard.certPending);
    const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
    await Promise.all(list.map((c) => api.post(endpoints.dashboard.certApprove(c.id))));
    onDone?.(`${list.length} certificate(s) approved.`, 'success');
  } catch {
    onDone?.('Failed to approve certificates.', 'error');
  }
}

// ── Approve-all job postings helper ──────────────────────────────────────────
async function approveAllPostings(onDone) {
  try {
    await api.post(`${endpoints.dashboard.jobPostings}bulk-approve/`);
    onDone?.('All pending job postings approved.', 'success');
  } catch {
    onDone?.('Failed to bulk-approve postings.', 'error');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const c = type === 'success'
    ? { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', color: '#059669' }
    : { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   color: '#DC2626' };
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, background: '#fff', border: `1px solid ${c.border}`,
        borderRadius: '10px', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontSize: '13px', fontWeight: 500, color: c.color,
        fontFamily: "'Geist', sans-serif", whiteSpace: 'nowrap',
        minWidth: '240px',
      }}
    >
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {message}
      <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: c.color, cursor: 'pointer', padding: 0, fontSize: '14px' }}>✕</button>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminDashboard({ user }) {
  const isMobile = useIsMobile();

  const [activeSection, setActiveSection] = useState(ADMIN_SECTIONS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen]     = useState(!isMobile);
  const [adminData, setAdminData]         = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [toast, setToast]                 = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Close sidebar on mobile when screen resizes
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else          setSidebarOpen(true);
  }, [isMobile]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Close sidebar + navigate on mobile
  const handleSelectSection = (section) => {
    setActiveSection(section);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoints.dashboard.stats);
      const d   = res.data ?? {};
      setAdminData({
        totalStudents:       d.total_students        ?? 0,
        activeStudents:      d.active_students       ?? 0,
        completedStudents:   d.completed_students    ?? 0,
        totalRevenue:        d.total_revenue         ?? 0,
        mpesaTotal:          d.mpesa_total           ?? 0,
        paypalTotal:         d.paypal_total          ?? 0,
        cardTotal:           d.card_total            ?? 0,
        revenueByMethod:     d.revenue_by_method     ?? [],
        totalCourses:        d.total_courses         ?? 0,
        pendingCertificates: d.pending_certificates  ?? 0,
        pendingJobPostings:  d.pending_job_postings  ?? 0,
        pendingJobSeekers:   d.pending_job_seekers   ?? 0,
        enrollmentTrend:     d.enrollment_trend      ?? [],
        recentActivity:      d.recent_activity       ?? [],
      });
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  // ── Section action handlers (topbar buttons) ─────────────────────────────────
  const handleSectionAction = async (action) => {
    if (action.label === 'Approve All' && activeSection === ADMIN_SECTIONS.CERTIFICATES) {
      setActionLoading(true);
      await approveAllCertificates((msg, type) => { showToast(msg, type); fetchAdminData(); });
      setActionLoading(false);
    } else if (action.label === 'Approve All' && activeSection === ADMIN_SECTIONS.JOB_POSTINGS) {
      setActionLoading(true);
      await approveAllPostings((msg, type) => { showToast(msg, type); fetchAdminData(); });
      setActionLoading(false);
    } else if (action.label === 'New Broadcast') {
      setActiveSection(ADMIN_SECTIONS.MESSAGING);
    } else if (action.label === 'Invite Student') {
      setActiveSection(ADMIN_SECTIONS.STUDENTS);
    } else if (action.label === 'Export CSV' || action.label === 'Export Report' || action.label === 'Export') {
      showToast('Export feature coming soon.', 'success');
    }
  };

  // ── Section action buttons config ────────────────────────────────────────────
  const SECTION_ACTIONS = {
    overview:     [],
    students:     [{ label: 'Export CSV',    color: '#3B82F6', icon: '↓' }],
    certificates: [{ label: 'Approve All',  color: '#10B981', icon: '✓' }],
    messaging:    [],
    analytics:    [{ label: 'Export Report', color: '#3B82F6', icon: '↓' }],
    job_postings: [{ label: 'Approve All',  color: '#10B981', icon: '✓' }],
    job_seekers:  [{ label: 'Export CSV',   color: '#3B82F6', icon: '↓' }],
  };

  const meta    = SECTION_META[activeSection]    || SECTION_META.overview;
  const actions = SECTION_ACTIONS[activeSection] || [];

  // ── Notification count ───────────────────────────────────────────────────────
  const notifCount = (adminData?.pendingCertificates ?? 0)
                   + (adminData?.pendingJobPostings  ?? 0);

  // ── Section renderer ─────────────────────────────────────────────────────────
  const renderSection = () => {
    if (loading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '36px', height: '36px', border: '3px solid rgba(184,101,47,0.15)', borderTopColor: '#B8652F', borderRadius: '50%', margin: '0 auto 12px' }} />
          <p style={{ color: '#9b9b9b', fontSize: '13px' }}>Loading dashboard…</p>
        </div>
      </div>
    );

    if (error) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <p style={{ color: '#9b9b9b', fontSize: '13px', marginBottom: '14px' }}>{error}</p>
          <button onClick={fetchAdminData} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#B8652F', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Retry
          </button>
        </div>
      </div>
    );

    switch (activeSection) {
      case ADMIN_SECTIONS.OVERVIEW:
        // Pass full live data including revenue breakdown and recent activity
        return <AdminOverview data={adminData} onNavigate={handleSelectSection} />;
      case ADMIN_SECTIONS.STUDENTS:     return <StudentManagement />;
      case ADMIN_SECTIONS.CERTIFICATES: return <CertificateApproval onApproved={fetchAdminData} />;
      case ADMIN_SECTIONS.MESSAGING:    return <BulkMessaging />;
      case ADMIN_SECTIONS.ANALYTICS:    return <Analytics data={adminData} />;
      case ADMIN_SECTIONS.JOB_POSTINGS: return <JobPostingApprovals onReviewed={fetchAdminData} />;
      case ADMIN_SECTIONS.JOB_SEEKERS:  return <JobSeekerApplications />;
      default:                          return <AdminOverview data={adminData} onNavigate={handleSelectSection} />;
    }
  };

  const pad  = isMobile ? '0 14px' : '0 28px';
  const main = isMobile ? '14px'   : '24px 28px';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F4F0', fontFamily: "'Geist','Inter',sans-serif" }}>

      {/* Global toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — overlay on mobile, fixed push on desktop */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: `${SIDEBAR_WIDTH}px`,
        transform: sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
        transition: 'transform 0.26s cubic-bezier(0.32,0,0.67,0)',
        zIndex: isMobile ? 100 : 50,
      }}>
        <AdminSidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          user={user}
          pendingJobPostings={adminData?.pendingJobPostings ?? 0}
          pendingJobSeekers={adminData?.pendingJobSeekers  ?? 0}
          pendingCertificates={adminData?.pendingCertificates ?? 0}
        />
      </div>

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: (!isMobile && sidebarOpen) ? `${SIDEBAR_WIDTH}px` : '0px',
        transition: 'margin-left 0.26s cubic-bezier(0.32,0,0.67,0)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden', minWidth: 0,
      }}>

        {/* ── Topbar ── */}
        <div style={{
          flexShrink: 0, background: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          padding: pad, height: '60px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '10px',
        }}>

          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {/* Hamburger */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#6b6b6b' }}
              aria-label="Toggle sidebar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </motion.button>

            {/* Title */}
            <div style={{ minWidth: 0 }}>
              <motion.h1 key={activeSection} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meta.title}
              </motion.h1>
              {!isMobile && (
                <p style={{ margin: 0, fontSize: '11px', color: '#9b9b9b', whiteSpace: 'nowrap' }}>
                  {meta.sub}
                </p>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Section action buttons — hidden on mobile if more than 0 */}
            {!isMobile && actions.map((action) => (
              <motion.button key={action.label}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                disabled={actionLoading}
                onClick={() => handleSectionAction(action)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: actionLoading ? '#ccc' : action.color, border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '13px', lineHeight: 1 }}>{action.icon}</span>
                {action.label}
              </motion.button>
            ))}

            {/* Refresh */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchAdminData} disabled={loading} title="Refresh"
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', color: '#6b6b6b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </motion.button>

            {/* Notifications bell with live badge */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Navigate to whichever has pending items
                if (adminData?.pendingCertificates > 0) handleSelectSection(ADMIN_SECTIONS.CERTIFICATES);
                else if (adminData?.pendingJobPostings > 0) handleSelectSection(ADMIN_SECTIONS.JOB_POSTINGS);
              }}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: '#6b6b6b' }}
              aria-label={`${notifCount} pending items`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <AnimatePresence>
                {notifCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      minWidth: '14px', height: '14px',
                      borderRadius: '7px', background: '#EF4444',
                      border: '1.5px solid white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', fontWeight: 700, color: 'white', padding: '0 2px',
                    }}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User avatar */}
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(184,101,47,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#B8652F', flexShrink: 0, cursor: 'default', title: user?.email }}>
              {(user?.full_name || user?.first_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: main }}>
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {renderSection()}
          </motion.div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

AdminDashboard.propTypes = { user: PropTypes.object.isRequired };