/**
 * ApplicationFlow.jsx  [PAYMENTS DISABLED]
 * ==========================================
 * Full application flow in a single modal:
 *   Step 1 — Application form (details + CV upload)
 *   Step 2 — Success
 *
 * Fee modal removed entirely — all applications are free.
 *
 * API calls:
 *   POST /api/jobs/{slug}/apply/               → create draft
 *   POST /api/jobs/applications/{id}/cv/       → upload CV
 *   POST /api/jobs/applications/{id}/submit/   → submit
 *
 * ERROR HANDLING POLICY:
 *   - Server 5xx errors → generic "Something went wrong" message
 *   - Network errors    → generic "Check your connection" message
 *   - Server 4xx errors → safe detail field only (never raw stack traces)
 *   - Never surface Django error pages, stack traces, or internal field names
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const API_BASE    = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const spring      = { type: 'spring', stiffness: 300, damping: 28 };
const DRAFT_KEY   = (jobId) => `va_app_draft_${jobId}`;

// ── Safe error extractor ───────────────────────────────────────────────────────
// SECURITY: Never show raw server responses to the user.
// 5xx errors are always replaced with a generic message.
// 4xx errors only expose the `detail` field — never field-level validation
// messages that could reveal internal model structure.
const _safeError = (status, data, fallback = 'Something went wrong. Please try again.') => {
  if (!status) return 'Cannot connect to the server. Please check your connection.';
  if (status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 404) return 'This job listing is no longer available.';
  if (status === 400) {
    // Only expose `detail` — never raw serializer errors like
    // { "email": ["Enter a valid email address."] } which reveal field names
    if (typeof data?.detail === 'string') return data.detail;
    return fallback;
  }
  return fallback;
};

// ── Field-level error mapper ───────────────────────────────────────────────────
// Maps server validation keys to user-friendly messages.
// Never exposes internal field names or serializer error strings directly.
const FIELD_ERROR_MAP = {
  full_name:        'Please enter your full name.',
  email:            'Please enter a valid email address.',
  phone:            'Please enter a valid phone number.',
  current_location: 'Please enter your current location.',
  cover_note:       'Please tell us why you are a good fit (max 50 words).',
};

const _mapFieldErrors = (data) => {
  if (!data || typeof data !== 'object') return {};
  const mapped = {};
  for (const [key, msgs] of Object.entries(data)) {
    if (key === 'detail') continue;
    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
    // Use our safe message or a generic field error — never the raw server string
    mapped[key] = FIELD_ERROR_MAP[key] || 'Please check this field.';
  }
  return mapped;
};


// ── Floating label field ───────────────────────────────────────────────────────
function Field({ id, label, type = 'text', value, onChange, error, disabled, required, placeholder, hint }) {
  const [focused, setFocused] = useState(false);
  const active     = focused || value.length > 0;
  const isTextarea = type === 'textarea';
  const Tag        = isTextarea ? 'textarea' : 'input';

  return (
    <div style={{ position: 'relative', marginBottom: '6px' }}>
      <label htmlFor={id} style={{
        position: 'absolute', left: '16px',
        top: isTextarea ? (active ? '8px' : '16px') : (active ? '8px' : '50%'),
        transform: (!isTextarea && !active) ? 'translateY(-50%)' : 'none',
        fontSize: active ? '10px' : '13px',
        fontWeight: active ? '700' : '400',
        color: error ? '#b45309' : focused ? '#92400e' : '#a8a29e',
        letterSpacing: active ? '0.06em' : '0',
        textTransform: active ? 'uppercase' : 'none',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none', zIndex: 1,
      }}>
        {label}{required && <span style={{ color: '#d97706' }}> *</span>}
      </label>

      <Tag
        id={id}
        type={!isTextarea ? type : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        rows={isTextarea ? 4 : undefined}
        placeholder={focused ? placeholder : ''}
        style={{
          width: '100%',
          minHeight: isTextarea ? '100px' : '54px',
          paddingTop: active ? '20px' : (isTextarea ? '16px' : '0'),
          paddingBottom: isTextarea ? '10px' : '0',
          paddingLeft: '16px', paddingRight: '16px',
          background: error ? '#fffbeb' : focused ? '#fff' : '#fafaf9',
          border: `1.5px solid ${error ? '#fbbf24' : focused ? '#d97706' : '#e7e5e4'}`,
          borderRadius: '12px', fontSize: '13px', fontWeight: '500', color: '#1c1917',
          outline: 'none', resize: isTextarea ? 'vertical' : undefined,
          transition: 'all 0.18s', boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text',
          fontFamily: 'inherit', display: 'block',
        }}
      />

      {hint && !error && (
        <p style={{ fontSize: '10px', color: '#a8a29e', marginTop: '3px', marginLeft: '2px' }}>{hint}</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: '11px', color: '#b45309', marginTop: '3px', marginLeft: '2px', fontWeight: '500' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}


// ── CV Upload ──────────────────────────────────────────────────────────────────
function CVUploader({ applicationId, onUploaded, disabled }) {
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();

    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.');
      return;
    }

    setError('');
    setFile(f);

    // If no application ID yet, hold the file — will upload after draft is created
    if (!applicationId) {
      onUploaded({ pendingFile: f });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);

      const res  = await fetch(`${API_BASE}/jobs/applications/${applicationId}/cv/`, {
        method: 'POST', body: fd,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Never show raw server error — always a safe message
        setError(_safeError(res.status, data, 'CV upload failed. Please try again.'));
        return;
      }

      onUploaded(data);
    } catch {
      // Network error
      setError('Could not upload your CV. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      <motion.div
        onClick={() => !disabled && inputRef.current.click()}
        whileHover={!disabled ? { borderColor: '#d97706' } : {}}
        style={{
          border: `2px dashed ${file ? '#d97706' : '#e7e5e4'}`,
          borderRadius: '12px', padding: '18px',
          textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
          background: file ? '#fffbeb' : '#fafaf9',
          transition: 'all 0.2s', opacity: disabled ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              width: '14px', height: '14px',
              border: '2px solid #d97706', borderTopColor: 'transparent',
              borderRadius: '50%', display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
            <span style={{ fontSize: '12px', color: '#92400e', fontWeight: '600' }}>Uploading…</span>
          </div>
        ) : file ? (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', margin: '0 0 2px' }}>
              📄 {file.name}
            </p>
            <p style={{ fontSize: '11px', color: '#b45309', margin: 0 }}>Click to change</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>📎</div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#44403c', margin: '0 0 3px' }}>
              Upload your CV / Resume
            </p>
            <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>PDF, DOC, DOCX · Max 5MB</p>
          </div>
        )}
      </motion.div>

      {error && (
        <p style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: '500' }}>{error}</p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ jobTitle, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '16px 0' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}
      >
        ✓
      </motion.div>

      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1c1917', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Application Submitted!
      </h3>
      <p style={{ fontSize: '13px', color: '#78716c', lineHeight: 1.6, margin: '0 0 8px' }}>
        Your application for <strong style={{ color: '#1c1917' }}>{jobTitle}</strong> has been received.
      </p>
      <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 24px' }}>
        We'll reach out if you're shortlisted. Good luck! 🎉
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        style={{
          width: '100%', padding: '13px',
          background: 'linear-gradient(135deg, #d97706, #b45309)',
          color: '#fff', fontWeight: '800', fontSize: '13px',
          borderRadius: '12px', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Back to Opportunities
      </motion.button>
    </motion.div>
  );
}


// ── Error banner ───────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#fef3c7', borderRadius: '10px',
      padding: '10px 14px', marginBottom: '14px',
      border: '1px solid #fde68a',
    }}>
      <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>{message}</p>
    </div>
  );
}


// ── Main Application Flow Modal ────────────────────────────────────────────────
export default function ApplicationFlow({ job, onClose }) {
  const [step, setStep]               = useState('form');    // form | success
  const [application, setApplication] = useState(null);
  const [cvData, setCvData]           = useState(null);
  const [pendingCvFile, setPendingCvFile] = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');
  const [errors, setErrors]           = useState({});

  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY(job.id)) || '{}');
      return {
        full_name:        saved.full_name        || '',
        email:            saved.email            || '',
        phone:            saved.phone            || '',
        current_location: saved.current_location || '',
        cover_note:       saved.cover_note       || '',
        linkedin_url:     saved.linkedin_url     || '',
        portfolio_url:    saved.portfolio_url    || '',
      };
    } catch {
      return { full_name: '', email: '', phone: '', current_location: '', cover_note: '', linkedin_url: '', portfolio_url: '' };
    }
  });

  // Autosave draft to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY(job.id), JSON.stringify(form));
    }, 600);
    return () => clearTimeout(t);
  }, [form, job.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
    setFormError('');
  };

  const wordCount = form.cover_note.trim() ? form.cover_note.trim().split(/\s+/).length : 0;

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError('');
    setErrors({});

    // Client-side validation — catches obvious issues before any API call
    const e = {};
    if (!form.full_name.trim())        e.full_name        = 'Required';
    if (!form.email.trim())            e.email            = 'Required';
    if (!form.phone.trim())            e.phone            = 'Required';
    if (!form.current_location.trim()) e.current_location = 'Required';
    if (!form.cover_note.trim())       e.cover_note       = 'Required';
    else if (wordCount > 50)           e.cover_note       = `Too long (${wordCount}/50 words)`;
    if (!cvData && !pendingCvFile)     e.cv               = 'Please upload your CV.';

    if (Object.keys(e).length) {
      setErrors(e);
      setSubmitting(false);
      return;
    }

    try {
      // ── Step 1: Create draft ───────────────────────────────────────────────
      let app = application;

      if (!app) {
        let res, data;

        try {
          res  = await fetch(`${API_BASE}/jobs/${job.slug}/apply/`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(form),
          });
          data = await res.json().catch(() => ({}));
        } catch {
          // Network failure
          setFormError('Cannot connect to the server. Please check your connection.');
          setSubmitting(false);
          return;
        }

        if (!res.ok) {
          if (res.status === 400 && data && typeof data === 'object' && !data.detail) {
            // Field-level validation errors — map to safe messages
            setErrors(_mapFieldErrors(data));
          } else {
            setFormError(_safeError(res.status, data));
          }
          setSubmitting(false);
          return;
        }

        app = data;
        setApplication(app);
      }

      // ── Step 2: Upload CV if it was selected before draft was created ──────
      if (pendingCvFile && !cvData) {
        let cvRes, cvJson;

        try {
          const fd = new FormData();
          fd.append('file', pendingCvFile);
          cvRes  = await fetch(`${API_BASE}/jobs/applications/${app.id}/cv/`, {
            method: 'POST', body: fd,
          });
          cvJson = await cvRes.json().catch(() => ({}));
        } catch {
          setErrors({ cv: 'Could not upload your CV. Please check your connection.' });
          setSubmitting(false);
          return;
        }

        if (!cvRes.ok) {
          setErrors({ cv: _safeError(cvRes.status, cvJson, 'CV upload failed. Please try again.') });
          setSubmitting(false);
          return;
        }

        setCvData(cvJson);
      }

      // ── Step 3: Submit ─────────────────────────────────────────────────────
      let submitRes, submitData;

      try {
        submitRes  = await fetch(`${API_BASE}/jobs/applications/${app.id}/submit/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        submitData = await submitRes.json().catch(() => ({}));
      } catch {
        setFormError('Cannot connect to the server. Please check your connection.');
        setSubmitting(false);
        return;
      }

      if (submitRes.ok) {
        localStorage.removeItem(DRAFT_KEY(job.id));
        setStep('success');
      } else {
        // Payments disabled — 402 should never appear, but handle defensively
        setFormError(_safeError(submitRes.status, submitData));
      }

    } catch {
      // Catch-all for any unexpected JS error — never surface it to the user
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(12,10,9,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 28 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '22px',
          width: '100%', maxWidth: '540px',
          maxHeight: '92vh', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        {step !== 'success' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px', borderBottom: '1px solid #f5f5f4',
            background: 'linear-gradient(to bottom, #fffbeb, #fff)', flexShrink: 0,
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '900', color: '#1c1917', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                Apply for this Role
              </p>
              <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>
                {job.title} · {job.company_name || 'VallerieVA Network'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#f5f5f4', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: '#78716c',
              }}
              aria-label="Close"
            >✕</button>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: step === 'success' ? '28px' : '20px 22px' }}>
          <AnimatePresence mode="wait">

            {/* Form step */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
              >
                <p style={{ fontSize: '10px', fontWeight: '800', color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Your details
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <Field id="full_name"        label="Full name"         value={form.full_name}        onChange={set('full_name')}        error={errors.full_name}        disabled={submitting} required />
                  <Field id="email"            label="Email address"     type="email" value={form.email} onChange={set('email')}          error={errors.email}            disabled={submitting} required />
                  <Field id="phone"            label="Phone number"      type="tel"   value={form.phone} onChange={set('phone')}          error={errors.phone}            disabled={submitting} required />
                  <Field id="current_location" label="Current location"  value={form.current_location} onChange={set('current_location')} error={errors.current_location} disabled={submitting} required placeholder="e.g. Nairobi, Kenya" />
                </div>

                <div style={{ height: '1px', background: '#f5f5f4', margin: '0 -22px 20px' }} />

                <p style={{ fontSize: '10px', fontWeight: '800', color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Your application
                </p>

                <div style={{ marginBottom: '8px' }}>
                  <Field
                    id="cover_note"
                    label="Why are you a good fit?"
                    type="textarea"
                    value={form.cover_note}
                    onChange={set('cover_note')}
                    error={errors.cover_note}
                    disabled={submitting}
                    required
                    hint={`${wordCount}/50 words`}
                    placeholder="Briefly describe your relevant experience and strengths…"
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    CV / Resume <span style={{ color: '#d97706' }}>*</span>
                  </p>
                  <CVUploader
                    applicationId={application?.id}
                    onUploaded={(data) => {
                      if (data.pendingFile) setPendingCvFile(data.pendingFile);
                      else setCvData(data);
                    }}
                    disabled={submitting}
                  />
                  {errors.cv && (
                    <p style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: '500' }}>{errors.cv}</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <Field id="linkedin_url"  label="LinkedIn URL (optional)"  type="url" value={form.linkedin_url}  onChange={set('linkedin_url')}  error={errors.linkedin_url}  disabled={submitting} />
                  <Field id="portfolio_url" label="Portfolio URL (optional)"  type="url" value={form.portfolio_url} onChange={set('portfolio_url')} error={errors.portfolio_url} disabled={submitting} />
                </div>

                <ErrorBanner message={formError} />

                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.015 } : {}}
                  whileTap={!submitting ? { scale: 0.975 } : {}}
                  style={{
                    width: '100%', height: '52px',
                    background: submitting
                      ? '#fde68a'
                      : 'linear-gradient(135deg, #d97706, #b45309)',
                    color: submitting ? '#92400e' : '#fff',
                    fontWeight: '800', fontSize: '13px',
                    borderRadius: '12px', border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    boxShadow: submitting ? 'none' : '0 4px 16px rgba(217,119,6,0.3)',
                    fontFamily: 'inherit',
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={{
                        width: '14px', height: '14px',
                        border: '2px solid #92400e', borderTopColor: 'transparent',
                        borderRadius: '50%', display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Submitting…
                    </>
                  ) : 'Submit Application →'}
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: '10px', color: '#d6d3d1', marginTop: '10px' }}>
                  🔒 Your information is secure and used only for this application
                </p>
              </motion.div>
            )}

            {/* Success step */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SuccessScreen jobTitle={job.title} onClose={onClose} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </motion.div>
  );
}

ApplicationFlow.propTypes = {
  job:     PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};