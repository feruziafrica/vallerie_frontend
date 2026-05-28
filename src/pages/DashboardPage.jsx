// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import StudentDashboard        from '@/components/dashboard/StudentDashboard';
import AdminDashboard          from '@/components/dashboard/AdminDashboard';

// DashboardPage no longer fetches the user itself.
// App.jsx already called getCurrentUser() and passed the result down as a prop.
// Doing it again here caused two problems:
//   1. localStorage.getItem('access_token') always returns null — the new
//      auth system stores the token in memory, not localStorage. So the old
//      check immediately redirected to "/" before any fetch happened.
//   2. Even if the localStorage check were removed, calling getCurrentUser()
//      a second time fires another GET /api/auth/user/ request unnecessarily.
//
// The fix: receive `user` and `authLoading` as props from App.jsx (which
// already has the resolved user from its own getCurrentUser() call) and
// use those directly. No extra network request, no localStorage check.

export default function DashboardPage({ user, authLoading }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after the auth check in App.jsx has fully resolved.
    // If we redirect while authLoading is still true, we race against
    // App's getCurrentUser() and kick out legitimate users.
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Still loading — App.jsx's getCurrentUser() hasn't resolved yet
  if (authLoading) {
    return <LoadingDashboard />;
  }

  // No user after loading — useEffect above will redirect, show nothing meanwhile
  if (!user) {
    return <LoadingDashboard />;
  }

  // Route to admin or student dashboard based on user_type
  // user_type is cosmetic only — Django enforces actual permissions on every request
  if (user?.user_type === 'admin' || user?.is_admin) {
    return <AdminDashboard user={user} />;
  }

  return <StudentDashboard user={user} />;
}

// ── Loading state ──────────────────────────────────────────────────────────────
const LoadingDashboard = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div
        className="w-12 h-12 border-2 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          borderColor:    '#B8652F20',
          borderTopColor: '#B8652F',
          animation:      'spin 2s linear infinite',
        }}
      />
      <p className="text-sm" style={{ color: '#666666' }}>
        Loading your dashboard…
      </p>
    </div>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// ── Error state ────────────────────────────────────────────────────────────────
const ErrorDashboard = ({ error }) => (
  <div className="min-h-screen bg-white flex items-center justify-center px-5">
    <div className="text-center max-w-md">
      <p className="text-sm mb-6" style={{ color: '#5C3A1F' }}>
        {error}
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 rounded-lg font-medium transition-all text-white"
        style={{ backgroundColor: '#B8652F' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        Back to Home
      </a>
    </div>
  </div>
);