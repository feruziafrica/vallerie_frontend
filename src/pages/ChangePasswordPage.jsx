// src/pages/ChangePasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Same EyeIcon as LoginModal ───────────────────────────────────────────────
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

// ── Password strength calculator ─────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '#EAE6E0' };
  let score = 0;
  if (pwd.length >= 8)                    score++;
  if (pwd.length >= 12)                   score++;
  if (/[A-Z]/.test(pwd))                  score++;
  if (/[0-9]/.test(pwd))                  score++;
  if (/[^A-Za-z0-9]/.test(pwd))          score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#dc2626' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good',   color: '#3b82f6' };
  if (score <= 4) return { score, label: 'Strong', color: '#16a34a' };
  return           { score, label: 'Very strong',  color: '#15803d' };
};

// ── Requirement checker ───────────────────────────────────────────────────────
const requirements = [
  { label: 'At least 8 characters',       test: (p) => p.length >= 8         },
  { label: 'One uppercase letter (A–Z)',   test: (p) => /[A-Z]/.test(p)       },
  { label: 'One number (0–9)',             test: (p) => /[0-9]/.test(p)       },
  { label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [error,           setError]           = useState('');

  const strength = getStrength(newPassword);
  const allMet   = requirements.every((r) => r.test(newPassword));

  const extractError = (err) => {
    const data = err?.response?.data;
    if (data) {
      if (typeof data === 'string')       return data;
      if (data.detail)                    return data.detail;
      if (data.error) {
        return Array.isArray(data.error)
          ? data.error.join(' ')
          : data.error;
      }
      if (data.non_field_errors)          return data.non_field_errors[0];
      const values = Object.values(data).flat();
      if (values.length)                  return String(values[0]);
    }
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword)                       { setError('New password is required.');         return; }
    if (!allMet)                            { setError('Please meet all password requirements.'); return; }
    if (newPassword !== confirmPassword)    { setError('Passwords do not match.');            return; }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        { new_password: newPassword, confirm_password: confirmPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );

      // Clear the forced-change flag
      localStorage.setItem('must_change_password', 'false');

      setSuccess(true);
      setLoading(false);

      // Brief success pause then redirect
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800);

    } catch (err) {
      setLoading(false);
      setError(extractError(err));
    }
  };

  return (
    <>
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-card { animation: pageIn 280ms ease; }

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

        @keyframes checkIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .check-in { animation: checkIn 300ms cubic-bezier(0.34,1.56,0.64,1); }

        .req-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #888780;
          transition: color 200ms ease;
        }
        .req-row.met { color: #16a34a; }

        .pwd-input:focus { border-color: #B5530A !important; }
      `}</style>

      {/* Full page background — same warm tone as modal footer */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDF6EE 0%, #F6F3EE 60%, #EAE6E0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}>
        <div
          className="page-card"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(44,15,0,0.10)',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div style={{ padding: '28px 28px 20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C0F00' }}>
                  {success ? '✅ Password updated!' : '🔒 Set your password'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888780', lineHeight: 1.5 }}>
                  {success
                    ? 'Taking you to your dashboard…'
                    : 'Choose a strong password to secure your account'}
                </p>
              </div>

              {/* FlowMate brand mark */}
              <div style={{
                width: '36px', height: '36px',
                background: '#B5530A',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            <div style={{ height: '1px', background: '#EAE6E0' }} />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ padding: '0 28px 8px' }}>

            {/* New password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 600, color: '#2C0F00', marginBottom: '6px',
              }}>
                New password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="pwd-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  disabled={loading || success}
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    fontSize: '14px', color: '#1A1A18',
                    background: '#FFFFFF',
                    border: `1.5px solid ${error && !newPassword ? '#dc2626' : '#EAE6E0'}`,
                    borderRadius: '8px', outline: 'none',
                    transition: 'border-color 200ms ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '12px',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#888780',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon isVisible={showNew} />
                </button>
              </div>
            </div>

            {/* ── Strength bar ── */}
            {newPassword && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex', gap: '4px', marginBottom: '6px',
                }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: '4px', borderRadius: '2px',
                      background: i <= strength.score ? strength.color : '#EAE6E0',
                      transition: 'background 300ms ease',
                    }} />
                  ))}
                </div>
                <p style={{
                  margin: 0, fontSize: '12px', fontWeight: 600,
                  color: strength.color, transition: 'color 300ms ease',
                }}>
                  {strength.label}
                </p>
              </div>
            )}

            {/* ── Requirements checklist ── */}
            {newPassword && (
              <div style={{
                background: '#F6F3EE', borderRadius: '8px',
                padding: '12px 14px', marginBottom: '16px',
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                {requirements.map((req) => {
                  const met = req.test(newPassword);
                  return (
                    <div key={req.label} className={`req-row${met ? ' met' : ''}`}>
                      <span style={{ flexShrink: 0 }}>
                        {met
                          ? <span className="check-in" style={{ color: '#16a34a' }}>✓</span>
                          : <span style={{ color: '#EAE6E0' }}>○</span>
                        }
                      </span>
                      {req.label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 600, color: '#2C0F00', marginBottom: '6px',
              }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="pwd-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  disabled={loading || success}
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    fontSize: '14px', color: '#1A1A18',
                    background: '#FFFFFF',
                    border: `1.5px solid ${
                      confirmPassword && confirmPassword !== newPassword
                        ? '#dc2626'
                        : confirmPassword && confirmPassword === newPassword
                        ? '#16a34a'
                        : '#EAE6E0'
                    }`,
                    borderRadius: '8px', outline: 'none',
                    transition: 'border-color 200ms ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '12px',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#888780',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon isVisible={showConfirm} />
                </button>
              </div>

              {/* Inline match indicator */}
              {confirmPassword && (
                <p style={{
                  margin: '6px 0 0', fontSize: '12px', fontWeight: 500,
                  color: confirmPassword === newPassword ? '#16a34a' : '#dc2626',
                }}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Error box — same as LoginModal */}
            {error && (
              <div
                className="shake"
                role="alert"
                style={{
                  marginBottom: '16px', padding: '12px 14px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#dc2626" strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: 500, lineHeight: 1.4 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit — same style as LoginModal */}
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
                '✓ Password updated!'
              ) : loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Set password & continue →'
              )}
            </button>
          </form>

          {/* ── Footer — same as LoginModal ── */}
          <div style={{ padding: '16px 28px 28px' }}>
            <div style={{
              background: '#F6F3EE', borderRadius: '10px',
              padding: '14px 16px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#5C3D2A', lineHeight: 1.5 }}>
                This is a one-time step. You won't be asked again after setting your password.
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
}