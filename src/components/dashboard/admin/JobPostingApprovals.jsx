import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';
import AdminDetailModal, { ViewDetailsButton } from './AdminDetailModal';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  approved: { label: 'Approved', bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
  archived: { label: 'Archived', bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.25)' },
};

const SOURCE_CONFIG = {
  native:   { label: 'Native',   color: '#B8652F', bg: 'rgba(184,101,47,0.08)' },
  external: { label: 'External', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.native;
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
      {source === 'external' ? '🌐' : '🏢'} {cfg.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const colors = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10B981' },
    error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
  };
  const c = colors[type] || colors.error;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#fff', border: `1px solid ${c.border}`, borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 500, color: c.color, fontFamily: "'Geist', sans-serif", minWidth: '240px', whiteSpace: 'nowrap' }}
    >
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {message}
    </motion.div>
  );
}

// ─── Rejection Modal ──────────────────────────────────────────────────────────
function RejectionModal({ job, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', fontFamily: "'Geist', sans-serif" }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Reject Posting</h3>
        <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6b6b6b' }}>
          Provide a reason for rejecting <strong>{job.role}</strong> at <strong>{job.company_name}</strong>.
        </p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Incomplete requirements, duplicate listing…" rows={3}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', color: '#1a1a1a', marginBottom: '14px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b' }}>Cancel</button>
          <motion.button whileTap={{ scale: 0.97 }} disabled={!note.trim() || loading} onClick={() => onConfirm(note)}
            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: !note.trim() ? '#f5f5f5' : 'rgba(239,68,68,0.9)', color: !note.trim() ? '#aaa' : '#fff', fontSize: '13px', fontWeight: 600, cursor: !note.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Archive Confirm Modal ────────────────────────────────────────────────────
function ArchiveModal({ job, onConfirm, onCancel, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', fontFamily: "'Geist', sans-serif" }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>Archive Posting?</h3>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b6b6b', lineHeight: 1.6 }}>
          <strong>"{job.role}"</strong> at <strong>{job.company_name}</strong> will be removed from the public board. The record is retained for audit purposes.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b' }}>Cancel</button>
          <motion.button whileTap={{ scale: 0.97 }} disabled={loading} onClick={onConfirm}
            style={{ flex: 2, padding: '9px', borderRadius: '8px', border: 'none', background: loading ? '#f5f5f5' : '#6B7280', color: loading ? '#aaa' : '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Archiving…' : 'Archive Posting'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function JobCard({ job, onSelect }) {
  const logoColor    = job.logo_color || '#6b6b6b';
  const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(job)}
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: logoColor, borderRadius: '12px 0 0 12px' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</div>
            <div style={{ fontSize: '12px', color: '#6b6b6b', marginTop: '1px' }}>{job.company_name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
          <StatusBadge status={job.status} />
          {job.source && <SourceBadge source={job.source} />}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
        {[job.job_type_label || job.job_type, job.location].filter(Boolean).map((tag) => (
          <span key={tag} style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '5px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{tag}</span>
        ))}
        <span style={{ fontSize: '10px', color: '#9b9b9b', padding: '3px 4px', fontFamily: 'monospace' }}>
          {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
        </span>
      </div>
      <ViewDetailsButton onClick={() => onSelect(job)} />
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      {[180, 120, 80, 140, 70, 60, 70, 110].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ width: w, height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JobPostingApprovals() {
  const [jobs,          setJobs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter,        setFilter]        = useState('all');
  const [selected,      setSelected]      = useState(null);
  const [search,        setSearch]        = useState('');
  const [toast,         setToast]         = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.dashboard.jobPostings);
      setJobs(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch {
      showToast('Failed to load job postings.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Fetch full detail when modal opens
  const handleSelect = async (job) => {
    setSelected(job);
    try {
      const res = await api.get(endpoints.dashboard.jobPosting(job.id));
      setSelected(res.data);
    } catch { /* keep list-level data */ }
  };

  // ── Single action handler for AdminDetailModal ────────────────────────────
  const handleAction = (action, job) => {
    if (action === 'reject')  { setSelected(null); setRejectTarget(job);  return; }
    if (action === 'archive') { setSelected(null); setArchiveTarget(job); return; }
    if (action === 'approve') handleApprove(job);
  };

  const handleApprove = async (job) => {
    setActionLoading(true);
    try {
      await api.post(endpoints.dashboard.jobReview(job.id), { action: 'approve' });
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'approved' } : j));
      setSelected(null);
      showToast(`"${job.role}" approved and published.`, 'success');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to approve posting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (note) => {
    const job = rejectTarget;
    setActionLoading(true);
    try {
      await api.post(endpoints.dashboard.jobReview(job.id), { action: 'reject', rejection_note: note });
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'rejected', rejection_note: note } : j));
      showToast(`"${job.role}" rejected.`, 'error');
      setRejectTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to reject posting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveConfirm = async () => {
    const job = archiveTarget;
    setActionLoading(true);
    try {
      await api.post(`${endpoints.dashboard.jobPosting(job.id)}archive/`);
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'archived' } : j));
      showToast(`"${job.role}" archived.`, 'success');
      setArchiveTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to archive posting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    all:      jobs.length,
    pending:  jobs.filter((j) => j.status === 'pending').length,
    approved: jobs.filter((j) => j.status === 'approved').length,
    rejected: jobs.filter((j) => j.status === 'rejected').length,
    archived: jobs.filter((j) => j.status === 'archived').length,
  };

  const filtered = jobs.filter((j) => {
    const matchStatus = filter === 'all' || j.status === filter;
    const matchSearch = !search ||
      (j.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.role || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .jp-filter-btn { border: none; cursor: pointer; font-family: 'Geist', sans-serif; transition: all 0.15s; }
        .jp-row        { transition: background 0.12s; cursor: pointer; }
        .jp-row:hover  { background: rgba(184,101,47,0.03) !important; }
        .jp-table-wrap { display: block; }
        .jp-cards-wrap { display: none; }
        @media (max-width: 640px) {
          .jp-table-wrap       { display: none !important; }
          .jp-cards-wrap       { display: flex !important; flex-direction: column; gap: 10px; padding: 12px; }
          .jp-stats-grid       { grid-template-columns: repeat(2, 1fr) !important; }
          .jp-toolbar          { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
          .jp-filter-scroll    { overflow-x: auto; padding-bottom: 2px; }
          .jp-search-box       { max-width: 100% !important; }
          .jp-search-box input { width: 100% !important; min-width: 0; }
        }
      `}</style>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Geist', sans-serif" }}>

        {/* Stats */}
        <div className="jp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {[
            { label: 'Total',    value: counts.all,      color: '#6b6b6b' },
            { label: 'Pending',  value: counts.pending,  color: '#F59E0B' },
            { label: 'Approved', value: counts.approved, color: '#10B981' },
            { label: 'Rejected', value: counts.rejected, color: '#EF4444' },
            { label: 'Archived', value: counts.archived, color: '#6B7280' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? <span style={{ display: 'inline-block', width: 32, height: 26, borderRadius: 6, background: '#f0f0f0' }} /> : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div className="jp-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div className="jp-filter-scroll">
              <div style={{ display: 'flex', gap: '3px', background: '#F7F4F0', padding: '3px', borderRadius: '9px', width: 'fit-content' }}>
                {['all', 'pending', 'approved', 'rejected', 'archived'].map((f) => (
                  <button key={f} className="jp-filter-btn" onClick={() => setFilter(f)}
                    style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: filter === f ? '#ffffff' : 'transparent', color: filter === f ? '#1a1a1a' : '#6b6b6b', boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {f}{counts[f] > 0 ? ` (${counts[f]})` : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="jp-search-box" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F7F4F0', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '8px 12px', flex: 1, maxWidth: '280px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role…"
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1a1a1a', fontFamily: 'inherit', width: '100%', minWidth: 0 }} />
            </div>
            <motion.button whileTap={{ scale: 0.94 }} onClick={fetchJobs} disabled={loading} title="Refresh"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </motion.button>
          </div>

          {/* Desktop table */}
          <div className="jp-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAF8', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  {['Company', 'Role', 'Type', 'Location', 'Source', 'Submitted', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</td></tr>
                ) : filtered.map((job, idx) => {
                  const logoColor    = job.logo_color || '#6b6b6b';
                  const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
                  return (
                    <tr key={job.id} className="jp-row" onClick={() => handleSelect(job)}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: 'transparent' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{job.company_name}</div>
                            <div style={{ fontSize: '11px', color: '#9b9b9b' }}>{job.company_email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{job.role}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{job.job_type_label || job.job_type}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b6b6b' }}>{job.location}</td>
                      <td style={{ padding: '12px 16px' }}>{job.source && <SourceBadge source={job.source} />}</td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
                        {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={job.status} /></td>
                      <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <ViewDetailsButton onClick={() => handleSelect(job)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="jp-cards-wrap">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', height: '96px', background: 'linear-gradient(90deg,#f7f7f7 25%,#f0f0f0 50%,#f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                ))
              : filtered.length === 0
                ? <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</div>
                : filtered.map((job) => <JobCard key={job.id} job={job} onSelect={handleSelect} />)
            }
          </div>
        </motion.div>
      </div>

      {/* ── AdminDetailModal replaces JobDetailModal ── */}
      <AnimatePresence>
        {selected && (
          <AdminDetailModal
            type="job"
            data={selected}
            onClose={() => setSelected(null)}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ── Keep these as-is ── */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectionModal
            job={rejectTarget}
            loading={actionLoading}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archiveTarget && (
          <ArchiveModal
            job={archiveTarget}
            loading={actionLoading}
            onConfirm={handleArchiveConfirm}
            onCancel={() => setArchiveTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}































// import { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { api } from '@/api/auth';
// import { endpoints } from '@/api/endpoints';

// /* ── Status config ── */
// const STATUS_CONFIG = {
//   pending:  { label: 'Pending',  bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
//   approved: { label: 'Approved', bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
//   rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
//   archived: { label: 'Archived', bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.25)' },
// };

// const SOURCE_CONFIG = {
//   native:   { label: 'Native',   color: '#B8652F', bg: 'rgba(184,101,47,0.08)'  },
//   external: { label: 'External', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
// };

// function StatusBadge({ status }) {
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
//   return (
//     <span style={{
//       fontSize: '10px', fontWeight: 600,
//       padding: '3px 8px', borderRadius: '99px',
//       background: cfg.bg, color: cfg.color,
//       border: `1px solid ${cfg.border}`,
//       letterSpacing: '0.04em', textTransform: 'uppercase',
//       fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap',
//     }}>
//       {cfg.label}
//     </span>
//   );
// }

// function SourceBadge({ source }) {
//   const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.native;
//   return (
//     <span style={{
//       fontSize: '10px', fontWeight: 600,
//       padding: '3px 8px', borderRadius: '99px',
//       background: cfg.bg, color: cfg.color,
//       border: `1px solid ${cfg.color}30`,
//       letterSpacing: '0.04em', textTransform: 'uppercase',
//       fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap',
//     }}>
//       {source === 'external' ? '🌐' : '🏢'} {cfg.label}
//     </span>
//   );
// }

// /* ── Toast ── */
// function Toast({ message, type, onDismiss }) {
//   useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
//   const colors = {
//     success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10B981' },
//     error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
//   };
//   const c = colors[type] || colors.error;
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
//       style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#fff', border: `1px solid ${c.border}`, borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 500, color: c.color, fontFamily: "'Geist', sans-serif", minWidth: '240px', whiteSpace: 'nowrap' }}
//     >
//       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
//       {message}
//     </motion.div>
//   );
// }

// /* ── Rejection Modal ── */
// function RejectionModal({ job, onConfirm, onCancel, loading }) {
//   const [note, setNote] = useState('');
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}
//       onClick={onCancel}>
//       <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', fontFamily: "'Geist', sans-serif" }}>
//         <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Reject Posting</h3>
//         <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6b6b6b' }}>
//           Provide a reason for rejecting <strong>{job.role}</strong> at <strong>{job.company_name}</strong>.
//         </p>
//         <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Incomplete requirements, duplicate listing…" rows={3}
//           style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', color: '#1a1a1a', marginBottom: '14px' }} />
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b' }}>Cancel</button>
//           <motion.button whileTap={{ scale: 0.97 }} disabled={!note.trim() || loading} onClick={() => onConfirm(note)}
//             style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: !note.trim() ? '#f5f5f5' : 'rgba(239,68,68,0.9)', color: !note.trim() ? '#aaa' : '#fff', fontSize: '13px', fontWeight: 600, cursor: !note.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
//             {loading ? 'Rejecting…' : 'Confirm Rejection'}
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ── Archive Confirm Modal ── */
// function ArchiveModal({ job, onConfirm, onCancel, loading }) {
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}
//       onClick={onCancel}>
//       <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', fontFamily: "'Geist', sans-serif" }}>
//         <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
//           </svg>
//         </div>
//         <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>Archive Posting?</h3>
//         <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b6b6b', lineHeight: 1.6 }}>
//           <strong>"{job.role}"</strong> at <strong>{job.company_name}</strong> will be removed from the public board. The record is retained for audit purposes.
//         </p>
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <button onClick={onCancel} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b' }}>Cancel</button>
//           <motion.button whileTap={{ scale: 0.97 }} disabled={loading} onClick={onConfirm}
//             style={{ flex: 2, padding: '9px', borderRadius: '8px', border: 'none', background: loading ? '#f5f5f5' : '#6B7280', color: loading ? '#aaa' : '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
//             {loading ? 'Archiving…' : 'Archive Posting'}
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ── Detail Modal ── */
// function JobDetailModal({ job, onClose, onApprove, onReject, onArchive, actionLoading }) {
//   if (!job) return null;
//   const logoColor    = job.logo_color || '#6b6b6b';
//   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
//   const canArchive   = job.status === 'approved' || job.status === 'rejected';

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
//       onClick={onClose}>
//       <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
//         transition={{ type: 'spring', stiffness: 340, damping: 34 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ background: '#ffffff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', fontFamily: "'Geist', 'Inter', sans-serif" }}>
//         <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
//           <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(0,0,0,0.12)' }} />
//         </div>
//         <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <div style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, background: `${logoColor}15`, border: `1px solid ${logoColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
//             <div>
//               <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{job.role}</h2>
//               <div style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '2px' }}>{job.company_name}</div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//           </button>
//         </div>

//         <div style={{ padding: '14px 20px 32px' }}>
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
//             {[job.job_type_label || job.job_type, job.location, job.salary].filter(Boolean).map((tag) => (
//               <span key={tag} style={{ fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{tag}</span>
//             ))}
//             <StatusBadge status={job.status} />
//             {job.source && <SourceBadge source={job.source} />}
//           </div>

//           <div style={{ fontSize: '11px', color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Description</div>
//           <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#3b3b3b', lineHeight: 1.65 }}>{job.description}</p>

//           {job.requirements && (
//             <>
//               <div style={{ fontSize: '11px', color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Requirements</div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
//                 {(Array.isArray(job.requirements) ? job.requirements : [job.requirements]).map((req, i) => (
//                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b3b3b' }}>
//                     <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B8652F', flexShrink: 0 }} />
//                     {req}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {job.rejection_note && (
//             <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '10px', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Rejection Note</div>
//               <p style={{ margin: 0, fontSize: '12px', color: '#6b6b6b', lineHeight: 1.5 }}>{job.rejection_note}</p>
//             </div>
//           )}

//           <div style={{ fontSize: '11px', color: '#9b9b9b', marginBottom: '20px' }}>
//             Submitted: {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { dateStyle: 'long' }) : '—'} — {job.company_email}
//             {job.reviewed_by_email && <><br />Reviewed by: {job.reviewed_by_email}</>}
//             {job.archived_at && <><br />Archived: {new Date(job.archived_at).toLocaleDateString('en-KE', { dateStyle: 'long' })}</>}
//           </div>

//           {job.status === 'pending' && (
//             <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
//               <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => onReject(job)}
//                 style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '14px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
//                 Reject
//               </motion.button>
//               <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => onApprove(job)}
//                 style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(16,185,129,0.25)', opacity: actionLoading ? 0.7 : 1 }}>
//                 {actionLoading ? 'Processing…' : 'Approve & Publish'}
//               </motion.button>
//             </div>
//           )}

//           {canArchive && (
//             <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => onArchive(job)}
//               style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(107,114,128,0.2)', background: 'rgba(107,114,128,0.06)', color: '#6B7280', fontSize: '13px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: actionLoading ? 0.6 : 1 }}>
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
//               </svg>
//               Archive Posting
//             </motion.button>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ── Mobile card ── */
// function JobCard({ job, onSelect, onApprove, onReject, onArchive, actionLoading }) {
//   const logoColor    = job.logo_color || '#6b6b6b';
//   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
//   const canArchive   = job.status === 'approved' || job.status === 'rejected';

//   return (
//     <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
//       onClick={() => onSelect(job)}
//       style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
//       <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: logoColor, borderRadius: '12px 0 0 12px' }} />
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
//           <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</div>
//             <div style={{ fontSize: '12px', color: '#6b6b6b', marginTop: '1px' }}>{job.company_name}</div>
//           </div>
//         </div>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
//           <StatusBadge status={job.status} />
//           {job.source && <SourceBadge source={job.source} />}
//         </div>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: (job.status === 'pending' || canArchive) ? '10px' : '0' }}>
//         {[job.job_type_label || job.job_type, job.location].filter(Boolean).map((tag) => (
//           <span key={tag} style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '5px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{tag}</span>
//         ))}
//         <span style={{ fontSize: '10px', color: '#9b9b9b', padding: '3px 4px', fontFamily: 'monospace' }}>
//           {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
//         </span>
//       </div>
//       {job.status === 'pending' && (
//         <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
//           <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onReject(job)}
//             style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>Reject</motion.button>
//           <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onApprove(job)}
//             style={{ flex: 2, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>Approve</motion.button>
//         </div>
//       )}
//       {canArchive && (
//         <div onClick={(e) => e.stopPropagation()}>
//           <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onArchive(job)}
//             style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(107,114,128,0.2)', background: 'rgba(107,114,128,0.06)', color: '#6B7280', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>Archive</motion.button>
//         </div>
//       )}
//     </motion.div>
//   );
// }

// /* ── Skeleton loader ── */
// function SkeletonRow() {
//   return (
//     <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
//       {[180, 120, 80, 140, 70, 60, 70, 110].map((w, i) => (
//         <td key={i} style={{ padding: '14px 16px' }}>
//           <div style={{ width: w, height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
//         </td>
//       ))}
//     </tr>
//   );
// }

// /* ── Main ── */
// export default function JobPostingApprovals() {
//   const [jobs, setJobs]                   = useState([]);
//   const [loading, setLoading]             = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [filter, setFilter]               = useState('all');
//   const [selected, setSelected]           = useState(null);
//   const [search, setSearch]               = useState('');
//   const [toast, setToast]                 = useState(null);
//   const [rejectTarget, setRejectTarget]   = useState(null);
//   const [archiveTarget, setArchiveTarget] = useState(null);

//   const showToast = (message, type = 'success') => setToast({ message, type });

//   const fetchJobs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(endpoints.dashboard.jobPostings);
//       setJobs(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
//     } catch {
//       showToast('Failed to load job postings.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchJobs(); }, [fetchJobs]);

//   const handleSelect = async (job) => {
//     setSelected(job);
//     try {
//       const res = await api.get(endpoints.dashboard.jobPosting(job.id));
//       setSelected(res.data);
//     } catch { /* keep list-level data */ }
//   };

//   // const handleApprove = async (job) => {
//   //   setActionLoading(true);
//   //   try {
//   //     await api.post(endpoints.dashboard.jobReview(job.id), { action: 'approve' });
//   //     setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'approved' } : j));
//   //     if (selected?.id === job.id) setSelected((s) => ({ ...s, status: 'approved' }));
//   //     showToast(`"${job.role}" approved and published.`, 'success');
//   //   } catch (err) {
//   //     showToast(err?.response?.data?.detail || 'Failed to approve posting.', 'error');
//   //   } finally {
//   //     setActionLoading(false);
//   //   }
//   // };

//   // const handleRejectRequest  = (job) => setRejectTarget(job);

//   // const handleRejectConfirm = async (note) => {
//   //   const job = rejectTarget;
//   //   setActionLoading(true);
//   //   try {
//   //     await api.post(endpoints.dashboard.jobReview(job.id), { action: 'reject', rejection_note: note });
//   //     setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'rejected' } : j));
//   //     if (selected?.id === job.id) setSelected((s) => ({ ...s, status: 'rejected', rejection_note: note }));
//   //     showToast(`"${job.role}" rejected.`, 'error');
//   //     setRejectTarget(null);
//   //   } catch (err) {
//   //     showToast(err?.response?.data?.detail || err?.response?.data?.rejection_note?.[0] || 'Failed to reject posting.', 'error');
//   //   } finally {
//   //     setActionLoading(false);
//   //   }
//   // };

//    const handleAction = async (action, job) => {
//     if (action === 'reject') {
//       setRejectTarget(job);        // keep your existing rejection note modal
//       return;
//     }
//     if (action === 'archive') {
//       setArchiveTarget(job);       // keep your existing archive confirm modal
//       return;
//     }
//     if (action === 'approve') {
//       setActionLoading(true);
//       try {
//         const res = await api.post(endpoints.dashboard.jobApprove(job.id), {});
//         setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, ...res.data } : j));
//         setSelected(null);
//         showToast(`"${job.title}" approved and published.`, 'success');
//       } catch (err) {
//         showToast(err?.response?.data?.detail || 'Failed to approve.', 'error');
//       } finally {
//         setActionLoading(false);
//       }
//     }
//   };
 

//   const handleArchiveRequest = (job) => setArchiveTarget(job);

//   const handleArchiveConfirm = async () => {
//     const job = archiveTarget;
//     setActionLoading(true);
//     try {
//       await api.post(`${endpoints.dashboard.jobPosting(job.id)}archive/`);
//       setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'archived' } : j));
//       if (selected?.id === job.id) setSelected((s) => ({ ...s, status: 'archived' }));
//       showToast(`"${job.role}" archived.`, 'success');
//       setArchiveTarget(null);
//       setSelected(null);
//     } catch (err) {
//       showToast(err?.response?.data?.detail || 'Failed to archive posting.', 'error');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const counts = {
//     all:      jobs.length,
//     pending:  jobs.filter((j) => j.status === 'pending').length,
//     approved: jobs.filter((j) => j.status === 'approved').length,
//     rejected: jobs.filter((j) => j.status === 'rejected').length,
//     archived: jobs.filter((j) => j.status === 'archived').length,
//   };

//   const filtered = jobs.filter((j) => {
//     const matchStatus = filter === 'all' || j.status === filter;
//     const matchSearch = !search ||
//       (j.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
//       (j.role || '').toLowerCase().includes(search.toLowerCase());
//     return matchStatus && matchSearch;
//   });

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
//         @keyframes shimmer { to { background-position: -200% 0; } }
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         .jp-filter-btn { border: none; cursor: pointer; font-family: 'Geist', sans-serif; transition: all 0.15s; }
//         .jp-row        { transition: background 0.12s; cursor: pointer; }
//         .jp-row:hover  { background: rgba(184,101,47,0.03) !important; }
//         .jp-table-wrap { display: block; }
//         .jp-cards-wrap { display: none; }
//         @media (max-width: 640px) {
//           .jp-table-wrap       { display: none !important; }
//           .jp-cards-wrap       { display: flex !important; flex-direction: column; gap: 10px; padding: 12px; }
//           .jp-stats-grid       { grid-template-columns: repeat(2, 1fr) !important; }
//           .jp-toolbar          { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
//           .jp-filter-scroll    { overflow-x: auto; padding-bottom: 2px; }
//           .jp-search-box       { max-width: 100% !important; }
//           .jp-search-box input { width: 100% !important; min-width: 0; }
//         }
//       `}</style>

//       <AnimatePresence>
//         {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
//       </AnimatePresence>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Geist', sans-serif" }}>

//         {/* Stats — 5 cards now */}
//         <div className="jp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
//           {[
//             { label: 'Total',    value: counts.all,      color: '#6b6b6b' },
//             { label: 'Pending',  value: counts.pending,  color: '#F59E0B' },
//             { label: 'Approved', value: counts.approved, color: '#10B981' },
//             { label: 'Rejected', value: counts.rejected, color: '#EF4444' },
//             { label: 'Archived', value: counts.archived, color: '#6B7280' },
//           ].map((stat, i) => (
//             <motion.div key={stat.label}
//               initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
//               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
//               <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '4px' }}>{stat.label}</div>
//               <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
//                 {loading ? <span style={{ display: 'inline-block', width: 32, height: 26, borderRadius: 6, background: '#f0f0f0' }} /> : stat.value}
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* Main panel */}
//         <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
//           style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}>

//           {/* Toolbar */}
//           <div className="jp-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
//             <div className="jp-filter-scroll">
//               <div style={{ display: 'flex', gap: '3px', background: '#F7F4F0', padding: '3px', borderRadius: '9px', width: 'fit-content' }}>
//                 {['all', 'pending', 'approved', 'rejected', 'archived'].map((f) => (
//                   <button key={f} className="jp-filter-btn" onClick={() => setFilter(f)}
//                     style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: filter === f ? '#ffffff' : 'transparent', color: filter === f ? '#1a1a1a' : '#6b6b6b', boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
//                     {f}{counts[f] > 0 ? ` (${counts[f]})` : ''}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="jp-search-box" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F7F4F0', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '8px 12px', flex: 1, maxWidth: '280px' }}>
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role…"
//                 style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1a1a1a', fontFamily: 'inherit', width: '100%', minWidth: 0 }} />
//             </div>
//             <motion.button whileTap={{ scale: 0.94 }} onClick={fetchJobs} disabled={loading} title="Refresh"
//               style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                 style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
//                 <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
//               </svg>
//             </motion.button>
//           </div>

//           {/* Desktop table */}
//           <div className="jp-table-wrap">
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#FAFAF8', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
//                   {['Company', 'Role', 'Type', 'Location', 'Source', 'Submitted', 'Status', 'Actions'].map((h) => (
//                     <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', whiteSpace: 'nowrap' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
//                 ) : filtered.length === 0 ? (
//                   <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</td></tr>
//                 ) : filtered.map((job, idx) => {
//                   const logoColor    = job.logo_color || '#6b6b6b';
//                   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
//                   const canArchive   = job.status === 'approved' || job.status === 'rejected';
//                   return (
//                     <tr key={job.id} className="jp-row" onClick={() => handleSelect(job)}
//                       style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: 'transparent' }}>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                           <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
//                           <div>
//                             <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{job.company_name}</div>
//                             <div style={{ fontSize: '11px', color: '#9b9b9b' }}>{job.company_email}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{job.role}</td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{job.job_type_label || job.job_type}</span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b6b6b' }}>{job.location}</td>
//                       <td style={{ padding: '12px 16px' }}>{job.source && <SourceBadge source={job.source} />}</td>
//                       <td style={{ padding: '12px 16px', fontSize: '11px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
//                         {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}><StatusBadge status={job.status} /></td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
//                           {job.status === 'pending' && (
//                             <>
//                               <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => handleApprove(job)}
//                                 style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '11px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading ? 0.6 : 1 }}>Approve</motion.button>
//                               <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => handleRejectRequest(job)}
//                                 style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '11px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading ? 0.6 : 1 }}>Reject</motion.button>
//                             </>
//                           )}
//                           {canArchive && (
//                             <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => handleArchiveRequest(job)}
//                               style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(107,114,128,0.08)', color: '#6B7280', fontSize: '11px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading ? 0.6 : 1 }}>Archive</motion.button>
//                           )}
//                           {job.status === 'archived' && (
//                             <span style={{ fontSize: '11px', color: '#9b9b9b', fontStyle: 'italic' }}>Archived</span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile cards */}
//           <div className="jp-cards-wrap">
//             {loading
//               ? Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} style={{ background: 'linear-gradient(90deg, #f7f7f7 25%, #f0f0f0 50%, #f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', height: '96px' }} />
//                 ))
//               : filtered.length === 0
//                 ? <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</div>
//                 : filtered.map((job) => (
//                     <JobCard key={job.id} job={job} onSelect={handleSelect} onApprove={handleApprove} onReject={handleRejectRequest} onArchive={handleArchiveRequest} actionLoading={actionLoading} />
//                   ))
//             }
//           </div>
//         </motion.div>
//       </div>

//       <AnimatePresence>
//         {selected && <JobDetailModal job={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleRejectRequest} onArchive={handleArchiveRequest} actionLoading={actionLoading} />}
//       </AnimatePresence>

//       <AnimatePresence>
//         {rejectTarget && <RejectionModal job={rejectTarget} loading={actionLoading} onConfirm={handleRejectConfirm} onCancel={() => setRejectTarget(null)} />}
//       </AnimatePresence>

//       <AnimatePresence>
//         {archiveTarget && <ArchiveModal job={archiveTarget} loading={actionLoading} onConfirm={handleArchiveConfirm} onCancel={() => setArchiveTarget(null)} />}
//       </AnimatePresence>
//     </>
//   );
// }























// import { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { api } from '@/api/auth';
// import { endpoints } from '@/api/endpoints';

// /* ── Status config ── */
// const STATUS_CONFIG = {
//   pending:  { label: 'Pending',  bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
//   approved: { label: 'Approved', bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
//   rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
// };

// function StatusBadge({ status }) {
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
//   return (
//     <span style={{
//       fontSize: '10px', fontWeight: 600,
//       padding: '3px 8px', borderRadius: '99px',
//       background: cfg.bg, color: cfg.color,
//       border: `1px solid ${cfg.border}`,
//       letterSpacing: '0.04em', textTransform: 'uppercase',
//       fontFamily: "'DM Mono', monospace",
//       whiteSpace: 'nowrap',
//     }}>
//       {cfg.label}
//     </span>
//   );
// }

// /* ── Inline toast ── */
// function Toast({ message, type, onDismiss }) {
//   useEffect(() => {
//     const t = setTimeout(onDismiss, 3500);
//     return () => clearTimeout(t);
//   }, [onDismiss]);

//   const colors = {
//     success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10B981' },
//     error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
//   };
//   const c = colors[type] || colors.error;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
//       style={{
//         position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
//         zIndex: 9999, background: '#fff', border: `1px solid ${c.border}`,
//         borderRadius: '10px', padding: '10px 16px',
//         display: 'flex', alignItems: 'center', gap: '8px',
//         boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//         fontSize: '13px', fontWeight: 500, color: c.color,
//         fontFamily: "'Geist', sans-serif", minWidth: '240px',
//         whiteSpace: 'nowrap',
//       }}
//     >
//       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
//       {message}
//     </motion.div>
//   );
// }

// /* ── Rejection Note Modal ── */
// function RejectionModal({ job, onConfirm, onCancel, loading }) {
//   const [note, setNote] = useState('');
//   return (
//     <motion.div
//       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}
//       onClick={onCancel}
//     >
//       <motion.div
//         initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', fontFamily: "'Geist', sans-serif" }}
//       >
//         <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Reject Posting</h3>
//         <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6b6b6b' }}>
//           Please provide a reason for rejecting <strong>{job.role}</strong> at <strong>{job.company_name}</strong>.
//         </p>
//         <textarea
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           placeholder="e.g. Incomplete requirements, duplicate listing…"
//           rows={3}
//           style={{
//             width: '100%', boxSizing: 'border-box', padding: '10px 12px',
//             border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px',
//             fontSize: '13px', fontFamily: 'inherit', resize: 'vertical',
//             outline: 'none', color: '#1a1a1a', marginBottom: '14px',
//           }}
//         />
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b' }}>
//             Cancel
//           </button>
//           <motion.button
//             whileTap={{ scale: 0.97 }}
//             disabled={!note.trim() || loading}
//             onClick={() => onConfirm(note)}
//             style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: !note.trim() ? '#f5f5f5' : 'rgba(239,68,68,0.9)', color: !note.trim() ? '#aaa' : '#fff', fontSize: '13px', fontWeight: 600, cursor: !note.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
//           >
//             {loading ? 'Rejecting…' : 'Confirm Rejection'}
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ── Detail Modal ── */
// function JobDetailModal({ job, onClose, onApprove, onReject, actionLoading }) {
//   if (!job) return null;
//   const logoColor = job.logo_color || '#6b6b6b';
//   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';

//   return (
//     <motion.div
//       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
//         transition={{ type: 'spring', stiffness: 340, damping: 34 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ background: '#ffffff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', fontFamily: "'Geist', 'Inter', sans-serif" }}
//       >
//         <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
//           <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(0,0,0,0.12)' }} />
//         </div>

//         <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <div style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, background: `${logoColor}15`, border: `1px solid ${logoColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: logoColor }}>
//               {logoInitials}
//             </div>
//             <div>
//               <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{job.role}</h2>
//               <div style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '2px' }}>{job.company_name}</div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//           </button>
//         </div>

//         <div style={{ padding: '14px 20px 32px' }}>
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
//             {[job.job_type_label || job.job_type, job.location, job.salary].filter(Boolean).map((tag) => (
//               <span key={tag} style={{ fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{tag}</span>
//             ))}
//             <StatusBadge status={job.status} />
//           </div>

//           <div style={{ fontSize: '11px', color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Description</div>
//           <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#3b3b3b', lineHeight: 1.65 }}>{job.description}</p>

//           {job.requirements && (
//             <>
//               <div style={{ fontSize: '11px', color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Requirements</div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
//                 {(Array.isArray(job.requirements) ? job.requirements : [job.requirements]).map((req, i) => (
//                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b3b3b' }}>
//                     <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B8652F', flexShrink: 0 }} />
//                     {req}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {job.rejection_note && (
//             <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '10px', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Rejection Note</div>
//               <p style={{ margin: 0, fontSize: '12px', color: '#6b6b6b', lineHeight: 1.5 }}>{job.rejection_note}</p>
//             </div>
//           )}

//           <div style={{ fontSize: '11px', color: '#9b9b9b', marginBottom: '20px' }}>
//             Submitted: {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { dateStyle: 'long' }) : '—'} — {job.company_email}
//             {job.reviewed_by_email && <><br />Reviewed by: {job.reviewed_by_email}</>}
//           </div>

//           {job.status === 'pending' && (
//             <div style={{ display: 'flex', gap: '8px' }}>
//               <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => onReject(job)}
//                 style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '14px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
//                 Reject
//               </motion.button>
//               <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => onApprove(job)}
//                 style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(16,185,129,0.25)', opacity: actionLoading ? 0.7 : 1 }}>
//                 {actionLoading ? 'Processing…' : 'Approve & Publish'}
//               </motion.button>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ── Mobile card ── */
// function JobCard({ job, onSelect, onApprove, onReject, actionLoading }) {
//   const logoColor = job.logo_color || '#6b6b6b';
//   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
//       onClick={() => onSelect(job)}
//       style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
//     >
//       <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: logoColor, borderRadius: '12px 0 0 12px' }} />
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
//           <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</div>
//             <div style={{ fontSize: '12px', color: '#6b6b6b', marginTop: '1px' }}>{job.company_name}</div>
//           </div>
//         </div>
//         <StatusBadge status={job.status} />
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: job.status === 'pending' ? '10px' : '0' }}>
//         {[job.job_type_label || job.job_type, job.location].filter(Boolean).map((tag) => (
//           <span key={tag} style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '5px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{tag}</span>
//         ))}
//         <span style={{ fontSize: '10px', color: '#9b9b9b', padding: '3px 4px', fontFamily: 'monospace' }}>
//           {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
//         </span>
//       </div>
//       {job.status === 'pending' && (
//         <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
//           <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onReject(job)}
//             style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
//             Reject
//           </motion.button>
//           <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onApprove(job)}
//             style={{ flex: 2, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
//             Approve
//           </motion.button>
//         </div>
//       )}
//     </motion.div>
//   );
// }

// /* ── Skeleton loader ── */
// function SkeletonRow() {
//   return (
//     <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
//       {[180, 120, 80, 140, 60, 70, 110].map((w, i) => (
//         <td key={i} style={{ padding: '14px 16px' }}>
//           <div style={{ width: w, height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
//         </td>
//       ))}
//     </tr>
//   );
// }

// /* ── Main component ── */
// export default function JobPostingApprovals() {
//   const [jobs, setJobs]               = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [filter, setFilter]           = useState('all');
//   const [selected, setSelected]       = useState(null);
//   const [search, setSearch]           = useState('');
//   const [toast, setToast]             = useState(null); // { message, type }
//   const [rejectTarget, setRejectTarget] = useState(null); // job object awaiting rejection note

//   const showToast = (message, type = 'success') => setToast({ message, type });

//   /* ── Fetch list ── */
//   const fetchJobs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(endpoints.dashboard.jobPostings);
//       setJobs(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
//     } catch (err) {
//       showToast('Failed to load job postings.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchJobs(); }, [fetchJobs]);

//   /* ── Fetch detail when modal opens ── */
//   const handleSelect = async (job) => {
//     setSelected(job); // open immediately with list data
//     try {
//       const res = await api.get(endpoints.dashboard.jobPosting(job.id));
//       setSelected(res.data); // enrich with full detail
//     } catch {
//       // keep list-level data, not critical
//     }
//   };

//   /* ── Approve ── */
//   const handleApprove = async (job) => {
//     setActionLoading(true);
//     try {
//       await api.post(endpoints.dashboard.jobReview(job.id), { action: 'approve' });
//       setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'approved' } : j));
//       if (selected?.id === job.id) setSelected((s) => ({ ...s, status: 'approved' }));
//       showToast(`"${job.role}" approved successfully.`, 'success');
//     } catch (err) {
//       showToast(err?.response?.data?.detail || 'Failed to approve posting.', 'error');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Reject (two-step: open note modal → submit) ── */
//   const handleRejectRequest = (job) => {
//     setRejectTarget(job);
//   };

//   const handleRejectConfirm = async (note) => {
//     const job = rejectTarget;
//     setActionLoading(true);
//     try {
//       await api.post(endpoints.dashboard.jobReview(job.id), { action: 'reject', rejection_note: note });
//       setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'rejected' } : j));
//       if (selected?.id === job.id) setSelected((s) => ({ ...s, status: 'rejected', rejection_note: note }));
//       showToast(`"${job.role}" rejected.`, 'error');
//       setRejectTarget(null);
//     } catch (err) {
//       showToast(err?.response?.data?.detail || err?.response?.data?.rejection_note?.[0] || 'Failed to reject posting.', 'error');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Derived state ── */
//   const counts = {
//     all:      jobs.length,
//     pending:  jobs.filter((j) => j.status === 'pending').length,
//     approved: jobs.filter((j) => j.status === 'approved').length,
//     rejected: jobs.filter((j) => j.status === 'rejected').length,
//   };

//   const filtered = jobs.filter((j) => {
//     const matchStatus = filter === 'all' || j.status === filter;
//     const matchSearch = !search ||
//       (j.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
//       (j.role || '').toLowerCase().includes(search.toLowerCase());
//     return matchStatus && matchSearch;
//   });

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
//         @keyframes shimmer { to { background-position: -200% 0; } }

//         .jp-filter-btn  { border: none; cursor: pointer; font-family: 'Geist', sans-serif; transition: all 0.15s; }
//         .jp-row         { transition: background 0.12s; cursor: pointer; }
//         .jp-row:hover   { background: rgba(184,101,47,0.03) !important; }
//         .jp-table-wrap  { display: block; }
//         .jp-cards-wrap  { display: none; }

//         @media (max-width: 640px) {
//           .jp-table-wrap       { display: none !important; }
//           .jp-cards-wrap       { display: flex !important; flex-direction: column; gap: 10px; padding: 12px; }
//           .jp-stats-grid       { grid-template-columns: repeat(2, 1fr) !important; }
//           .jp-toolbar          { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
//           .jp-filter-scroll    { overflow-x: auto; padding-bottom: 2px; }
//           .jp-search-box       { max-width: 100% !important; }
//           .jp-search-box input { width: 100% !important; min-width: 0; }
//         }
//       `}</style>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
//       </AnimatePresence>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Geist', sans-serif" }}>

//         {/* Stats */}
//         <div className="jp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
//           {[
//             { label: 'Total',    value: counts.all,      color: '#6b6b6b' },
//             { label: 'Pending',  value: counts.pending,  color: '#F59E0B' },
//             { label: 'Approved', value: counts.approved, color: '#10B981' },
//             { label: 'Rejected', value: counts.rejected, color: '#EF4444' },
//           ].map((stat, i) => (
//             <motion.div key={stat.label}
//               initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
//               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
//               <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '4px' }}>{stat.label}</div>
//               <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
//                 {loading ? <span style={{ display: 'inline-block', width: 32, height: 26, borderRadius: 6, background: '#f0f0f0' }} /> : stat.value}
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* Main panel */}
//         <motion.div
//           initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
//           style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}
//         >
//           {/* Toolbar */}
//           <div className="jp-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
//             <div className="jp-filter-scroll">
//               <div style={{ display: 'flex', gap: '3px', background: '#F7F4F0', padding: '3px', borderRadius: '9px', width: 'fit-content' }}>
//                 {['all', 'pending', 'approved', 'rejected'].map((f) => (
//                   <button key={f} className="jp-filter-btn" onClick={() => setFilter(f)}
//                     style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: filter === f ? '#ffffff' : 'transparent', color: filter === f ? '#1a1a1a' : '#6b6b6b', boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
//                     {f}{counts[f] > 0 ? ` (${counts[f]})` : ''}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="jp-search-box" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F7F4F0', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '8px 12px', flex: 1, maxWidth: '280px' }}>
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role…"
//                 style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1a1a1a', fontFamily: 'inherit', width: '100%', minWidth: 0 }} />
//             </div>

//             {/* Refresh */}
//             <motion.button whileTap={{ scale: 0.94 }} onClick={fetchJobs} disabled={loading}
//               title="Refresh"
//               style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                 style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
//                 <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
//               </svg>
//             </motion.button>
//           </div>

//           {/* Desktop table */}
//           <div className="jp-table-wrap">
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#FAFAF8', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
//                   {['Company', 'Role', 'Type', 'Location', 'Submitted', 'Status', 'Actions'].map((h) => (
//                     <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', whiteSpace: 'nowrap' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
//                 ) : filtered.length === 0 ? (
//                   <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</td></tr>
//                 ) : filtered.map((job, idx) => {
//                   const logoColor = job.logo_color || '#6b6b6b';
//                   const logoInitials = job.company_logo || job.company_name?.slice(0, 2).toUpperCase() || '??';
//                   return (
//                     <tr key={job.id} className="jp-row" onClick={() => handleSelect(job)}
//                       style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: 'transparent' }}>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                           <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: `${logoColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: logoColor }}>{logoInitials}</div>
//                           <div>
//                             <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{job.company_name}</div>
//                             <div style={{ fontSize: '11px', color: '#9b9b9b' }}>{job.company_email}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{job.role}</td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)' }}>{job.job_type_label || job.job_type}</span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b6b6b' }}>{job.location}</td>
//                       <td style={{ padding: '12px 16px', fontSize: '11px', color: '#9b9b9b', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
//                         {job.submitted_at ? new Date(job.submitted_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}><StatusBadge status={job.status} /></td>
//                       <td style={{ padding: '12px 16px' }}>
//                         {job.status === 'pending' ? (
//                           <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
//                             <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => handleApprove(job)}
//                               style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '11px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading ? 0.6 : 1 }}>Approve</motion.button>
//                             <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => handleRejectRequest(job)}
//                               style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '11px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading ? 0.6 : 1 }}>Reject</motion.button>
//                           </div>
//                         ) : <span style={{ fontSize: '12px', color: '#9b9b9b' }}>—</span>}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile cards */}
//           <div className="jp-cards-wrap">
//             {loading
//               ? Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px', height: '96px', background: 'linear-gradient(90deg, #f7f7f7 25%, #f0f0f0 50%, #f7f7f7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
//                 ))
//               : filtered.length === 0
//                 ? <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b9b' }}>No job postings match.</div>
//                 : filtered.map((job) => (
//                     <JobCard key={job.id} job={job} onSelect={handleSelect} onApprove={handleApprove} onReject={handleRejectRequest} actionLoading={actionLoading} />
//                   ))
//             }
//           </div>
//         </motion.div>
//       </div>

//       {/* Detail modal */}
//       <AnimatePresence>
//         {selected && (
//           <JobDetailModal
//             job={selected}
//             onClose={() => setSelected(null)}
//             onApprove={handleApprove}
//             onReject={handleRejectRequest}
//             actionLoading={actionLoading}
//           />
//         )}
//       </AnimatePresence>

//       {/* Rejection note modal */}
//       <AnimatePresence>
//         {rejectTarget && (
//           <RejectionModal
//             job={rejectTarget}
//             loading={actionLoading}
//             onConfirm={handleRejectConfirm}
//             onCancel={() => setRejectTarget(null)}
//           />
//         )}
//       </AnimatePresence>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>
//     </>
//   );
// }