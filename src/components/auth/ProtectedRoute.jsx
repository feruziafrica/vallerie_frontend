import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCurrentUser } from '@/api/auth';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDF6EE 0%, #F6F3EE 60%, #EAE6E0 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            background: '#B5530A', borderRadius: '12px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            animation: 'pulse 1.2s ease infinite',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ fontSize: '14px', color: '#888780', fontWeight: 500 }}>
            Verifying access…
          </p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Force password change before accessing any protected page
  const mustChange = localStorage.getItem('must_change_password') === 'true';
  if (mustChange)   return <Navigate to="/change-password" replace />;

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};