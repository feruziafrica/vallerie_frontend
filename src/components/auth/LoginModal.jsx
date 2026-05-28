// src/components/auth/LoginModal.jsx
import { flushSync } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom'; // ← add useSearchParams
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { loginStudent, exchangeLoginToken } from '@/api/auth'; // ← add exchangeLoginToken

const EyeIcon = ({ isVisible }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2">
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

EyeIcon.propTypes = { isVisible: PropTypes.bool.isRequired };

export const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const inputRef                        = useRef(null);
  const navigate                        = useNavigate();
  const [searchParams]                  = useSearchParams(); // ← add this

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    // ── One-time token from email link ──────────────────────────────────
    // If the URL contains ?token=xxx, the student clicked the email link.
    // Exchange the token for JWT silently without them typing anything.
    const token = searchParams.get('token');
    if (token) {
      // Clear token from URL immediately so it never sits in browser history
      window.history.replaceState({}, document.title, window.location.pathname);
      handleTokenExchange(token);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Token exchange (email link login) ────────────────────────────────
  const handleTokenExchange = async (token) => {
    setLoading(true);
    setError('');
    try {
      const user = await exchangeLoginToken(token);

      setSuccess(true);
      setLoading(false);

      flushSync(() => { onLoginSuccess(user); });

      // must_change_password — redirect before dashboard access
      if (user?.must_change_password) {
        navigate('/change-password', { replace: true });
      } else if (user?.user_type === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      setLoading(false);
      setError(extractError(err));
    }
  };

  const extractError = (err) => {
    if (err?.message) return err.message;
    const data = err?.response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (data.detail)              return data.detail;
      if (data.error)               return data.error;
      if (data.non_field_errors)    return data.non_field_errors[0];
      const values = Object.values(data).flat();
      if (values.length)            return values[0];
    }
    return 'Something went wrong. Please try again.';
  };

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim())        { setError('Email address is required'); return; }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    if (!password)            { setError('Password is required'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const user = await loginStudent({ email, password });

      setSuccess(true);
      setError('');
      setLoading(false);

      flushSync(() => { onLoginSuccess(user); });

      // ← Check must_change_password on manual login too
      if (user?.must_change_password) {
        navigate('/change-password', { replace: true });
      } else if (user?.user_type === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      setLoading(false);
      setSuccess(false);
      setError(extractError(err));
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-card { animation: modalIn 220ms ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .shake { animation: shakeX 400ms ease; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '20px',
        }}
        role="presentation"
      >
        {/* Card */}
        <div
          className="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '28px 28px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 id="login-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C0F00' }}>
                  {success ? '✅ Welcome back!' : loading ? '⏳ Signing you in…' : 'Sign in'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888780', lineHeight: 1.5 }}>
                  {success
                    ? 'Taking you to your dashboard…'
                    : loading
                    ? 'Please wait while we verify your link…'
                    : 'Access your course dashboard and learning materials'}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#888780', fontSize: '20px', lineHeight: 1,
                  padding: '4px', borderRadius: '4px', flexShrink: 0,
                }}
                aria-label="Close"
              >✕</button>
            </div>
            <div style={{ height: '1px', background: '#EAE6E0' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '0 28px 8px' }}>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 600, color: '#2C0F00', marginBottom: '6px',
              }}>
                Email address
              </label>
              <input
                ref={inputRef}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading || success}
                style={{
                  width: '100%', padding: '10px 14px',
                  fontSize: '14px', color: '#1A1A18',
                  background: '#FFFFFF',
                  border: `1.5px solid ${error ? '#dc2626' : '#EAE6E0'}`,
                  borderRadius: '8px', outline: 'none',
                  transition: 'border-color 200ms ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#B5530A'}
                onBlur={(e)  => e.target.style.borderColor = error ? '#dc2626' : '#EAE6E0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 600, color: '#2C0F00', marginBottom: '6px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={loading || success}
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    fontSize: '14px', color: '#1A1A18',
                    background: '#FFFFFF',
                    border: `1.5px solid ${error ? '#dc2626' : '#EAE6E0'}`,
                    borderRadius: '8px', outline: 'none',
                    transition: 'border-color 200ms ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B5530A'}
                  onBlur={(e)  => e.target.style.borderColor = error ? '#dc2626' : '#EAE6E0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#888780',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon isVisible={showPassword} />
                </button>
              </div>
            </div>

            {/* Error box */}
            {error && (
              <div
                className="shake"
                role="alert"
                style={{
                  marginBottom: '16px', padding: '12px 14px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: 500, lineHeight: 1.4 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%', padding: '12px',
                background: success ? '#16a34a' : loading ? '#d4845a' : '#B5530A',
                color: '#FFFFFF', border: 'none',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: 700,
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                transition: 'background 200ms ease',
                marginBottom: '4px',
              }}
              onMouseEnter={(e) => { if (!loading && !success) e.currentTarget.style.background = '#9A3A00'; }}
              onMouseLeave={(e) => { if (!loading && !success) e.currentTarget.style.background = '#B5530A'; }}
            >
              {success ? (
                '✓ Signed in!'
              ) : loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in to dashboard →'
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ padding: '16px 28px 28px' }}>
            <div style={{
              background: '#F6F3EE', borderRadius: '10px',
              padding: '14px 16px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#5C3D2A', lineHeight: 1.5 }}>
                Login credentials are sent by FlowMate after payment is confirmed.
              </p>
              <a href="/contact" style={{
                fontSize: '12px', fontWeight: 600,
                color: '#B5530A', textDecoration: 'none',
              }}>
                Having trouble? Contact us →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

LoginModal.propTypes = {
  onClose:        PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginModal;