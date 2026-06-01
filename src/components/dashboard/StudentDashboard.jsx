import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import StudentSidebar from './student/StudentSidebar';
import CourseLearning from './student/CourseLearningDashboard/CourseLearning';
import CourseProgress from './student/CourseProgress';
import CertificateSection from './student/CertificateSection';
import StudentProfile from './student/StudentProfile';
import { api } from '@/api/auth';

// ── Constants ─────────────────────────────────────────────────────────────────
const STUDENT_SECTIONS = {
  COURSE:      'course',
  PROGRESS:    'progress',
  CERTIFICATE: 'certificate',
  PROFILE:     'profile',
};

const SIDEBAR_EXPANDED_WIDTH  = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const MOBILE_BREAKPOINT       = 768;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getIsMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

// ── useIsMobile — reads synchronously so first render is already correct ──────
function useIsMobile() {
  // initialise from the real window width synchronously; no stale false default
  const [isMobile, setIsMobile] = useState(getIsMobile);

  // useLayoutEffect fires before paint, so any correction happens before the
  // browser draws — eliminates the flash where desktop width is applied briefly
  useLayoutEffect(() => {
    // correct immediately in case SSR sent a wrong value
    setIsMobile(getIsMobile());

    const handler = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

// ── Theme ─────────────────────────────────────────────────────────────────────
const THEME = {
  primary:    '#B8652F',
  darkBrown:  '#5C3A1F',
  cream:      '#F5EFE7',
  lightCream: '#FAF7F2',
  text:       '#2D2D2D',
  textLight:  '#666666',
  border:     '#E8DFD7',
  white:      '#FFFFFF',
};

// ── Section meta ──────────────────────────────────────────────────────────────
const SECTION_META = {
  [STUDENT_SECTIONS.COURSE]: {
    eyebrow: 'Learning',
    title:   (courseData) => courseData?.name || 'Continue Learning',
    subtitle: (courseData) => courseData?.description || 'Pick up right where you left off.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.PROGRESS]: {
    eyebrow:  'Analytics',
    title:    () => 'Your Progress',
    subtitle: () => 'Track your learning journey and module completion.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.CERTIFICATE]: {
    eyebrow:  'Achievement',
    title:    () => 'Your Certificate',
    subtitle: () => 'Download and share your achievement.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.PROFILE]: {
    eyebrow:  'Settings',
    title:    () => 'Account Settings',
    subtitle: () => 'Manage your personal information and preferences.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
};

// ── Mobile Menu Button ────────────────────────────────────────────────────────
function MobileMenuButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-label="Open navigation menu"
      style={{
        position: 'fixed', top: '14px', left: '14px', zIndex: 50,
        width: '40px', height: '40px', borderRadius: '10px',
        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.darkBrown})`,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(180,83,9,0.35)', color: '#fff',
      }}
    >
      <svg width="17" height="17" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </motion.button>
  );
}

// ── Top Header ────────────────────────────────────────────────────────────────
function TopHeader({ user, activeSection, courseData, isMobile }) {
  const meta = SECTION_META[activeSection];
  const initials = (
    (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') ||
    user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ||
    'S'
  ).toUpperCase();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      backgroundColor: THEME.white, borderBottom: `1px solid ${THEME.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 16px 0 64px' : '0 32px',
      height: '64px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
        <span style={{
          fontSize: '11px', fontWeight: '600', color: THEME.textLight,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {courseData?.brand_name || 'FlowMate'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke={THEME.border} strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: '700', color: THEME.primary, overflow: 'hidden',
        }}>
          <span style={{ flexShrink: 0 }}>{meta.icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meta.title(courseData)}
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 4px 4px 10px', borderRadius: '40px',
          border: `1px solid ${THEME.border}`,
        }}>
          {!isMobile && (
            <span style={{
              fontSize: '12px', fontWeight: '600', color: THEME.text,
              maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.first_name || user?.name || 'Student'}
            </span>
          )}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.darkBrown})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '800', color: '#fff',
          }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Page Section Header ───────────────────────────────────────────────────────
function PageHeader({ activeSection, courseData }) {
  const meta = SECTION_META[activeSection];
  return (
    <motion.div
      key={activeSection}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: '28px' }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 10px 4px 8px', borderRadius: '999px',
        background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}30`,
        marginBottom: '12px',
      }}>
        <span style={{ color: THEME.primary, display: 'flex', alignItems: 'center' }}>{meta.icon}</span>
        <span style={{ fontSize: '10px', fontWeight: '700', color: THEME.primary, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {meta.eyebrow}
        </span>
      </div>
      <h1 style={{
        margin: '0 0 6px', fontSize: 'clamp(20px, 2.5vw, 30px)',
        fontWeight: '800', color: THEME.text, letterSpacing: '-0.025em', lineHeight: 1.2,
      }}>
        {meta.title(courseData)}
      </h1>
      <p style={{ margin: 0, fontSize: '13px', color: THEME.textLight, lineHeight: 1.6, maxWidth: '500px' }}>
        {meta.subtitle(courseData)}
      </p>
      <div style={{ marginTop: '20px', height: '1px', background: `linear-gradient(to right, ${THEME.border}, transparent)` }}/>
    </motion.div>
  );
}

// ── Progress Banner ───────────────────────────────────────────────────────────
function ProgressBanner({ progressData }) {
  const pct = progressData?.completion_percentage ?? 0;
  if (!progressData) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        margin: '0 0 28px', padding: '16px 20px', borderRadius: '14px',
        background: `linear-gradient(135deg, ${THEME.cream}, #FAF7F2)`,
        border: `1px solid ${THEME.border}`,
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '140px' }}>
        <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: THEME.text }}>Course Progress</p>
        <p style={{ margin: 0, fontSize: '11px', color: THEME.textLight }}>
          {pct < 100 ? `${Math.round(100 - pct)}% remaining — you're doing great!` : 'Course complete 🎉'}
        </p>
      </div>
      <div style={{ flex: 2, minWidth: '140px' }}>
        <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(to right, ${THEME.primary}, #f59e0b)` }}
          />
        </div>
      </div>
      <div style={{ padding: '6px 14px', borderRadius: '999px', background: THEME.primary, color: '#fff', fontSize: '13px', fontWeight: '800', flexShrink: 0 }}>
        {Math.round(pct)}%
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard({ user }) {
  const isMobile = useIsMobile();

  const [activeSection,   setActiveSection]   = useState(STUDENT_SECTIONS.COURSE);
  const [courseData,      setCourseData]      = useState(null);
  const [progressData,    setProgressData]    = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);

  // Derive sidebar open state directly from isMobile — no separate state, no effect,
  // no race condition. On desktop it's always open; on mobile it starts closed and
  // can be toggled. Using a ref so toggle doesn't cause full re-renders on mobile.
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When switching from mobile → desktop, reset mobile open state so it's clean
  // when user shrinks the window again. useLayoutEffect = before paint.
  useLayoutEffect(() => {
    if (!isMobile) setMobileSidebarOpen(false);
  }, [isMobile]);

  // The effective "is sidebar open" — on desktop always true, on mobile use toggle state
  const sidebarOpen = isMobile ? mobileSidebarOpen : true;
  const desktopSidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();
    const fetch_ = async () => {
      try {
        setLoading(true); setError(null);
        const res = await api.get('/api/dashboard/my-course/', { signal: ctrl.signal });
        if (isMounted) setCourseData(res.data);
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          if (import.meta.env.DEV) console.debug('[StudentDashboard] course:', err.message);
          setError('Failed to load your course');
        }
      } finally { if (isMounted) setLoading(false); }
    };
    fetch_();
    return () => { isMounted = false; ctrl.abort(); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();
    const fetch_ = async () => {
      try {
        setLoading(true); setError(null);
        if (activeSection === STUDENT_SECTIONS.PROGRESS) {
          const res = await api.get('/api/dashboard/my-progress/', { signal: ctrl.signal });
          if (isMounted) setProgressData(res.data);
        }
        if (activeSection === STUDENT_SECTIONS.CERTIFICATE) {
          try {
            const res = await api.get('/api/dashboard/my-certificate/', { signal: ctrl.signal });
            if (isMounted) setCertificateData(res.data);
          } catch (err) {
            if (err.response?.status === 404) { if (isMounted) setCertificateData(null); }
            else throw err;
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          if (import.meta.env.DEV) console.debug('[StudentDashboard] section:', err.message);
          setError('Failed to load data');
        }
      } finally { if (isMounted) setLoading(false); }
    };
    fetch_();
    return () => { isMounted = false; ctrl.abort(); };
  }, [activeSection]);

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
    if (isMobile) setMobileSidebarOpen(false);
  }, [isMobile]);

  const isCertificate = activeSection === STUDENT_SECTIONS.CERTIFICATE;
  const contentPadding = isMobile
    ? '24px 16px 60px'
    : 'clamp(24px, 3vw, 40px) clamp(20px, 4vw, 48px) 60px';

  const renderSection = () => {
    const themeWithBrand = {
      ...THEME,
      brandName:    courseData?.brand_name    || 'FlowMate Academy',
      brandTagline: courseData?.brand_tagline || '',
    };
    switch (activeSection) {
      case STUDENT_SECTIONS.COURSE:
        return <CourseLearning courseData={courseData} loading={loading} error={error} theme={themeWithBrand} />;
      case STUDENT_SECTIONS.PROGRESS:
        return <CourseProgress courseData={courseData} progressData={progressData} loading={loading} error={error} theme={themeWithBrand} />;
      case STUDENT_SECTIONS.CERTIFICATE:
        return <CertificateSection courseData={courseData} certificateData={certificateData} user={user} loading={loading} error={error} theme={themeWithBrand} />;
      case STUDENT_SECTIONS.PROFILE:
        return <StudentProfile user={user} theme={themeWithBrand} />;
      default:
        return <CourseLearning courseData={courseData} loading={loading} error={error} theme={themeWithBrand} />;
    }
  };

  return (
    <>
      <style>{`
        .sdash-scroll::-webkit-scrollbar { width: 5px; }
        .sdash-scroll::-webkit-scrollbar-track { background: transparent; }
        .sdash-scroll::-webkit-scrollbar-thumb { background: #E8DFD7; border-radius: 999px; }
        .sdash-scroll::-webkit-scrollbar-thumb:hover { background: ${THEME.primary}55; }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        backgroundColor: THEME.lightCream, position: 'relative',
      }}>

        {/* Mobile hamburger — only when sidebar is closed on mobile */}
        {isMobile && !mobileSidebarOpen && (
          <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
        )}

        {/* Sidebar wrapper
            Desktop: takes real space (pushes content right)
            Mobile: zero-width; sidebar floats as fixed overlay */}
        <div style={{
          // On mobile this is 0 so the content behind it is full-width from the start
          width:    isMobile ? 0 : `${desktopSidebarWidth}px`,
          minWidth: isMobile ? 0 : `${desktopSidebarWidth}px`,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1), min-width 0.3s cubic-bezier(0.22,1,0.36,1)',
          position: 'relative', zIndex: 30, overflow: 'visible',
        }}>
          <StudentSidebar
            activeSection={activeSection}
            onSelectSection={handleSectionChange}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => {
              if (isMobile) setMobileSidebarOpen(prev => !prev);
              // desktop toggle is handled inside StudentSidebar if it has its own state,
              // or you can lift it here — but we don't need it for the layout bug fix
            }}
            user={user}
            progressPercent={courseData?.progress?.completion_percentage ?? 0}
          />
        </div>

        {/* Mobile backdrop */}
        <AnimatePresence>
          {isMobile && mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 29,
                background: 'rgba(8,6,4,0.65)', backdropFilter: 'blur(4px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <div style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', backgroundColor: THEME.white,
          borderLeft: isMobile ? 'none' : `1px solid ${THEME.border}`,
        }}>
          <TopHeader
            user={user}
            activeSection={activeSection}
            courseData={courseData}
            isMobile={isMobile}
            onMenuOpen={() => setMobileSidebarOpen(true)}
          />

          <main className="sdash-scroll" style={{ flex: 1, overflowY: 'auto', padding: contentPadding }}>

            {/* Header + optional progress banner — always padded */}
            <div style={{ maxWidth: isCertificate ? 'none' : '920px', margin: '0 auto' }}>
              <PageHeader activeSection={activeSection} courseData={courseData} />
              {activeSection === STUDENT_SECTIONS.COURSE && progressData && (
                <ProgressBanner progressData={progressData} />
              )}
            </div>

            {/* Section content */}
            <div style={{ maxWidth: isCertificate ? 'none' : '920px', margin: '0 auto' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>

          </main>
        </div>

      </div>
    </>
  );
}

StudentDashboard.propTypes = {
  user: PropTypes.object.isRequired,
};