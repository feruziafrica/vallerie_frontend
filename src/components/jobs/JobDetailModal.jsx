/**
 * JobDetailModal.jsx  [PAYMENTS DISABLED]
 * =========================================
 * Job detail modal — supports both native and external jobs.
 *
 * Native jobs  → "Apply for this Role →" button calls onApply()
 * External jobs → "Apply on [Platform] →" anchor tag opens external_url in new tab
 *
 * Fee note removed — all applications are currently free.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const spring = { type: 'spring', stiffness: 300, damping: 28 };

const WORK_TYPE_LABELS = {
  remote: '🌍 Remote',
  hybrid: '🏢 Hybrid',
  onsite: '📍 On-site',
};

const EMP_TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract:  'Contract',
  freelance: 'Freelance',
};

const PLATFORM_LABELS = {
  linkedin:       'LinkedIn',
  indeed:         'Indeed',
  glassdoor:      'Glassdoor',
  brightermonday: 'BrighterMonday',
  fuzu:           'Fuzu',
  jobwebkenya:    'JobWebKenya',
  himalayas:      'Himalayas',
  other:          'the company site',
};

// ── Section renderer ──────────────────────────────────────────────────────────
function Section({ title, content }) {
  if (!content?.trim()) return null;
  const lines = content.split('\n').filter(Boolean);
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontSize: '10px', fontWeight: '800', color: '#78716c',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#d97706', fontSize: '10px', marginTop: '3px', flexShrink: 0 }}>✦</span>
            <span style={{ fontSize: '13px', color: '#44403c', lineHeight: 1.55 }}>
              {line.replace(/^[-•*]\s*/, '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Description renderer ──────────────────────────────────────────────────────
function Description({ content }) {
  if (!content?.trim()) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontSize: '10px', fontWeight: '800', color: '#78716c',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px',
      }}>
        About the Role
      </p>
      {isHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ fontSize: '13px', color: '#44403c', lineHeight: 1.65 }}
        />
      ) : (
        <p style={{ fontSize: '13px', color: '#44403c', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
          {content}
        </p>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function JobDetailModal({ job, onClose, onApply }) {
  const isExternal    = job.source === 'external';
  const platformLabel = PLATFORM_LABELS[job.external_platform] || 'the company site';
  const externalUrl   = job.apply_url || job.external_url;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
          width: '100%', maxWidth: '760px',
          maxHeight: '90vh', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column',
        }}
      >

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '22px 24px 18px',
          borderBottom: '1px solid #f5f5f4',
          background: 'linear-gradient(to bottom, #fffbeb, #fff)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
            {/* Company logo */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: job.company_logo_url ? '#fff' : '#fef3c7',
              border: '1.5px solid #f5f5f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {job.company_logo_url
                ? <img src={job.company_logo_url} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '18px' }}>◈</span>
              }
            </div>

            {/* Title + meta */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                <h2 style={{
                  fontSize: '18px', fontWeight: '900', color: '#1c1917',
                  margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2,
                }}>
                  {job.title}
                </h2>
                {isExternal && (
                  <span style={{
                    fontSize: '9px', fontWeight: '800',
                    color: '#1d4ed8', background: '#eff6ff',
                    padding: '2px 8px', borderRadius: '999px',
                    border: '1px solid #bfdbfe',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}>
                    via {platformLabel}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>
                {job.company_name || 'VallerieVA Network'}
                {job.location ? ` · ${job.location}` : ''}
                {job.company_website && (
                  <>
                    {' · '}
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#d97706', textDecoration: 'none', fontWeight: '600' }}
                    >
                      Company site ↗
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0, marginLeft: '12px',
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#f5f5f4', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', color: '#78716c',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body — scrollable ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Meta badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { label: WORK_TYPE_LABELS[job.work_type] || job.work_type, bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
              { label: EMP_TYPE_LABELS[job.employment_type] || job.employment_type, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
              job.salary_display && { label: job.salary_display, bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
              job.deadline && {
                label: `Closes ${new Date(job.deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`,
                bg: '#fef2f2', color: '#991b1b', border: '#fecaca',
              },
            ].filter(Boolean).map((badge, i) => (
              <span key={i} style={{
                padding: '5px 12px', borderRadius: '999px',
                fontSize: '11px', fontWeight: '700',
                background: badge.bg, color: badge.color,
                border: `1px solid ${badge.border}`,
              }}>
                {badge.label}
              </span>
            ))}
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '10px', fontWeight: '800', color: '#78716c',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px',
              }}>
                Skills Required
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {job.skills.map((s, i) => (
                  <span key={i} style={{
                    fontSize: '12px', fontWeight: '600', color: '#44403c',
                    background: '#fafaf9', border: '1.5px solid #e7e5e4',
                    padding: '4px 12px', borderRadius: '8px',
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Description content={job.description} />
          <Section title="Responsibilities" content={job.responsibilities} />
          <Section title="Requirements"     content={job.requirements} />
          <Section title="Benefits"         content={job.benefits} />

          {/* External job notice */}
          {isExternal && (
            <div style={{
              background: '#f0f9ff', borderRadius: '14px', padding: '14px 18px',
              border: '1px solid #bae6fd', marginTop: '8px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1', margin: '0 0 4px' }}>
                🔗 This job is listed externally
              </p>
              <p style={{ fontSize: '11px', color: '#0c4a6e', margin: 0 }}>
                Clicking Apply will open the application on {platformLabel}. You will leave the VallerieVA site.
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky apply CTA ── */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #f5f5f4',
          background: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px',
        }}>
          <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0, flex: 1 }}>
            {isExternal
              ? `You'll be redirected to ${platformLabel} to complete your application.`
              : '🔒 Your information is secure and used only for this application.'
            }
          </p>

          {isExternal ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#fff', fontWeight: '800', fontSize: '13px',
                borderRadius: '12px',
                boxShadow: '0 6px 20px rgba(217,119,6,0.35)',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Apply on {platformLabel} ↗
            </a>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onApply}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#fff', fontWeight: '800', fontSize: '13px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(217,119,6,0.35)',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              Apply for this Role →
            </motion.button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}

JobDetailModal.propTypes = {
  job:     PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};