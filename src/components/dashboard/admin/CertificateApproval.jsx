import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';

/* ── Status badge ── */
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  approved: { label: 'Approved', bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600,
      padding: '3px 8px', borderRadius: '99px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: "'DM Mono', monospace",
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

/* ── Toast ── */
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', color: '#059669' },
    error:   { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   color: '#DC2626' },
  };
  const c = colors[type] || colors.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: c.color, fontFamily: "'Geist', sans-serif" }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {type === 'success'
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        }
        {message}
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: c.color, cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>✕</button>
    </motion.div>
  );
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[['60%', 12], ['80%', 10], ['100%', 36], ['100%', 10], ['100%', 34]].map(([w, h], i) => (
        <div key={i} style={{ width: w, height: h, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      ))}
    </div>
  );
}

/* ── Certificate card ── */
function CertCard({ cert, onApprove, onReject, actionLoading }) {
  const initials = (cert.student_name || '??').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '0', fontFamily: "'Geist', sans-serif", position: 'relative', overflow: 'hidden' }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #F59E0B, #B8652F)' }} />

      {/* Student */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(184,101,47,0.1)', border: '1px solid rgba(184,101,47,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#B8652F', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cert.student_name}</div>
            <div style={{ fontSize: '11px', color: '#9b9b9b', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cert.student_email}</div>
          </div>
        </div>
        <StatusBadge status={cert.status || 'pending'} />
      </div>

      {/* Course */}
      <div style={{ background: '#F7F4F0', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '3px' }}>Course</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{cert.course_name}</div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '2px' }}>Completed</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', fontFamily: "'DM Mono', monospace" }}>
            {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </div>
        </div>
        {cert.score != null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '2px' }}>Score</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: cert.score >= 80 ? '#10B981' : cert.score >= 60 ? '#F59E0B' : '#EF4444', fontFamily: "'DM Mono', monospace" }}>{cert.score}%</div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(!cert.status || cert.status === 'pending') ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button whileTap={{ scale: 0.96 }} disabled={actionLoading} onClick={() => onReject(cert.id)}
            style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} disabled={actionLoading} onClick={() => onApprove(cert.id)}
            style={{ flex: 2, padding: '9px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1, boxShadow: '0 3px 12px rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Approve & Issue
          </motion.button>
        </div>
      ) : (
        <div style={{ padding: '9px', borderRadius: '8px', background: cert.status === 'approved' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${cert.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, textAlign: 'center', fontSize: '12px', fontWeight: 600, color: cert.status === 'approved' ? '#10B981' : '#EF4444' }}>
          {cert.status === 'approved' ? '✓ Certificate Issued' : '✕ Certificate Rejected'}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main ── */
export default function CertificateApproval() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter]             = useState('pending');
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ── Fetch ── */
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      // Use certPending for pending-only, or certificates for all
      const url = filter === 'pending' ? endpoints.dashboard.certPending : endpoints.dashboard.certificates;
      const res = await api.get(url);
      setCertificates(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch {
      showToast('Failed to load certificates.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  /* ── Approve ── */
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.post(endpoints.dashboard.certApprove(id));
      setCertificates((prev) => prev.map((c) => c.id === id ? { ...c, status: 'approved' } : c));
      showToast('Certificate approved and issued.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to approve certificate.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Reject ── */
  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await api.post(endpoints.dashboard.certReject(id));
      setCertificates((prev) => prev.map((c) => c.id === id ? { ...c, status: 'rejected' } : c));
      showToast('Certificate rejected.', 'error');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to reject certificate.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Derived ── */
  const counts = {
    pending:  certificates.filter((c) => !c.status || c.status === 'pending').length,
    approved: certificates.filter((c) => c.status === 'approved').length,
    rejected: certificates.filter((c) => c.status === 'rejected').length,
  };

  const filtered = certificates.filter((c) => {
    const matchSearch = !search ||
      (c.student_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.student_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.course_name   || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shimmer { to { background-position: -200% 0; } }
        .cert-filter-btn { border: none; cursor: pointer; font-family: 'Geist', sans-serif; transition: all 0.15s; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Geist', sans-serif" }}>

        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </AnimatePresence>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { label: 'Pending',  value: counts.pending,  color: '#F59E0B' },
            { label: 'Approved', value: counts.approved, color: '#10B981' },
            { label: 'Rejected', value: counts.rejected, color: '#EF4444' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? <span style={{ display: 'inline-block', width: 32, height: 24, borderRadius: 6, background: '#f0f0f0' }} /> : s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden' }}
        >
          {/* Toolbar */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '3px', background: '#F7F4F0', padding: '3px', borderRadius: '9px' }}>
              {['pending', 'approved', 'rejected', 'all'].map((f) => (
                <button key={f} className="cert-filter-btn" onClick={() => setFilter(f)}
                  style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: filter === f ? '#ffffff' : 'transparent', color: filter === f ? '#1a1a1a' : '#6b6b6b', boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F7F4F0', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '7px 12px', flex: 1, maxWidth: '300px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or course…"
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1a1a1a', fontFamily: 'inherit', width: '100%' }} />
            </div>

            {/* Refresh */}
            <motion.button whileTap={{ scale: 0.94 }} onClick={fetchCertificates} disabled={loading} title="Refresh"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9b9b', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </motion.button>
          </div>

          {/* Grid */}
          <div style={{ padding: '16px' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                  {filter === 'pending' ? '🏆' : '✓'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>
                  {filter === 'pending' ? 'All Caught Up!' : 'Nothing to show'}
                </div>
                <div style={{ fontSize: '13px', color: '#9b9b9b' }}>
                  {filter === 'pending'
                    ? 'No pending certificate approvals at the moment.'
                    : `No ${filter} certificates match your search.`}
                </div>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                <AnimatePresence>
                  {filtered.map((cert) => (
                    <CertCard
                      key={cert.id}
                      cert={cert}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      actionLoading={actionLoading}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}