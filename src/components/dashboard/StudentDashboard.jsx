import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import StudentSidebar from './student/StudentSidebar';
import CourseLearning from './student/CourseLearningDashboard/CourseLearning';
import CourseProgress from './student/CourseProgress';
import CertificateSection from './student/CertificateSection';
import StudentProfile from './student/StudentProfile';
import { api } from '@/api/auth';

const STUDENT_SECTIONS = {
  COURSE: 'course',
  PROGRESS: 'progress',
  CERTIFICATE: 'certificate',
  PROFILE: 'profile',
};

// Sidebar widths — keep in sync with StudentSidebar's own widths
const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// ── Section meta ──────────────────────────────────────────────────────────────
const SECTION_META = {
  [STUDENT_SECTIONS.COURSE]: {
    eyebrow: 'Learning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.PROGRESS]: {
    eyebrow: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.CERTIFICATE]: {
    eyebrow: 'Achievement',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
  [STUDENT_SECTIONS.PROFILE]: {
    eyebrow: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
};

// ── Top Header ────────────────────────────────────────────────────────────────
function TopHeader({ user, activeSection, courseData, theme }) {
  const meta = SECTION_META[activeSection];
  const initials = (
    (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') ||
    user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ||
    'U'
  ).toUpperCase();

  const sectionTitle =
    activeSection === STUDENT_SECTIONS.COURSE
      ? courseData?.name || 'Continue Learning'
      : activeSection === STUDENT_SECTIONS.PROGRESS ? 'Your Progress'
      : activeSection === STUDENT_SECTIONS.CERTIFICATE ? 'Certificate'
      : 'Account Settings';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      backgroundColor: theme.white,
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px',
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
        <span style={{
          fontSize: '12px', fontWeight: '600', color: theme.textLight,
          textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {theme.brandName}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke={theme.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: '700', color: theme.primary,
          overflow: 'hidden',
        }}>
          <span style={{ flexShrink: 0 }}>{meta.icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sectionTitle}
          </span>
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
        <button
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: `1px solid ${theme.border}`, backgroundColor: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.textLight, transition: 'all 0.15s ease', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.cream; e.currentTarget.style.color = theme.primary; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.textLight; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div style={{ width: '1px', height: '22px', backgroundColor: theme.border }}/>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 4px 4px 10px', borderRadius: '40px',
          border: `1px solid ${theme.border}`, cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.cream}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{
            fontSize: '12px', fontWeight: '600', color: theme.text,
            maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.first_name || user?.name || 'Student'}
          </span>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
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
function PageHeader({ activeSection, courseData, theme }) {
  const meta = SECTION_META[activeSection];
  const titles = {
    [STUDENT_SECTIONS.COURSE]: courseData?.name || 'Continue Learning',
    [STUDENT_SECTIONS.PROGRESS]: 'Your Progress',
    [STUDENT_SECTIONS.CERTIFICATE]: 'Your Certificate',
    [STUDENT_SECTIONS.PROFILE]: 'Account Settings',
  };
  const subtitles = {
    [STUDENT_SECTIONS.COURSE]: courseData?.description || 'Pick up right where you left off.',
    [STUDENT_SECTIONS.PROGRESS]: 'Track your learning journey and module completion.',
    [STUDENT_SECTIONS.CERTIFICATE]: 'Download and share your achievement.',
    [STUDENT_SECTIONS.PROFILE]: 'Manage your personal information and preferences.',
  };

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
        background: `${theme.primary}15`, border: `1px solid ${theme.primary}30`,
        marginBottom: '12px',
      }}>
        <span style={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>{meta.icon}</span>
        <span style={{
          fontSize: '10px', fontWeight: '700', color: theme.primary,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          {meta.eyebrow}
        </span>
      </div>

      <h1 style={{
        margin: '0 0 6px',
        fontSize: 'clamp(20px, 2.5vw, 30px)',
        fontWeight: '800', color: theme.text,
        letterSpacing: '-0.025em', lineHeight: 1.2,
      }}>
        {titles[activeSection]}
      </h1>

      <p style={{ margin: 0, fontSize: '13px', color: theme.textLight, lineHeight: 1.6, maxWidth: '500px' }}>
        {subtitles[activeSection]}
      </p>

      <div style={{
        marginTop: '20px', height: '1px',
        background: `linear-gradient(to right, ${theme.border}, transparent)`,
      }}/>
    </motion.div>
  );
}

// ── Progress Banner ───────────────────────────────────────────────────────────
function ProgressBanner({ progressData, theme }) {
  const pct = progressData?.completion_percentage ?? 0;
  if (!progressData) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        margin: '0 0 28px', padding: '16px 20px', borderRadius: '14px',
        background: `linear-gradient(135deg, ${theme.cream}, ${theme.lightCream})`,
        border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '140px' }}>
        <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: theme.text }}>Course Progress</p>
        <p style={{ margin: 0, fontSize: '11px', color: theme.textLight }}>
          {pct < 100 ? `${Math.round(100 - pct)}% remaining — you're doing great!` : 'Course complete 🎉'}
        </p>
      </div>
      <div style={{ flex: 2, minWidth: '140px' }}>
        <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(to right, ${theme.primary}, #f59e0b)` }}
          />
        </div>
      </div>
      <div style={{
        padding: '6px 14px', borderRadius: '999px',
        background: theme.primary, color: '#fff',
        fontSize: '13px', fontWeight: '800', flexShrink: 0,
      }}>
        {Math.round(pct)}%
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboard({ user }) {
  const [activeSection, setActiveSection] = useState(STUDENT_SECTIONS.COURSE);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const THEME = {
    primary: '#B8652F',
    darkBrown: '#5C3A1F',
    cream: '#F5EFE7',
    lightCream: '#FAF7F2',
    text: '#2D2D2D',
    textLight: '#666666',
    border: '#E8DFD7',
    white: '#FFFFFF',
    brandName: courseData?.brand_name || 'FlowMate Academy',
    brandTagline: courseData?.brand_tagline || '',
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const fetchCourseData = async () => {
      try {
        setLoading(true); setError(null);
        const response = await api.get('/api/dashboard/my-course/', { signal: abortController.signal });
        if (isMounted) {
          setCourseData(response.data);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          if (import.meta.env.DEV) console.debug('[StudentDashboard] Failed to load course:', err.message);
          setError('Failed to load your course');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCourseData();
    return () => { isMounted = false; abortController.abort(); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const fetchSectionData = async () => {
      try {
        setLoading(true); setError(null);
        if (activeSection === STUDENT_SECTIONS.PROGRESS) {
          const response = await api.get('/api/dashboard/my-progress/', { signal: abortController.signal });
          if (isMounted) setProgressData(response.data);
        }
        if (activeSection === STUDENT_SECTIONS.CERTIFICATE) {
          try {
            const response = await api.get('/api/dashboard/my-certificate/', { signal: abortController.signal });
            if (isMounted) setCertificateData(response.data);
          } catch (err) {
            // 404 = certificate not yet earned — not an error worth surfacing
            if (err.response?.status === 404) {
              if (isMounted) setCertificateData(null);
            } else {
              throw err;
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          if (import.meta.env.DEV) console.debug('[StudentDashboard] Failed to fetch section data:', err.message);
          setError('Failed to load data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSectionData();
    return () => { isMounted = false; abortController.abort(); };
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case STUDENT_SECTIONS.COURSE:
        return <CourseLearning courseData={courseData} loading={loading} error={error} theme={THEME} />;
      case STUDENT_SECTIONS.PROGRESS:
        return <CourseProgress courseData={courseData} progressData={progressData} loading={loading} error={error} theme={THEME} />;
      case STUDENT_SECTIONS.CERTIFICATE:
        return <CertificateSection courseData={courseData} certificateData={certificateData} user={user} loading={loading} error={error} theme={THEME} />;
      case STUDENT_SECTIONS.PROFILE:
        return <StudentProfile user={user} theme={THEME} />;
      default:
        return <CourseLearning courseData={courseData} loading={loading} error={error} theme={THEME} />;
    }
  };

  const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      <style>{`
        .sdash-main::-webkit-scrollbar { width: 5px; }
        .sdash-main::-webkit-scrollbar-track { background: transparent; }
        .sdash-main::-webkit-scrollbar-thumb { background: #E8DFD7; border-radius: 999px; }
        .sdash-main::-webkit-scrollbar-thumb:hover { background: #B8652F55; }
      `}</style>

      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: THEME.lightCream,
      }}>

        <div style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
          zIndex: 30,
          overflow: 'hidden',
        }}>
          <StudentSidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            user={user}
            progressPercent={courseData?.progress?.completion_percentage ?? 0}
          />
        </div>

        <div
          className="sdash-main"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: THEME.white,
            borderLeft: `1px solid ${THEME.border}`,
          }}
        >
          <TopHeader
            user={user}
            activeSection={activeSection}
            courseData={courseData}
            theme={THEME}
          />

          <main
            className="sdash-main"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'clamp(24px, 3vw, 40px) clamp(20px, 4vw, 48px) 60px',
            }}
          >
            <div style={{ maxWidth: '920px', margin: '0 auto' }}>

              <PageHeader activeSection={activeSection} courseData={courseData} theme={THEME} />

              {activeSection === STUDENT_SECTIONS.COURSE && progressData && (
                <ProgressBanner progressData={progressData} theme={THEME} />
              )}

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