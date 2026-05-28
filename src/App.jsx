// src/App.jsx
// HOTFIX: Stops the infinite /api/auth/user/ + /token/refresh/ loop.
//
// ROOT CAUSE:
// The previous version called getCurrentUser() unconditionally on every mount.
// When the HttpOnly cookie is not being sent (due to Secure flag mismatch on
// HTTP localhost, or CORS withCredentials misconfiguration), /token/refresh/
// also returns 401. _handleSessionExpired() calls window.location.replace('/')
// which remounts App, which calls getCurrentUser() again — infinite loop.
//
// HOTFIX STRATEGY:
// Use a sessionStorage sentinel ('auth_session') as a lightweight signal that
// a login has occurred in this browser tab. This is NOT a security mechanism —
// it's just a hint to avoid calling getCurrentUser() when we know no session
// exists. The actual authentication is still enforced by Django on every request.
//
// Flow:
//   - No sentinel → skip getCurrentUser() → authLoading=false → user=null
//     → ProtectedRoute redirects to "/" cleanly, no loop
//   - Sentinel present → call getCurrentUser() → if cookie works, user set
//     → if cookie fails, sentinel cleared, user=null, redirect, loop stops
//     because sentinel is now gone

import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import HomePage           from '@/pages/HomePage';
import AcademyPage        from '@/pages/AcademyPage';
import AcademySuccessPage from '@/pages/AcademySuccessPage';
import NotFound           from '@/pages/NotFound';
import PaymentSuccess     from '@/pages/PaymentSuccess';
import PaymentCancel      from '@/pages/PaymentCancel';
import DashboardPage      from '@/pages/DashboardPage';
import OpportunitiesPage  from './pages/OpportunitiesPage';
import HireTalentPage     from './pages/HireTalentPage';
import BlogsPage          from './pages/BlogsPage';
import AboutPage          from './pages/AboutPage';
import ContactPage        from './pages/ContactPage';
import ServicesPage       from './pages/ServicesPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';

// Admin
import AdminDashboard from './components/dashboard/AdminDashboard';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Auth
import LoginModal     from '@/components/auth/LoginModal';
import { getCurrentUser } from '@/api/auth';

// Jobs
import JobPostingApprovals   from './components/dashboard/admin/JobPostingApprovals';
import JobSeekerApplications from './components/dashboard/admin/JobSeekerApplications';

// ── Sentinel key — lives in sessionStorage (cleared when tab closes) ──────────
// WHY sessionStorage not localStorage: we want the sentinel to survive page
// refreshes within a session but NOT persist across browser restarts, which
// would defeat the purpose of short-lived access tokens.
const AUTH_SENTINEL = 'va_has_session';

export const markSessionActive    = () => sessionStorage.setItem(AUTH_SENTINEL, '1');
export const clearSessionSentinel = () => sessionStorage.removeItem(AUTH_SENTINEL);
export const hasSessionSentinel   = () => sessionStorage.getItem(AUTH_SENTINEL) === '1';

// ── Loading screen ─────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <motion.div
    exit={{ opacity: 0, y: -100 }}
    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#2C0F00',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F5EDE0' }}>
        FlowMate<span style={{ color: '#B5530A' }}>VA</span>
      </span>
    </motion.div>
  </motion.div>
);

// ── Protected route ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ user, authLoading, children }) => {
  if (authLoading) return <LoadingScreen />;
  if (!user)       return <Navigate to="/" replace />;

  // Force password change before accessing the dashboard
  const mustChange = localStorage.getItem('must_change_password') === 'true';
  if (mustChange)  return <Navigate to="/change-password" replace />;

  return children;
};

// ── Admin route ────────────────────────────────────────────────────────────────
const AdminRoute = ({ user, authLoading, children }) => {
  if (authLoading) return <LoadingScreen />;
  if (!user)       return <Navigate to="/" replace />;
  if (user?.user_type !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loaded, setLoaded]                 = useState(false);
  const [user, setUser]                     = useState(null);
  const [authLoading, setAuthLoading]       = useState(true);
  const location                            = useLocation();

  // Loading screen timer
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Auth initialization ─────────────────────────────────────────────────────
  useEffect(() => {
    // HOTFIX: Only attempt to restore a session if the sentinel exists.
    // Without this guard, every cold page load (including unauthenticated
    // visitors) fires getCurrentUser() → 401 → refresh → 401 → redirect
    // → remount → repeat.
    //
    // The sentinel is set by handleLoginSuccess() below (after a successful
    // login) and cleared when the session cannot be restored.
    if (!hasSessionSentinel()) {
      // No session was ever established in this tab — skip the network call.
      setAuthLoading(false);
      return;
    }

    // Sentinel exists — attempt to restore the session via the refresh cookie.
    getCurrentUser()
      .then((fetchedUser) => {
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          // Cookie is gone or expired — clear the sentinel so we don't
          // attempt this again on the next page load.
          clearSessionSentinel();
          setUser(null);
        }
      })
      .catch(() => {
        clearSessionSentinel();
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Called by LoginModal after successful login
  const handleLoginSuccess = (loggedInUser) => {
    // Set the sentinel BEFORE updating state so that if this component
    // re-renders, the useEffect guard still passes on any subsequent mount.
    markSessionActive();
    setUser(loggedInUser);
    setAuthLoading(false);
    setLoginModalOpen(false);

    // Store must_change_password flag so ProtectedRoute can enforce it
    localStorage.setItem(
      'must_change_password',
      loggedInUser?.must_change_password ? 'true' : 'false'
    );
  };

  const isShell = location.pathname.startsWith('/dashboard') ||
                  location.pathname.startsWith('/admin-dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <AnimatePresence>
        {!loaded && <LoadingScreen key="loader" />}
      </AnimatePresence>

      {!isShell && (
        <Navbar
          onLoginClick={() => setLoginModalOpen(true)}
          user={user}
        />
      )}

      <AnimatePresence>
        {loginModalOpen && (
          <LoginModal
            key="login-modal"
            onClose={() => setLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      <main style={{ flex: 1 }}>
        <Routes>

          {/* Public */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/academy"         element={<AcademyPage />} />
          <Route path="/opportunities"   element={<OpportunitiesPage />} />
          <Route path="/hire"            element={<HireTalentPage />} />
          <Route path="/academy/success" element={<AcademySuccessPage />} />
          <Route path="/payment/verify"  element={<PaymentSuccess />} />
          <Route path="/payment/cancel"  element={<PaymentCancel />} />
          <Route path="/blogs"           element={<BlogsPage />} />
          <Route path="/services"        element={<ServicesPage />} />
          <Route path="/contact"         element={<ContactPage />} />
          <Route path="/about"           element={<AboutPage />} />

          {/* Change password — requires login but bypasses must_change_password
              guard intentionally, otherwise it would redirect to itself and loop */}
          <Route
            path="/change-password"
            element={
              authLoading ? <LoadingScreen /> :
              !user       ? <Navigate to="/" replace /> :
                            <ChangePasswordPage />
            }
          />

          {/* Student protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <DashboardPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin protected */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute user={user} authLoading={authLoading}>
                <AdminDashboard user={user} />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

      {!isShell && <Footer />}

    </div>
  );
}