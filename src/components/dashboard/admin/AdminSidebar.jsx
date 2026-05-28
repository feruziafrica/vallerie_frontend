import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { logoutStudent, api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';
import { useNavigate } from 'react-router-dom';

/* ── Build nav items with live counts ── */
const buildNavItems = ({ pendingJobPostings, pendingJobSeekers, totalStudents, pendingCertificates }) => [
  {
    id: 'overview',
    label: 'Overview',
    badge: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'students',
    label: 'Students',
    badge: totalStudents > 0 ? String(totalStudents) : null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'certificates',
    label: 'Certificates',
    badge: pendingCertificates > 0 ? String(pendingCertificates) : null,
    badgeColor: '#10B981',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
  {
    id: 'messaging',
    label: 'Messaging',
    badge: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    badge: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'job_postings',
    label: 'Job Postings',
    badge: pendingJobPostings > 0 ? String(pendingJobPostings) : null,
    badgeColor: '#F59E0B',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'job_seekers',
    label: 'Job Seekers',
    badge: pendingJobSeekers > 0 ? String(pendingJobSeekers) : null,
    badgeColor: '#8B5CF6',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M16 3.5A6 6 0 0 1 20 9"/>
      </svg>
    ),
  },
];

const SYSTEM_ITEMS = [
  {
    id: 'settings',
    label: 'Settings',
    badge: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

/* ── Pulsing skeleton dot for badges loading ── */
function BadgeSkel() {
  return (
    <span style={{
      display: 'inline-block', width: '22px', height: '16px', borderRadius: '99px',
      background: 'rgba(255,255,255,0.07)',
      animation: 'badgePulse 1.4s ease-in-out infinite',
    }} />
  );
}

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  sidebarOpen,
  onToggleSidebar,
  user,
  // These can still be passed down from a parent that manages global state,
  // but the sidebar also fetches its own counts so it's self-sufficient.
  pendingJobPostings: propPendingJobPostings = 0,
  pendingJobSeekers:  propPendingJobSeekers  = 0,
}) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  /* ── Live badge counts ── */
  const [counts, setCounts] = useState({
    totalStudents:      0,
    pendingCertificates: 0,
    pendingJobPostings:  propPendingJobPostings,
    pendingJobSeekers:   propPendingJobSeekers,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const res = await api.get(endpoints.dashboard.stats);
      const d = res.data ?? {};
      setCounts({
        totalStudents:       d.total_students        ?? propPendingJobPostings,
        pendingCertificates: d.pending_certificates  ?? 0,
        pendingJobPostings:  d.pending_job_postings  ?? propPendingJobPostings,
        pendingJobSeekers:   d.pending_job_seekers   ?? propPendingJobSeekers,
      });
    } catch {
      // Silent — fallback to prop values, counts just won't show
      setCounts((prev) => ({
        ...prev,
        pendingJobPostings: propPendingJobPostings,
        pendingJobSeekers:  propPendingJobSeekers,
      }));
    } finally {
      setCountsLoading(false);
    }
  }, [propPendingJobPostings, propPendingJobSeekers]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Keep in sync if parent updates prop values after initial mount
  useEffect(() => {
    setCounts((prev) => ({
      ...prev,
      pendingJobPostings: propPendingJobPostings,
      pendingJobSeekers:  propPendingJobSeekers,
    }));
  }, [propPendingJobPostings, propPendingJobSeekers]);

  const NAV_ITEMS = buildNavItems(counts);

  const handleLogout = async () => {
    try { await logoutStudent(); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const handleNav = (id) => {
    onSelectSection(id);
    if (window.innerWidth < 768) onToggleSidebar();
  };

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || 'A';

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email || 'Administrator';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        .admin-sidebar * { box-sizing: border-box; }

        .nav-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          border: none; cursor: pointer; text-align: left;
          background: transparent;
          transition: background 0.15s, color 0.15s;
          position: relative;
          font-family: 'Geist', sans-serif;
          margin-bottom: 2px;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.04); }
        .nav-btn.active { background: rgba(184,101,47,0.15); }
        .nav-btn::before {
          content: ''; position: absolute; left: 0; top: 25%; bottom: 25%;
          width: 2.5px; border-radius: 0 2px 2px 0;
          background: #B8652F;
          transform: scaleY(0); transition: transform 0.2s;
        }
        .nav-btn.active::before { transform: scaleY(1); }

        .sidebar-scrollbar::-webkit-scrollbar { width: 3px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,101,47,0.3); border-radius: 99px; }

        .profile-row-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px; border-radius: 8px;
          border: none; background: transparent; cursor: pointer;
          transition: background 0.15s;
          font-family: 'Geist', sans-serif;
          margin-bottom: 6px;
        }
        .profile-row-btn:hover { background: rgba(255,255,255,0.04); }

        @keyframes badgePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Mobile toggle */}
      <motion.button
        onClick={onToggleSidebar}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 50,
          width: '40px', height: '40px', borderRadius: '10px',
          background: '#B8652F', border: 'none', cursor: 'pointer',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(184,101,47,0.4)',
        }}
        className="md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          {sidebarOpen
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </motion.button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="admin-sidebar sidebar-scrollbar"
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -240 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px', zIndex: 30,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden',
          fontFamily: "'Geist', sans-serif",
          background: 'linear-gradient(180deg, #0D1117 0%, #0a0e14 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #B8652F, #7A3B10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Instrument Serif', serif", fontSize: '16px', color: '#F5EFE7', flexShrink: 0 }}>
            V
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#F5EFE7', letterSpacing: '-0.02em' }}>FlowMate Talents</div>
            <div style={{ fontSize: '9px', color: 'rgba(245,239,231,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Admin</div>
          </div>
        </div>

        {/* Workspace label */}
        <div style={{ padding: '20px 18px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,239,231,0.22)' }}>Workspace</span>
        </div>

        <nav style={{ padding: '0 8px', flex: 1 }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = activeSection === item.id;
            const badgeColor = item.badgeColor || '#B8652F';
            return (
              <motion.button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                whileHover={{ x: 2 }}
              >
                <span style={{ color: isActive ? '#B8652F' : 'rgba(245,239,231,0.38)', transition: 'color 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#F5EFE7' : 'rgba(245,239,231,0.55)', flex: 1, transition: 'color 0.15s', letterSpacing: '-0.01em' }}>
                  {item.label}
                </span>
                {/* Show skeleton while loading, then real badge */}
                {countsLoading
                  ? (item.id === 'students' || item.id === 'certificates' || item.id === 'job_postings' || item.id === 'job_seekers')
                    ? <BadgeSkel />
                    : null
                  : item.badge && (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{ fontSize: '10px', fontWeight: 600, color: isActive ? '#F5EFE7' : badgeColor, background: isActive ? badgeColor : `${badgeColor}22`, padding: '1px 6px', borderRadius: '99px', transition: 'all 0.15s', flexShrink: 0, fontFamily: "'DM Mono', monospace" }}
                      >
                        {item.badge}
                      </motion.span>
                    )
                }
              </motion.button>
            );
          })}

          {/* System section */}
          <div style={{ padding: '16px 4px 8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,239,231,0.22)' }}>System</span>
          </div>

          {SYSTEM_ITEMS.map((item, i) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (NAV_ITEMS.length + i) * 0.04, duration: 0.25 }}
                whileHover={{ x: 2 }}
              >
                <span style={{ color: isActive ? '#B8652F' : 'rgba(245,239,231,0.38)', transition: 'color 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#F5EFE7' : 'rgba(245,239,231,0.55)', flex: 1, transition: 'color 0.15s', letterSpacing: '-0.01em' }}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, marginTop: 'auto' }}>
          <button className="profile-row-btn">
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg, #B8652F, #7A3B10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#F5EFE7' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#F5EFE7', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: 'rgba(245,239,231,0.35)', fontWeight: 500 }}>
                  {user?.is_superuser ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,239,231,0.3)" strokeWidth="2" strokeLinecap="round">
              <path d="M7 15l5 5 5-5M7 9l5-5 5 5"/>
            </svg>
          </button>

          <motion.button
            whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogout(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.18)', background: 'rgba(220,38,38,0.06)', cursor: 'pointer', textAlign: 'left', fontFamily: "'Geist', sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(220,38,38,0.75)' }}>Sign out</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '16px' }}
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#0D1117', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', maxWidth: '320px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', fontFamily: "'Geist', sans-serif" }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#F5EFE7' }}>Sign out?</h3>
              <p style={{ margin: '0 0 22px', fontSize: '13px', color: 'rgba(245,239,231,0.45)', lineHeight: 1.6 }}>
                You'll need to sign in again to access the admin dashboard.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowLogout(false)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: 'rgba(245,239,231,0.7)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Geist', sans-serif", boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}
                >
                  Sign out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

AdminSidebar.propTypes = {
  activeSection:      PropTypes.string.isRequired,
  onSelectSection:    PropTypes.func.isRequired,
  sidebarOpen:        PropTypes.bool.isRequired,
  onToggleSidebar:    PropTypes.func.isRequired,
  user:               PropTypes.object.isRequired,
  pendingJobPostings: PropTypes.number,
  pendingJobSeekers:  PropTypes.number,
};