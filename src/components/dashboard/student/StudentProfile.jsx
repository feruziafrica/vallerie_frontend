import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

// ── Editable Field Row ────────────────────────────────────────────────────────
function EditableField({ label, value, inputValue, icon, index, theme, isEditing, onChange, type = 'text' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderRadius: '12px',
        backgroundColor: isEditing ? theme.white : theme.lightCream,
        border: `1.5px solid ${isEditing ? theme.primary + '60' : theme.border}`,
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isEditing ? `0 0 0 3px ${theme.primary}12` : 'none',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
        background: isEditing
          ? `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}10)`
          : `linear-gradient(135deg, ${theme.cream}, ${theme.border})`,
        border: `1px solid ${isEditing ? theme.primary + '30' : theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme.primary,
        transition: 'all 0.2s ease',
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 4px', fontSize: '10px', fontWeight: '700',
          color: isEditing ? theme.primary : theme.textLight,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          transition: 'color 0.2s ease',
        }}>
          {label}
        </p>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.input
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type={type}
              value={inputValue}
              onChange={e => onChange(e.target.value)}
              style={{
                width: '100%',
                fontSize: '14px', fontWeight: '500',
                color: theme.text,
                background: 'transparent',
                border: 'none', outline: 'none',
                padding: 0, margin: 0,
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <motion.p
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                margin: 0, fontSize: '14px', fontWeight: '500',
                color: value ? theme.text : theme.textLight,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {value || 'Not provided'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Edit indicator */}
      {isEditing && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: theme.primary,
            flexShrink: 0,
            boxShadow: `0 0 6px ${theme.primary}88`,
          }}
        />
      )}
    </motion.div>
  );
}

// ── Password Input ────────────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, theme, index }) {
  const [show, setShow] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      <label style={{
        fontSize: '10px', fontWeight: '700',
        color: theme.textLight, textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: theme.lightCream,
        border: `1.5px solid ${theme.border}`,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = theme.primary + '60';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}12`;
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.primary}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          style={{
            flex: 1, fontSize: '14px', fontWeight: '500',
            color: theme.text, background: 'transparent',
            border: 'none', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: theme.textLight, padding: '0', flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}
        >
          {show ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentProfile({ user, theme }) {
  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Student';

  // ── Edit profile state ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Replace with your actual API call e.g. await api.patch('/api/auth/me/', formData)
    await new Promise(r => setTimeout(r, 900));
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  // ── Change password state ───────────────────────────────────────────────────
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async () => {
    setPwError('');
    if (pwData.newPw !== pwData.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwData.newPw.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    // Replace with your actual API call e.g. await api.post('/api/auth/change-password/', {...})
    await new Promise(r => setTimeout(r, 900));
    setPwSaving(false);
    setPwSuccess(true);
    setPwData({ current: '', newPw: '', confirm: '' });
    setTimeout(() => { setPwSuccess(false); setShowPasswordSection(false); }, 3000);
  };

  const fields = [
    {
      label: 'First Name', key: 'first_name',
      value: formData.first_name || fullName.split(' ')[0],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Last Name', key: 'last_name',
      value: formData.last_name || fullName.split(' ').slice(1).join(' '),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Email Address', key: 'email',
      value: formData.email,
      type: 'email',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: 'Phone Number', key: 'phone',
      value: formData.phone,
      type: 'tel',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '620px' }}>

      {/* ── Identity card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: '20px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          backgroundColor: theme.white,
          boxShadow: '0 4px 28px rgba(92,58,31,0.08)',
          marginBottom: '14px',
        }}
      >
        {/* Cover banner */}
        <div style={{
          height: '96px',
          background: `linear-gradient(130deg, ${theme.primary} 0%, ${theme.darkBrown} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}/>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '90px', height: '90px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', bottom: '-50px', left: '120px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}/>
        </div>

        {/* Avatar + name */}
        <div style={{ padding: '0 28px 28px', position: 'relative' }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
              border: `3px solid ${theme.white}`,
              boxShadow: `0 4px 16px rgba(92,58,31,0.25)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: '800', color: theme.white,
              marginTop: '-36px', letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </motion.div>

          <div style={{ marginTop: '12px' }}>
            <motion.h2
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '800', color: theme.text, letterSpacing: '-0.025em' }}
            >
              {formData.first_name
                ? `${formData.first_name} ${formData.last_name}`.trim()
                : fullName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              style={{ margin: 0, fontSize: '13px', color: theme.textLight }}
            >
              {formData.email || user?.email || '—'}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '14px', padding: '5px 12px', borderRadius: '999px',
              background: `${theme.primary}15`, border: `1px solid ${theme.primary}30`,
            }}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.primary, boxShadow: `0 0 6px ${theme.primary}88` }}/>
            <span style={{ fontSize: '11px', fontWeight: '700', color: theme.primary, letterSpacing: '0.06em' }}>Active Student</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Personal Information card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: '20px',
          border: `1.5px solid ${isEditing ? theme.primary + '40' : theme.border}`,
          backgroundColor: theme.white,
          boxShadow: isEditing
            ? `0 4px 28px rgba(92,58,31,0.1), 0 0 0 4px ${theme.primary}08`
            : '0 4px 28px rgba(92,58,31,0.06)',
          padding: '24px',
          marginBottom: '14px',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '800', color: theme.text }}>
              Personal Information
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: theme.textLight }}>
              {isEditing ? 'Make changes and save below' : 'Click Edit to update your details'}
            </p>
          </div>

          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '700', color: theme.primary,
                cursor: 'pointer', padding: '7px 14px', borderRadius: '999px',
                border: `1.5px solid ${theme.primary}40`, background: 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${theme.primary}10`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </motion.button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleCancelEdit}
                style={{
                  fontSize: '12px', fontWeight: '700', color: theme.textLight,
                  cursor: 'pointer', padding: '7px 14px', borderRadius: '999px',
                  border: `1.5px solid ${theme.border}`, background: 'transparent',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: '700', color: theme.white,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  padding: '7px 16px', borderRadius: '999px',
                  border: 'none',
                  background: isSaving
                    ? theme.textLight
                    : `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
                  boxShadow: `0 4px 12px ${theme.primary}40`,
                  opacity: isSaving ? 0.8 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '11px', height: '11px', borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fields.map((f, i) => (
            <EditableField
              key={f.key}
              label={f.label}
              value={f.value}
              inputValue={formData[f.key]}
              icon={f.icon}
              index={i}
              theme={theme}
              isEditing={isEditing}
              type={f.type || 'text'}
              onChange={val => setFormData(prev => ({ ...prev, [f.key]: val }))}
            />
          ))}
        </div>

        {/* Save success toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{
                marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
                background: `${theme.primary}12`, border: `1px solid ${theme.primary}30`,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: theme.primary }}>
                Profile updated successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Change Password card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: '20px',
          border: `1.5px solid ${showPasswordSection ? theme.primary + '40' : theme.border}`,
          backgroundColor: theme.white,
          boxShadow: showPasswordSection
            ? `0 4px 28px rgba(92,58,31,0.1), 0 0 0 4px ${theme.primary}08`
            : '0 4px 28px rgba(92,58,31,0.06)',
          overflow: 'hidden',
          marginBottom: '14px',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {/* Toggle header — always visible */}
        <button
          onClick={() => setShowPasswordSection(s => !s)}
          style={{
            width: '100%', padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.cream}, ${theme.border})`,
              border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: theme.primary,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '800', color: theme.text }}>
                Change Password
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: theme.textLight }}>
                Update your account password
              </p>
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: showPasswordSection ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={theme.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </motion.div>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {showPasswordSection && (
            <motion.div
              key="pw-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '0 24px 24px',
                borderTop: `1px solid ${theme.border}`,
                paddingTop: '20px',
                marginTop: '0',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <PasswordInput
                    label="Current Password" value={pwData.current} index={0} theme={theme}
                    onChange={val => setPwData(p => ({ ...p, current: val }))}
                  />
                  <PasswordInput
                    label="New Password" value={pwData.newPw} index={1} theme={theme}
                    onChange={val => setPwData(p => ({ ...p, newPw: val }))}
                  />
                  <PasswordInput
                    label="Confirm New Password" value={pwData.confirm} index={2} theme={theme}
                    onChange={val => setPwData(p => ({ ...p, confirm: val }))}
                  />
                </div>

                {/* Password strength hint */}
                {pwData.newPw && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '12px' }}
                  >
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{
                          flex: 1, height: '3px', borderRadius: '999px',
                          backgroundColor: pwData.newPw.length >= n * 3
                            ? n <= 1 ? '#ef4444'
                              : n <= 2 ? '#f59e0b'
                              : n <= 3 ? '#84cc16'
                              : theme.primary
                            : theme.border,
                          transition: 'background-color 0.2s ease',
                        }}/>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '10px', color: theme.textLight }}>
                      {pwData.newPw.length < 4 ? 'Too short' : pwData.newPw.length < 7 ? 'Weak' : pwData.newPw.length < 10 ? 'Good' : 'Strong'}
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {pwError && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        margin: '12px 0 0', fontSize: '12px', fontWeight: '600',
                        color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {pwError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                  {pwSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
                        background: `${theme.primary}12`, border: `1px solid ${theme.primary}30`,
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: theme.primary }}>
                        Password changed successfully!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwData.current || !pwData.newPw || !pwData.confirm}
                  style={{
                    width: '100%', marginTop: '18px',
                    padding: '14px 24px', borderRadius: '12px', border: 'none',
                    background: pwSaving || !pwData.current || !pwData.newPw || !pwData.confirm
                      ? theme.border
                      : `linear-gradient(135deg, ${theme.primary}, ${theme.darkBrown})`,
                    color: pwSaving || !pwData.current || !pwData.newPw || !pwData.confirm
                      ? theme.textLight
                      : theme.white,
                    fontSize: '13px', fontWeight: '700',
                    letterSpacing: '0.02em', cursor: pwSaving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: (!pwData.current || !pwData.newPw || !pwData.confirm) ? 'none' : `0 6px 18px ${theme.primary}35`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {pwSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: '13px', height: '13px', borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                        }}
                      />
                      Updating Password…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Update Password
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}

StudentProfile.propTypes = {
  user: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};



// import { motion } from 'framer-motion';
// import PropTypes from 'prop-types';

// export default function StudentProfile({ user, theme }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="rounded-lg p-8"
//       style={{ backgroundColor: theme.white, border: `1px solid ${theme.border}` }}
//     >
//       <h3 className="text-lg font-light mb-8" style={{ color: theme.text }}>
//         Account Settings
//       </h3>

//       <div className="space-y-6">
//         <div>
//           <p
//             className="text-xs uppercase tracking-widest mb-2"
//             style={{ color: theme.textLight }}
//           >
//             Full Name
//           </p>
//           <p className="text-base" style={{ color: theme.text }}>
//             {user?.first_name} {user?.last_name}
//           </p>
//         </div>

//         <div style={{ backgroundColor: theme.border, height: '1px' }} />

//         <div>
//           <p
//             className="text-xs uppercase tracking-widest mb-2"
//             style={{ color: theme.textLight }}
//           >
//             Email Address
//           </p>
//           <p className="text-base" style={{ color: theme.text }}>
//             {user?.email}
//           </p>
//         </div>

//         <div style={{ backgroundColor: theme.border, height: '1px' }} />

//         <div>
//           <p
//             className="text-xs uppercase tracking-widest mb-2"
//             style={{ color: theme.textLight }}
//           >
//             Phone Number
//           </p>
//           <p className="text-base" style={{ color: theme.text }}>
//             {user?.phone || 'Not provided'}
//           </p>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="w-full px-6 py-3 rounded-lg font-medium text-sm transition-all mt-6"
//           style={{
//             backgroundColor: theme.lightCream,
//             color: theme.text,
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.backgroundColor = `${theme.text}08`;
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.backgroundColor = theme.lightCream;
//           }}
//         >
//           Edit Profile
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

// StudentProfile.propTypes = {
//   user: PropTypes.object.isRequired,
//   theme: PropTypes.object.isRequired,
// };