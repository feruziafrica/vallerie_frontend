import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { logoutStudent } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { id: 'course',       label: 'My Course',   icon: CourseIcon,   desc: 'Continue learning'   },
  { id: 'progress',    label: 'Progress',     icon: ProgressIcon, desc: 'Track your journey'  },
  { id: 'certificate', label: 'Certificate',  icon: CertIcon,     desc: 'Your achievements'   },
  { id: 'profile',     label: 'Account',      icon: AccountIcon,  desc: 'Settings & profile'  },
];

// ─── Palette (matches the screenshot exactly) ────────────────────────────────
const C = {
  bg:           '#111009',      // sidebar base
  surface:      '#1a1712',      // card / hover surface
  activeBg:     '#1f1a10',      // active item fill
  border:       'rgba(255,255,255,0.055)',
  accent:       '#c97a3a',      // amber
  accentDim:    'rgba(201,122,58,0.18)',
  accentGlow:   'rgba(201,122,58,0.35)',
  textPrimary:  '#f0e8da',
  textSecondary:'rgba(237,229,216,0.62)',
  textMuted:    'rgba(237,229,216,0.35)',
  iconInactive: 'rgba(237,229,216,0.5)',
  danger:       '#e05252',
  dangerBg:     'rgba(224,82,82,0.08)',
  dangerBorder: 'rgba(224,82,82,0.22)',
  green:        '#3ecf8e',
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function CourseIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function ProgressIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  );
}
function CertIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
function AccountIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name || 'S')
    .split(' ').slice(0, 2)
    .map(w => w[0]?.toUpperCase()).join('');
  return (
    <div style={{
      width: '34px', height: '34px', borderRadius: '9px',
      background: 'linear-gradient(135deg, #c97a3a 0%, #8B4513 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: '700', color: '#fff',
      letterSpacing: '0.04em', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '10.5px', fontWeight: '600', color: C.textMuted,
      letterSpacing: '0.13em', textTransform: 'uppercase',
      padding: '6px 16px 5px', margin: '0 0 2px',
    }}>
      {children}
    </p>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function StudentSidebar({
  activeSection,
  onSelectSection,
  sidebarOpen,
  onToggleSidebar,
  user,
  progressPercent = 0,
}) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try { await logoutStudent(); } catch (err) { console.error('Logout error:', err); }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const handleNavigation = (sectionId) => {
    onSelectSection(sectionId);
    if (window.innerWidth < 768) onToggleSidebar();
  };

  const displayName  = user?.first_name || user?.full_name?.split(' ')[0] || 'Student';
  const displayEmail = user?.email || '';

  return (
    <>
      {/* ── Mobile Hamburger (only when sidebar is closed) ── */}
      {!sidebarOpen && (
        <motion.button
          onClick={onToggleSidebar}
          whileTap={{ scale: 0.95 }}
          className="fixed top-5 left-5 z-50 md:hidden"
          style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #c97a3a, #8B4513)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(180,83,9,0.3)', color: 'white',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </motion.button>
      )}

      {/* ── Mobile Backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: 'rgba(8,6,4,0.72)', backdropFilter: 'blur(6px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        className="fixed md:static left-0 top-0 h-screen z-30 flex flex-col overflow-hidden"
        style={{
          width: '264px',
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
        }}
      >

        {/* ── Brand ── */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #c97a3a, #8B4513)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>
              🎓
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '800', color: C.textPrimary, margin: 0, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                FlowMate
              </p>
              <p style={{ fontSize: '9.5px', color: C.textMuted, margin: 0, letterSpacing: '0.11em', textTransform: 'uppercase' }}>
                Academy
              </p>
            </div>
          </div>

          {/* Close — mobile only, plain white X */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav style={{
          flex: 1, padding: '10px 0',
          overflowY: 'auto',
        }}>
          <SectionLabel>Workspace</SectionLabel>

          {MENU_ITEMS.map((item, idx) => {
            const active = activeSection === item.id;
            const Icon   = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.055, duration: 0.28 }}
                style={{
                  position: 'relative',
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '11px', padding: '9px 18px',
                  border: 'none', cursor: 'pointer',
                  background: active ? C.activeBg : 'transparent',
                  textAlign: 'left',
                }}
              >
                {/* Left accent bar */}
                <div style={{
                  position: 'absolute', left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: active ? '60%' : '0%',
                  borderRadius: '0 3px 3px 0',
                  background: C.accent,
                  transition: 'height 0.2s ease',
                }} />

                {/* Icon */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? C.accentDim : 'transparent',
                  color: active ? C.accent : C.iconInactive,
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  <Icon active={active} />
                </div>

                {/* Label + desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px', fontWeight: active ? '600' : '400',
                    color: active ? C.textPrimary : C.textSecondary,
                    margin: 0, lineHeight: 1,
                    transition: 'color 0.15s',
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '11px', color: C.textMuted,
                    margin: '3px 0 0', lineHeight: 1,
                  }}>
                    {item.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* ── Footer / User ── */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {/* Progress strip */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Course Progress
              </span>
              <span style={{ fontSize: '10px', color: C.accent, fontWeight: '700' }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%', borderRadius: '999px',
                  background: `linear-gradient(to right, ${C.accent}, #f59e0b)`,
                }}
              />
            </div>
          </div>

          {/* User card */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: C.surface,
              border: `1px solid ${C.border}`,
            }}>
              <Avatar name={displayName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13.5px', fontWeight: '600', color: C.textPrimary,
                  margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayName}
                </p>
                <p style={{
                  fontSize: '11px', color: C.textMuted,
                  margin: '2px 0 0', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayEmail}
                </p>
              </div>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: C.green, flexShrink: 0,
                boxShadow: `0 0 6px ${C.green}`,
              }} />
            </div>
          </div>

          {/* Help + Sign out */}
          <div style={{ padding: '0 12px 18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                padding: '9px 14px', borderRadius: '8px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: C.textSecondary, textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSecondary; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Help & Support</span>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                padding: '9px 14px', borderRadius: '8px',
                border: `1px solid transparent`,
                background: 'transparent', cursor: 'pointer',
                color: C.textSecondary, textAlign: 'left',
                fontSize: '13px', fontWeight: '500',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.dangerBg;
                e.currentTarget.style.borderColor = C.dangerBorder;
                e.currentTarget.style.color = C.danger;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = C.textSecondary;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── Logout Modal ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{
                position: 'relative',
                background: '#1a1712',
                borderRadius: '16px',
                maxWidth: '340px', width: '100%',
                border: `1px solid ${C.border}`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '2px', background: `linear-gradient(to right, ${C.accent}, #f59e0b)` }} />

              <div style={{ padding: '24px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.textPrimary, margin: '0 0 6px' }}>
                  Sign out?
                </h3>
                <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 22px', lineHeight: 1.55 }}>
                  Your progress is saved. You can log back in anytime to continue learning.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: '8px', border: `1px solid ${C.border}`,
                      background: 'rgba(255,255,255,0.04)', color: C.textSecondary,
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: '8px', border: 'none',
                      background: 'linear-gradient(135deg, #c0392b, #96281b)',
                      color: 'white', fontSize: '13px', fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

StudentSidebar.propTypes = {
  activeSection:   PropTypes.string.isRequired,
  onSelectSection: PropTypes.func.isRequired,
  sidebarOpen:     PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  user:            PropTypes.object.isRequired,
};