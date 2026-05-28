import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';
import AdminDetailModal, { ViewDetailsButton } from './AdminDetailModal';

// ─── Skeleton row (desktop) ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: '#f0f0f0' }} />
      </td>
      {[140, 160, 100, 80, 60, 90].map((w, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <div style={{ width: w, height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Skeleton card (mobile) ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0f0f0', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '60%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 6 }} />
          <div style={{ width: '40%', height: 10, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </div>
      </div>
      <div style={{ width: '80%', height: 10, borderRadius: 6, background: '#f0f0f0', marginBottom: 8 }} />
      <div style={{ width: '50%', height: 10, borderRadius: 6, background: '#f0f0f0' }} />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const c = type === 'success'
    ? { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', color: '#059669' }
    : { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   color: '#DC2626' };
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: c.color, fontFamily: "'Geist', sans-serif", marginBottom: '12px' }}>
      {message}
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: c.color, cursor: 'pointer', padding: 0 }}>✕</button>
    </motion.div>
  );
}

// ─── Mobile student card ──────────────────────────────────────────────────────
function StudentCard({ student, isSelected, onToggleSelect, onView, onApprove, actionLoading }) {
  const initials = (student.full_name || '??').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: isSelected ? 'rgba(184,101,47,0.04)' : '#fff', border: `1px solid ${isSelected ? 'rgba(184,101,47,0.2)' : 'rgba(0,0,0,0.07)'}`, borderRadius: '12px', padding: '14px 16px', position: 'relative', overflow: 'hidden', transition: 'all 0.15s' }}>

      {/* Left accent bar — shows when selected */}
      {isSelected && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#B8652F', borderRadius: '12px 0 0 12px' }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Checkbox */}
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(student.id)}
            style={{ cursor: 'pointer', flexShrink: 0, width: 15, height: 15, accentColor: '#B8652F' }} />
          {/* Avatar */}
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: 'rgba(184,101,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#B8652F' }}>{initials}</div>
          {/* Name + email */}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.full_name}</div>
            <div style={{ fontSize: '11px', color: '#9b9b9b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</div>
          </div>
        </div>
        {/* Status badge */}
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, background: student.is_approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: student.is_approved ? '#059669' : '#D97706' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
          {student.is_approved ? 'Active' : 'Pending'}
        </span>
      </div>

      {/* Course + progress row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        {student.enrolled_course && (
          <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '5px', background: '#F7F4F0', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.06)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {student.enrolled_course}
          </span>
        )}
        {student.completion_pct != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '50px', height: '4px', background: 'rgba(0,0,0,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${student.completion_pct}%`, height: '100%', background: student.completion_pct === 100 ? '#10B981' : 'linear-gradient(90deg,#B8652F,#D97C44)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#6b6b6b', fontFamily: 'monospace', fontWeight: 600 }}>{student.completion_pct}%</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <ViewDetailsButton onClick={() => onView(student)} label="View" />
        {!student.is_approved && (
          <motion.button whileTap={{ scale: 0.95 }} disabled={actionLoading} onClick={() => onApprove(student.id)}
            style={{ flex: 1, padding: '7px 10px', fontSize: '12px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Approve
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StudentManagement() {
  const [students,         setStudents]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [filter,           setFilter]           = useState('all');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selected,         setSelected]         = useState(null);
  const [toast,            setToast]            = useState(null);
  const [page,             setPage]             = useState(1);
  const [totalCount,       setTotalCount]       = useState(0);
  const PAGE_SIZE = 20;

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'pending')  params.set('is_approved', 'false');
      if (filter === 'active')   params.set('is_approved', 'true');
      if (filter === 'inactive') params.set('is_active', 'false');
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page);
      params.set('page_size', PAGE_SIZE);

      const res  = await api.get(`${endpoints.dashboard.students}?${params.toString()}`);
      const data = res.data;
      if (Array.isArray(data)) { setStudents(data); setTotalCount(data.length); }
      else { setStudents(data.results ?? []); setTotalCount(data.count ?? 0); }
    } catch {
      showToast('Failed to load students.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 350); return () => clearTimeout(t); }, [searchQuery]);

  const handleAction = async (action, student) => {
    if (action === 'approve') { await handleApprove(student.id); setSelected(null); }
  };

  const handleApprove = async (studentId) => {
    setActionLoading(true);
    try {
      await api.patch(endpoints.dashboard.student(studentId), { is_approved: true });
      if (filter === 'pending') setStudents((prev) => prev.filter((s) => s.id !== studentId));
      else setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, is_approved: true } : s));
      setSelected((prev) => prev?.id === studentId ? { ...prev, is_approved: true } : prev);
      showToast('Student approved.', 'success');
    } catch {
      showToast('Failed to approve student.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    setActionLoading(true);
    try {
      await Promise.all(selectedStudents.map((id) =>
        api.patch(endpoints.dashboard.student(id), { is_approved: true })
      ));
      if (filter === 'pending') setStudents((prev) => prev.filter((s) => !selectedStudents.includes(s.id)));
      else setStudents((prev) => prev.map((s) => selectedStudents.includes(s.id) ? { ...s, is_approved: true } : s));
      showToast(`${selectedStudents.length} student(s) approved.`, 'success');
      setSelectedStudents([]);
    } catch {
      showToast('Bulk approve partially failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id) => setSelectedStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  const toggleAll    = () => setSelectedStudents(selectedStudents.length === students.length && students.length > 0 ? [] : students.map((s) => s.id));
  const totalPages   = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* Layout switching */
        .sm-table-wrap { display: block; }
        .sm-cards-wrap { display: none;  }

        @media (max-width: 640px) {
          .sm-table-wrap  { display: none  !important; }
          .sm-cards-wrap  { display: flex  !important; flex-direction: column; gap: 10px; }
          .sm-toolbar     { flex-direction: column !important; }
          .sm-filter-row  { display: flex; gap: 8px; }
          .sm-filter-row select { flex: 1; }
          .sm-count-pill  { display: none !important; }
          .sm-pagination  { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
          .sm-pagination > span { text-align: center; }
          .sm-pagination > div  { justify-content: center !important; }
          .sm-bulk-bar    { flex-direction: column !important; gap: 10px !important; }
          .sm-bulk-bar > div { width: 100%; }
          .sm-bulk-bar button { flex: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Geist', sans-serif" }}>

        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </AnimatePresence>

        {/* ── Toolbar ── */}
        <div className="sm-toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9b9b9b' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search by name or email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 14px 9px 36px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#B8652F'}
              onBlur={(e)  => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
          </div>

          {/* Filter + count */}
          <div className="sm-filter-row" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              style={{ padding: '9px 14px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="all">All Students</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>

            {!loading && (
              <div className="sm-count-pill" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', fontSize: '12px', color: '#9b9b9b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {totalCount} student{totalCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop table ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}
          className="sm-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#FAFAF8' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                    <input type="checkbox" checked={selectedStudents.length === students.length && students.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                  </th>
                  {['Student', 'Email', 'Course', 'Progress', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9b9b9b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9b9b9b', fontSize: '13px' }}>No students match your filters.</td></tr>
                ) : students.map((student, idx) => {
                  const isSelected = selectedStudents.includes(student.id);
                  const initials   = (student.full_name || '??').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <motion.tr key={student.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: isSelected ? 'rgba(184,101,47,0.04)' : 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(184,101,47,0.04)' : 'transparent'; }}>
                      <td style={{ padding: '13px 20px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(student.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }} onClick={() => setSelected(student)}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(184,101,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#B8652F', flexShrink: 0 }}>{initials}</div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{student.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '12px', color: '#6b6b6b' }}>{student.email}</td>
                      <td style={{ padding: '13px 20px', fontSize: '12px', color: '#6b6b6b', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.enrolled_course ?? '—'}</td>
                      <td style={{ padding: '13px 20px' }}>
                        {student.completion_pct != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', background: 'rgba(0,0,0,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${student.completion_pct}%` }} transition={{ delay: idx * 0.03 + 0.2, duration: 0.5, ease: 'easeOut' }}
                                style={{ height: '100%', background: student.completion_pct === 100 ? '#10B981' : 'linear-gradient(90deg,#B8652F,#D97C44)', borderRadius: '99px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b6b6b', fontFamily: 'monospace', minWidth: '28px' }}>{student.completion_pct}%</span>
                          </div>
                        ) : <span style={{ fontSize: '12px', color: '#9b9b9b' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: student.is_approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: student.is_approved ? '#059669' : '#D97706' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                          {student.is_approved ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <ViewDetailsButton onClick={() => setSelected(student)} />
                          {!student.is_approved && (
                            <button disabled={actionLoading} onClick={() => handleApprove(student.id)}
                              style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="sm-pagination" style={{ padding: '12px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#9b9b9b' }}>Page {page} of {totalPages} · {totalCount} total</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', background: page <= 1 ? '#f5f5f5' : '#fff', color: page <= 1 ? '#ccc' : '#1a1a1a', fontSize: '12px', fontWeight: 500, cursor: page <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', background: page >= totalPages ? '#f5f5f5' : '#fff', color: page >= totalPages ? '#ccc' : '#1a1a1a', fontSize: '12px', fontWeight: 500, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Mobile cards ── */}
        <div className="sm-cards-wrap" style={{ display: 'none' }}>
          {/* Mobile count + select-all bar */}
          {!loading && students.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px' }}>
              <span style={{ fontSize: '12px', color: '#9b9b9b', fontFamily: 'monospace' }}>
                {totalCount} student{totalCount !== 1 ? 's' : ''}
              </span>
              <button onClick={toggleAll}
                style={{ fontSize: '12px', fontWeight: 600, color: selectedStudents.length === students.length ? '#B8652F' : '#9b9b9b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                {selectedStudents.length === students.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          )}

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : students.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9b9b9b', fontSize: '13px' }}>No students match your filters.</div>
          ) : students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onToggleSelect={toggleSelect}
              onView={setSelected}
              onApprove={handleApprove}
              actionLoading={actionLoading}
            />
          ))}

          {/* Mobile pagination */}
          {totalPages > 1 && !loading && (
            <div className="sm-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '4px 0' }}>
              <span style={{ fontSize: '12px', color: '#9b9b9b', textAlign: 'center', flex: 1 }}>Page {page} of {totalPages}</span>
              <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: page <= 1 ? '#f5f5f5' : '#fff', color: page <= 1 ? '#ccc' : '#1a1a1a', fontSize: '13px', fontWeight: 500, cursor: page <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: page >= totalPages ? '#f5f5f5' : '#fff', color: page >= totalPages ? '#ccc' : '#1a1a1a', fontSize: '13px', fontWeight: 500, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Bulk actions bar ── */}
        <AnimatePresence>
          {selectedStudents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="sm-bulk-bar"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={actionLoading} onClick={handleBulkApprove}
                  style={{ flex: 1, padding: '8px 14px', fontSize: '13px', fontWeight: 600, background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? 'Approving…' : 'Approve All'}
                </button>
                <button onClick={() => setSelectedStudents([])}
                  style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 500, background: 'rgba(0,0,0,0.05)', color: '#6b6b6b', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── AdminDetailModal ── */}
      <AnimatePresence>
        {selected && (
          <AdminDetailModal
            type="student"
            data={selected}
            onClose={() => setSelected(null)}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}