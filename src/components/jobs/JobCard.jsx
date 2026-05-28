// JobCard.jsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const WORK_TYPE_STYLES = {
  remote: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '🌍 Remote' },
  hybrid: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: '🏢 Hybrid' },
  onsite: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: '📍 On-site' },
};

const EMPLOYMENT_STYLES = {
  full_time: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Full-time'  },
  part_time: { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', label: 'Part-time'  },
  contract:  { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'Contract'   },
  freelance: { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', label: 'Freelance'  },
  intern:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Internship' },
};

function Badge({ style, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: '999px',
      fontSize: '10px', fontWeight: '700',
      background: style.bg, color: style.color,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job, onView, onApply }) {
  const [hovered, setHovered] = useState(false);

  const isExternal = job.source === 'external';
  const workStyle  = WORK_TYPE_STYLES[job.work_type]        || WORK_TYPE_STYLES.remote;
  const empStyle   = EMPLOYMENT_STYLES[job.employment_type] || EMPLOYMENT_STYLES.full_time;

  function handleApply(e) {
    e.stopPropagation();
    if (isExternal && job.apply_url) {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    } else {
      onApply();
    }
  }

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.985 }}
      onClick={onView}
      style={{
        borderRadius: '18px',
        // ✅ Subtle left border colour difference: teal for external, amber for native
        borderLeft: isExternal ? '3px solid #0d9488' : '3px solid #d97706',
        border: `1.5px solid ${hovered ? '#e7e5e4' : '#f5f5f4'}`,
        borderLeft: isExternal ? '3px solid #0d9488' : '3px solid #d97706',
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Accent bar — teal for external, amber for native */}
      <div style={{
        height: '3px',
        background: hovered
          ? isExternal
            ? 'linear-gradient(to right, #0f766e, #0d9488, #14b8a6)'
            : 'linear-gradient(to right, #b45309, #d97706, #f59e0b)'
          : 'linear-gradient(to right, #f5f5f4, #e7e5e4)',
        transition: 'background 0.3s',
      }} />

      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top row: logo + source dot indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {job.company_logo_url ? (
              <img
                src={job.company_logo_url}
                alt={job.company_name}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  objectFit: 'contain', border: '1px solid #f5f5f4',
                }}
              />
            ) : (
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: isExternal ? '#f0fdfa' : '#fef3c7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>
                {isExternal ? '🌐' : '◈'}
              </div>
            )}
            <p style={{ fontSize: '10px', color: '#a8a29e', margin: 0 }}>
              {job.company_name || 'VallerieVA Network'}
            </p>
          </div>

          {/* ✅ Small source pill — only visual differentiator */}
          <span style={{
            fontSize: '9px', fontWeight: '700',
            color: isExternal ? '#0f766e' : '#92400e',
            background: isExternal ? '#f0fdfa' : '#fef3c7',
            padding: '2px 7px', borderRadius: '999px',
            border: `1px solid ${isExternal ? '#99f6e4' : '#fde68a'}`,
            whiteSpace: 'nowrap',
          }}>
            {isExternal ? '🌐 External' : '🏢 Employer Post'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '14px', fontWeight: '800', color: '#1c1917',
          marginBottom: '6px', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {job.title}
        </h3>

        {/* Short description */}
        <p style={{
          fontSize: '11px', color: '#78716c', lineHeight: 1.5,
          marginBottom: '12px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {job.short_description}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Badge style={workStyle}>{workStyle.label}</Badge>
          <Badge style={empStyle}>{empStyle.label}</Badge>
          {job.location && (
            <span style={{
              fontSize: '10px', color: '#a8a29e',
              display: 'flex', alignItems: 'center', gap: '2px',
            }}>
              📍 {job.location}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {job.skills.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                fontSize: '10px', color: '#78716c',
                background: '#fafaf9', border: '1px solid #e7e5e4',
                padding: '2px 8px', borderRadius: '6px',
              }}>
                {s}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span style={{ fontSize: '10px', color: '#a8a29e' }}>
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <div style={{ height: '1px', background: '#f5f5f4', marginBottom: '12px' }} />

        {/* Bottom row: salary + apply button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {job.salary_display ? (
              <>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#1c1917', margin: 0 }}>
                  {job.salary_display}
                </p>
                <p style={{ fontSize: '10px', color: '#a8a29e', margin: 0 }}>
                  {timeAgo(job.created_at)}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>
                {timeAgo(job.created_at)}
              </p>
            )}
          </div>

          {/* ✅ Same label for all — colour matches source */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleApply}
            style={{
              padding: '7px 16px',
              background: isExternal
                ? 'linear-gradient(135deg, #0f766e, #0d9488)'
                : 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', fontSize: '11px', fontWeight: '800',
              borderRadius: '999px', border: 'none', cursor: 'pointer',
              boxShadow: isExternal
                ? '0 2px 10px rgba(13,148,136,0.3)'
                : '0 2px 10px rgba(217,119,6,0.3)',
              fontFamily: 'inherit',
            }}
          >
            Apply →
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}

JobCard.propTypes = {
  job:     PropTypes.object.isRequired,
  onView:  PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

export default JobCard;