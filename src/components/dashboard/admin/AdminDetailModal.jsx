/**
 * AdminDetailModal.jsx
 * Shared detail modal for all admin dashboard components.
 * Slides in from RIGHT. Applicant view includes inline forward form.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';

// ── Colour generator ──────────────────────────────────────────────────────────
const _colour = (name = '') => {
  const PALETTE = ['#B8652F','#10B981','#6366F1','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const _initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '??';

// ── Sub-components ────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 700, color: '#6B7280',
      textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px',
    }}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, compact = false }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      padding: compact ? '8px 0' : '10px 0',
      borderBottom: '1px solid #F3F4F6',
    }}>
      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1F2937', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Tag({ children, color = '#6366F1' }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: 500, padding: '4px 8px',
      borderRadius: '4px', background: `${color}10`, color,
      border: `1px solid ${color}20`,
    }}>
      {children}
    </span>
  );
}

function ActionBtn({ children, onClick, disabled, variant = 'primary', fullWidth = false }) {
  const styles = {
    primary:   { background: '#10B981', color: '#fff', border: 'none' },
    amber:     { background: 'linear-gradient(135deg,#B8652F,#7A3B10)', color: '#fff', border: 'none' },
    danger:    { background: '#EF4444', color: '#fff', border: 'none' },
    neutral:   { background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' },
    secondary: { background: '#E5E7EB', color: '#1F2937', border: 'none' },
  };
  const s = styles[variant];
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: fullWidth ? 'unset' : 1,
        width: fullWidth ? '100%' : undefined,
        padding: '10px 12px',
        background: s.background, color: s.color,
        border: s.border, borderRadius: '6px',
        fontSize: '12px', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: disabled ? 0.6 : 1,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </motion.button>
  );
}

// ── Inline Forward Form ───────────────────────────────────────────────────────
function ForwardForm({ data, onBack, onForwarded }) {
  const [companyName,  setCompanyName]  = useState(data.company || '');
  const [companyEmail, setCompanyEmail] = useState('');
  const [note,         setNote]         = useState('');
  const [sent,         setSent]         = useState(null);
  const [saving,       setSaving]       = useState(false);

  const emailBody = encodeURIComponent(
    `Dear ${companyName || 'Hiring Team'},\n\n` +
    `We are forwarding a candidate who applied for the ${data.role} position.\n\n` +
    `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n` +
    `Location: ${data.location}\n` +
    (data.linkedin ? `LinkedIn: ${data.linkedin}\n` : '') +
    (data.portfolio ? `Portfolio: ${data.portfolio}\n` : '') +
    `\nCover Note:\n${data.coverNote || data.summary || ''}\n\n` +
    (note ? `Additional Note:\n${note}\n\n` : '') +
    `Best regards,\nFlowMate Academy`
  );
  const emailSubject = encodeURIComponent(
    `Job Application: ${data.name} — ${data.role} @ ${data.company}`
  );
  const waMessage = encodeURIComponent(
    `*Job Application — FlowMate Academy*\n\n` +
    `👤 *${data.name}*\n📌 Applied for: *${data.role}* @ ${data.company}\n` +
    `📍 ${data.location}\n📧 ${data.email}\n📞 ${data.phone}\n` +
    (data.linkedin ? `🔗 ${data.linkedin}\n` : '') +
    `\n*Cover Note:*\n${data.coverNote || data.summary || ''}` +
    (note ? `\n\n*Note:* ${note}` : '')
  );
  const smsMessage = encodeURIComponent(
    `FlowMate Academy: ${data.name} applied for ${data.role} @ ${data.company}. ` +
    `Email: ${data.email}, Phone: ${data.phone}.`
  );

  const recordForward = async (channel) => {
    setSaving(true);
    try {
      await api.post(endpoints.dashboard.jobForward(data.id), {
        channel,
        company_name:  companyName,
        company_email: companyEmail || undefined,
        note:          note || undefined,
      });
    } catch { /* still mark locally */ }
    finally { setSaving(false); }
    onForwarded(data.id);
  };

  const handleWhatsApp = async () => {
    window.open(`https://wa.me/?text=${waMessage}`, '_blank');
    setSent('whatsapp');
    await recordForward('whatsapp');
  };
  const handleEmail = async () => {
    if (!companyEmail) return;
    window.open(`mailto:${companyEmail}?subject=${emailSubject}&body=${emailBody}`);
    setSent('email');
    await recordForward('email');
  };
  const handleSMS = () => {
    window.open(`sms:${companyEmail}?body=${smsMessage}`);
    setSent('sms');
    recordForward('sms');
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '11px', fontWeight: 600, color: '#6B7280',
          padding: '0 0 14px 0', fontFamily: 'inherit',
        }}
      >
        ← Back to details
      </button>

      {/* Applicant mini-card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '8px', background: '#F9FAFB',
        border: '1px solid #F3F4F6', marginBottom: '16px',
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
          background: `${data.avatarColor || '#d97706'}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: data.avatarColor || '#d97706',
        }}>
          {data.avatar || _initials(data.name || '')}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>{data.name}</div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{data.role} @ {data.company}</div>
        </div>
      </div>

      {/* Cover note preview */}
      {(data.coverNote || data.summary) && (
        <div style={{
          background: '#F9FAFB', border: '1px solid #E5E7EB',
          borderRadius: '8px', padding: '10px 12px', marginBottom: '14px',
        }}>
          <Label>Cover Note</Label>
          <p style={{
            margin: 0, fontSize: '12px', color: '#374151', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {data.coverNote || data.summary}
          </p>
        </div>
      )}

      {/* Form fields */}
      {[
        { label: 'Company Name',          value: companyName,  setter: setCompanyName,  placeholder: 'e.g. TechCorp Kenya',      required: false },
        { label: 'Company Email / Phone', value: companyEmail, setter: setCompanyEmail, placeholder: 'hr@company.co.ke or +254…', required: true  },
      ].map((f) => (
        <div key={f.label} style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '11px', fontWeight: 600, color: '#6B7280',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            display: 'block', marginBottom: '5px',
          }}>
            {f.label} {f.required && <span style={{ color: '#EF4444' }}>*</span>}
          </label>
          <input
            value={f.value}
            onChange={(e) => f.setter(e.target.value)}
            placeholder={f.placeholder}
            style={{
              width: '100%', padding: '9px 11px', borderRadius: '6px',
              border: '1px solid #E5E7EB', outline: 'none',
              fontSize: '13px', color: '#1F2937', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          fontSize: '11px', fontWeight: 600, color: '#6B7280',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          display: 'block', marginBottom: '5px',
        }}>
          Additional Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add context for the recipient…"
          rows={3}
          style={{
            width: '100%', padding: '9px 11px', borderRadius: '6px',
            border: '1px solid #E5E7EB', outline: 'none',
            fontSize: '13px', color: '#1F2937', fontFamily: 'inherit',
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Actions */}
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '12px', borderRadius: '8px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', color: '#059669', fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Forwarded via {sent === 'email' ? 'Email' : sent === 'whatsapp' ? 'WhatsApp' : 'SMS'}!
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* WhatsApp */}
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={handleWhatsApp} disabled={saving}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#25D366,#128C7E)',
              color: 'white', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.548 4.09 1.508 5.814L.057 23.928l6.305-1.428A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.004-1.37l-.36-.213-3.73.845.863-3.641-.234-.374A9.771 9.771 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Send via WhatsApp
          </motion.button>

          {/* Email */}
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={handleEmail}
            disabled={!companyEmail || saving}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              background: companyEmail ? 'linear-gradient(135deg,#B8652F,#7A3B10)' : 'rgba(0,0,0,0.08)',
              color: companyEmail ? 'white' : '#9b9b9b',
              fontSize: '12px', fontWeight: 600,
              cursor: companyEmail ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Send via Email
          </motion.button>

          {/* SMS */}
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={handleSMS}
            disabled={!companyEmail || saving}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid #E5E7EB', background: 'transparent',
              color: companyEmail ? '#374151' : '#9b9b9b',
              fontSize: '12px', fontWeight: 600,
              cursor: companyEmail ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Send via SMS
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ── Content renderers ─────────────────────────────────────────────────────────

function JobContent({ data, onAction, actionLoading }) {
  const isPending  = data.status_label === 'pending' || data.status === 'draft';
  const canArchive = ['approved', 'rejected', 'active', 'paused'].includes(data.status);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {[
          data.employment_type_label || data.job_type_label || data.employment_type || data.job_type,
          data.work_type, data.location, data.salary_display || data.salary,
        ].filter(Boolean).slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <InfoRow label="Status"      value={data.status_label || data.status} compact />
        <InfoRow label="Posted by"   value={data.posted_by_email || data.company_email} compact />
        <InfoRow label="Submitted"   value={data.submitted_at ? new Date(data.submitted_at).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null} compact />
        <InfoRow label="Reviewed by" value={data.reviewed_by_email} compact />
        <InfoRow label="Deadline"    value={data.deadline ? new Date(data.deadline).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null} compact />
      </div>
      {(data.short_description || data.description) && (
        <div style={{ marginBottom: '12px' }}>
          <Label>Description</Label>
          <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.short_description || data.description}
          </p>
        </div>
      )}
      {data.requirements && (
        <div style={{ marginBottom: '12px' }}>
          <Label>Requirements</Label>
          <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-line' }}>
            {data.requirements}
          </p>
        </div>
      )}
      {data.rejection_note && (
        <div style={{ marginBottom: '12px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 10px' }}>
          <Label>Rejection Note</Label>
          <p style={{ margin: 0, fontSize: '11px', color: '#7F1D1D', lineHeight: 1.4 }}>{data.rejection_note}</p>
        </div>
      )}
      {(isPending || canArchive) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
          {isPending && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <ActionBtn variant="danger"  disabled={actionLoading} onClick={() => onAction('reject',  data)}>Reject</ActionBtn>
              <ActionBtn variant="primary" disabled={actionLoading} onClick={() => onAction('approve', data)}>
                {actionLoading ? 'Processing…' : 'Approve'}
              </ActionBtn>
            </div>
          )}
          {canArchive && (
            <ActionBtn variant="neutral" disabled={actionLoading} onClick={() => onAction('archive', data)}>Archive</ActionBtn>
          )}
        </div>
      )}
    </>
  );
}

// ── ApplicantContent — accepts initialShowForward to jump straight to the form
function ApplicantContent({ data, onAction, actionLoading, onForwarded, initialShowForward = false }) {
  const [showForward, setShowForward] = useState(initialShowForward);

  if (showForward) {
    return (
      <ForwardForm
        data={data}
        onBack={() => setShowForward(false)}
        onForwarded={(id) => {
          onForwarded(id);
          setShowForward(false);
        }}
      />
    );
  }

  const colour = data.avatarColor || _colour(data.name || data.full_name || '');
  const skills = Array.isArray(data.skills)
    ? data.skills.slice(0, 5)
    : (data.skills || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <InfoRow label="Email"    value={data.email}    compact />
        <InfoRow label="Phone"    value={data.phone}    compact />
        <InfoRow label="Location" value={data.location} compact />
        <InfoRow label="Company"  value={data.company}  compact />
        <InfoRow label="Applied for" value={data.role}  compact />
        <InfoRow label="Submitted" value={
          (data.submittedAt || data.submitted_at)
            ? new Date(data.submittedAt || data.submitted_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })
            : null
        } compact />
        {data.isStudent && (
          <InfoRow label="Student" value="Yes — enrolled at FlowMate Academy" compact />
        )}
      </div>

      {(data.coverNote || data.summary) && (
        <div style={{ marginBottom: '12px' }}>
          <Label>Cover Note</Label>
          <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.coverNote || data.summary}
          </p>
        </div>
      )}

      {data.linkedin && (
        <div style={{ marginBottom: '12px' }}>
          <a href={data.linkedin} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
            🔗 LinkedIn Profile ↗
          </a>
        </div>
      )}

      {data.portfolio && (
        <div style={{ marginBottom: '12px' }}>
          <a href={data.portfolio} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>
            🌐 Portfolio ↗
          </a>
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Label>Skills</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {skills.map((s) => (
              <span key={s} style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '4px', background: `${colour}10`, color: colour, border: `1px solid ${colour}20` }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Forward button */}
      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
        <ActionBtn variant="amber" fullWidth onClick={() => setShowForward(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Forward to Company →
        </ActionBtn>
      </div>
    </>
  );
}

function StudentContent({ data, onAction, actionLoading }) {
  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <InfoRow label="Course"   value={data.enrolled_course ?? '—'} compact />
        <InfoRow label="Progress" value={data.completion_pct != null ? `${data.completion_pct}%` : '—'} compact />
        <InfoRow label="Status"   value={data.is_approved ? 'Active' : 'Pending Approval'} compact />
        <InfoRow label="Joined"   value={data.date_joined ? new Date(data.date_joined).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'} compact />
        <InfoRow label="Phone"    value={data.phone ?? '—'} compact />
      </div>
      {data.completion_pct != null && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <Label>Course Progress</Label>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>{data.completion_pct}%</span>
          </div>
          <div style={{ width: '100%', height: '5px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.completion_pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', background: data.completion_pct === 100 ? '#10B981' : '#F59E0B', borderRadius: '99px' }}
            />
          </div>
        </div>
      )}
      {!data.is_approved && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
          <ActionBtn variant="primary" disabled={actionLoading} onClick={() => onAction('approve', data)} fullWidth>
            {actionLoading ? 'Approving…' : 'Approve Student'}
          </ActionBtn>
        </div>
      )}
    </>
  );
}

// ── Content map ───────────────────────────────────────────────────────────────
const CONTENT_MAP = {
  job:       { render: JobContent,       title: (d) => d.title || d.role || 'Job Posting', subtitle: (d) => d.company_name || '' },
  applicant: { render: ApplicantContent, title: (d) => d.name  || d.full_name || 'Applicant', subtitle: (d) => d.role || d.role_seeking || '' },
  student:   { render: StudentContent,   title: (d) => d.full_name || 'Student', subtitle: (d) => d.email || '' },
};

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AdminDetailModal({
  type, data, onClose, onAction, onForwarded, actionLoading = false,
  // When true the applicant modal opens directly on the ForwardForm panel
  initialShowForward = false,
}) {
  const cfg = CONTENT_MAP[type];

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!data || !cfg) return null;

  const ContentComponent = cfg.render;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          paddingRight: '20px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff', borderRadius: '12px',
            width: '100%', maxWidth: '520px', maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            fontFamily: "'Geist', 'Inter', sans-serif",
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '12px',
            padding: '16px 20px', borderBottom: '1px solid #F3F4F6', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>{cfg.title(data)}</div>
              {cfg.subtitle(data) && (
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{cfg.subtitle(data)}</div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                flexShrink: 0, width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid #E5E7EB', background: '#F9FAFB',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#6B7280',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <ContentComponent
              data={data}
              onAction={onAction}
              actionLoading={actionLoading}
              onForwarded={onForwarded || (() => {})}
              initialShowForward={initialShowForward}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

AdminDetailModal.propTypes = {
  type:               PropTypes.oneOf(['job', 'applicant', 'student']).isRequired,
  data:               PropTypes.object.isRequired,
  onClose:            PropTypes.func.isRequired,
  onAction:           PropTypes.func.isRequired,
  onForwarded:        PropTypes.func,
  actionLoading:      PropTypes.bool,
  initialShowForward: PropTypes.bool,
};

// ── View Details Button ───────────────────────────────────────────────────────
export function ViewDetailsButton({ onClick, label = 'View Details' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '6px',
        border: '1px solid #D1D5DB', background: '#F9FAFB',
        color: '#374151', fontSize: '11px', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      {label}
    </motion.button>
  );
}

ViewDetailsButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label:   PropTypes.string,
};