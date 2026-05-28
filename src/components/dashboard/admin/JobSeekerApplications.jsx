import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';
import AdminDetailModal, { ViewDetailsButton } from './AdminDetailModal';

// ── Field mapper — maps jobs.JobApplication fields ────────────────────────────
const mapApplicant = (a) => ({
  id:          a.id,
  name:        a.full_name        || '—',
  email:       a.email            || '—',
  phone:       a.phone            || '',
  role:        a.job_title        || '—',
  company:     a.company_name     || '—',
  jobSlug:     a.job_slug         || '',
  location:    a.current_location || '',
  coverNote:   a.cover_note       || '',
  linkedin:    a.linkedin_url     || '',
  portfolio:   a.portfolio_url    || '',
  isStudent:   a.is_student       || false,
  submittedAt: a.submitted_at,
  status:      a.status           || 'submitted',
  avatar:      a.full_name?.slice(0, 2).toUpperCase() ?? '??',
  avatarColor: a.is_student ? '#8B5CF6' : '#d97706',
  // Keep these so AdminDetailModal ApplicantContent doesn't break
  experience:  '',
  skills:      [],
  education:   '',
  summary:     a.cover_note || '',
  cvUrl:       '#',
});

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  submitted: { label: 'Submitted', bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)' },
  forwarded: { label: 'Forwarded', bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function ApplicantCard({ applicant, onView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onView(applicant)}
      style={{
        background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '12px', padding: '14px 16px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: applicant.avatarColor, borderRadius: '12px 0 0 12px',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
            background: `${applicant.avatarColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: applicant.avatarColor,
          }}>
            {applicant.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {applicant.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b6b6b', marginTop: '1px' }}>
              {applicant.role} @ {applicant.company}
            </div>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
        {applicant.isStudent && (
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}>
            Student
          </span>
        )}
        <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '5px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>
          {applicant.location}
        </span>
      </div>
      <ViewDetailsButton onClick={() => onView(applicant)} />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JobSeekerApplications() {
  const [applicants,    setApplicants]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filter,        setFilter]        = useState('all');
  const [search,        setSearch]        = useState('');
  // viewApplicant — the applicant open in the detail/forward modal
  // forwardMode   — when true the modal opens directly on the ForwardForm panel
  const [viewApplicant, setViewApplicant] = useState(null);
  const [forwardMode,   setForwardMode]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(endpoints.dashboard.jobApplications);
        setApplicants((res.data?.results ?? res.data ?? []).map(mapApplicant));
      } catch {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Open detail modal on the normal details view
  const openDetails = (applicant) => {
    setViewApplicant(applicant);
    setForwardMode(false);
  };

  // Open detail modal jumping straight to the ForwardForm panel
  const openForward = (applicant) => {
    setViewApplicant(applicant);
    setForwardMode(true);
  };

  const closeModal = () => {
    setViewApplicant(null);
    setForwardMode(false);
  };

  // AdminDetailModal "Forward to Company →" button triggers this (kept for compatibility)
  const handleAction = (action, applicant) => {
    if (action === 'forward') openForward(applicant);
  };

  const handleForwarded = (id) => {
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, status: 'forwarded' } : a));
    setViewApplicant((prev) => prev?.id === id ? { ...prev, status: 'forwarded' } : prev);
  };

  const filtered = applicants.filter((a) => {
    const matchStatus = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    return matchStatus && (
      !q ||
      a.name.toLowerCase().includes(q)    ||
      a.role.toLowerCase().includes(q)    ||
      a.company.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });

  const counts = {
    all:       applicants.length,
    submitted: applicants.filter((a) => a.status === 'submitted').length,
    forwarded: applicants.filter((a) => a.status === 'forwarded').length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .js-filter-btn{border:none;cursor:pointer;font-family:'Geist',sans-serif;transition:all 0.15s}
        .js-row{transition:background 0.12s;cursor:pointer}.js-row:hover{background:rgba(139,92,246,0.03)!important}
        .js-table-wrap{display:block}.js-cards-wrap{display:none}
        @media(max-width:640px){
          .js-table-wrap{display:none!important}
          .js-cards-wrap{display:flex!important;flex-direction:column;gap:10px;padding:12px}
          .js-stats-grid{grid-template-columns:repeat(3,1fr)!important}
          .js-toolbar{flex-direction:column!important;align-items:stretch!important;gap:8px!important}
          .js-filter-scroll{overflow-x:auto}
          .js-search-box{max-width:100%!important}
          .js-search-box input{width:100%!important}
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Geist', sans-serif" }}>

        {/* Stats */}
        <div className="js-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[
            { label: 'Total',     value: counts.all,       color: '#6b6b6b' },
            { label: 'New',       value: counts.submitted,  color: '#8B5CF6' },
            { label: 'Forwarded', value: counts.forwarded,  color: '#10B981' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '4px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}
        >
          {/* Toolbar */}
          <div className="js-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div className="js-filter-scroll">
              <div style={{ display: 'flex', gap: '3px', background: '#F7F4F0', padding: '3px', borderRadius: '9px', width: 'fit-content' }}>
                {['all', 'submitted', 'forwarded'].map((f) => (
                  <button
                    key={f}
                    className="js-filter-btn"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                      background: filter === f ? '#fff' : 'transparent',
                      color: filter === f ? '#1a1a1a' : '#6b6b6b',
                      boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      textTransform: 'capitalize', whiteSpace: 'nowrap',
                    }}
                  >
                    {f}{!loading && counts[f] !== undefined ? ` (${counts[f]})` : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="js-search-box" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F7F4F0', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '8px 12px', flex: 1, maxWidth: '280px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, role, company…"
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1a1a1a', fontFamily: 'inherit', width: '100%', minWidth: 0 }}
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#9b9b9b', fontSize: '13px', gap: '8px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ width: '16px', height: '16px', border: '2px solid #8B5CF6', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
              Loading applications…
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#EF4444' }}>{error}</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="js-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAF8', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      {['Applicant', 'Applied For', 'Company', 'Location', 'Submitted', 'Status', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>
                          No applications match.
                        </td>
                      </tr>
                    ) : filtered.map((a, idx) => (
                      <tr
                        key={a.id}
                        className="js-row"
                        onClick={() => openDetails(a)}
                        style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: 'transparent' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                              background: `${a.avatarColor}15`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: 700, color: a.avatarColor,
                            }}>
                              {a.avatar}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {a.name}
                                {a.isStudent && (
                                  <span style={{ fontSize: '8px', fontWeight: 700, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: '99px' }}>
                                    Student
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#9b9b9b' }}>{a.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{a.role}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b6b6b' }}>{a.company}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b6b6b' }}>{a.location}</td>
                        <td style={{ padding: '12px 16px', fontSize: '11px', color: '#9b9b9b', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                        <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <ViewDetailsButton onClick={() => openDetails(a)} />
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openForward(a)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '5px 10px', borderRadius: '6px', border: 'none',
                                background: 'rgba(184,101,47,0.1)', color: '#B8652F',
                                fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'inherit', whiteSpace: 'nowrap',
                              }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                              </svg>
                              Forward
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="js-cards-wrap">
                {filtered.length === 0
                  ? <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No applications match.</div>
                  : filtered.map((a) => <ApplicantCard key={a.id} applicant={a} onView={openDetails} />)
                }
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Detail / Forward modal — slides in from the right */}
      <AnimatePresence>
        {viewApplicant && (
          <AdminDetailModal
            type="applicant"
            data={viewApplicant}
            onClose={closeModal}
            onAction={handleAction}
            onForwarded={handleForwarded}
            initialShowForward={forwardMode}
          />
        )}
      </AnimatePresence>
    </>
  );
}