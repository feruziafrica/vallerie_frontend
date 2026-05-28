import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '@/components/jobs/JobCard';
import JobDetailModal from '@/components/jobs/JobDetailModal';
import ApplicationFlow from '@/components/jobs/ApplicationFlow';
import AcademyPage from './AcademyPage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'va_general', label: 'General VA' },
  { value: 'admin', label: 'Admin Support' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'data_entry', label: 'Data Entry' },
  { value: 'content', label: 'Content Creation' },
  { value: 'bookkeeping', label: 'Bookkeeping' },
  { value: 'project_mgmt', label: 'Project Mgmt' },
  { value: 'tech_support', label: 'Tech Support' },
];

const WORK_TYPES = [
  { value: '', label: 'All Locations' },
  { value: 'remote', label: '🌍 Remote' },
  { value: 'hybrid', label: '🏢 Hybrid' },
  { value: 'onsite', label: '📍 On-site' },
];

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

// ── Filter Chip ───────────────────────────────────────────────────────────────
function FilterChip({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1.5px solid ${active ? '#d97706' : '#e7e5e4'}`,
              background: active ? '#fef3c7' : '#fff',
              color: active ? '#92400e' : '#78716c',
              fontSize: '12px',
              fontWeight: active ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: '18px', border: '2px solid #f5f5f4',
      background: '#fff', padding: '20px', overflow: 'hidden',
    }}>
      {[100, 60, 80, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? '18px' : '12px',
          width: `${w}%`,
          background: '#f5f5f4',
          borderRadius: '6px',
          marginBottom: '10px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OpportunitiesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [workType, setWorkType] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // UI state
  const [selectedJob, setSelectedJob] = useState(null);   // detail modal
  const [applyingJob, setApplyingJob] = useState(null);   // application flow
  const searchDebounceRef = useRef(null);

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.category) qs.set('category', params.category);
      if (params.workType) qs.set('work_type', params.workType);
      if (params.employmentType) qs.set('employment_type', params.employmentType);

      const res = await fetch(`${API_BASE}/jobs/?${qs}`);
      if (!res.ok) throw new Error('Failed to load opportunities');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError('Could not load opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchJobs({ search, category, workType, employmentType });
    }, 320);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search, category, workType, employmentType, fetchJobs]);

  const activeFilters = [category, workType, employmentType].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1c1917 0%, #292524 60%, #1c1917 100%)',
        padding: '94px 24px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative grain */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          {/* Student badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: '20px' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '999px',
              padding: '5px 14px',
              fontSize: '11px', fontWeight: '700', color: '#fbbf24',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              ✦ FlowMate
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: '900',
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Remote Opportunities<br />
            <span style={{ color: '#f59e0b' }}>for Virtual Professionals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '15px', color: '#a8a29e',
              maxWidth: '520px', lineHeight: 1.65, marginBottom: '32px',
              margin: '0 auto 32px',
            }}
          >
            Sucessful applicants will be contacted by FlowMate team, then vetted and matched with the employers.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center',
              padding: '4px 4px 4px 18px',
              gap: '10px',
              marginBottom: '0',
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#78716c" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, skill, or keyword…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: '14px', padding: '10px 0',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearch('')}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '8px', padding: '8px 12px',
                  color: '#a8a29e', cursor: 'pointer', fontSize: '11px',
                  fontWeight: '600', fontFamily: 'inherit',
                }}
              >
                Clear
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Filter strip — overlaps hero bottom */}
        <div style={{ maxWidth: '900px', margin: '24px auto 0', paddingBottom: '0' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: '#fff',
              borderRadius: '16px 16px 0 0',
              padding: '16px 20px 0',
              borderTop: '1.5px solid #f5f5f4',
              borderLeft: '1.5px solid #f5f5f4',
              borderRight: '1.5px solid #f5f5f4',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FilterChip options={CATEGORIES} value={category} onChange={setCategory} />
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <FilterChip options={WORK_TYPES} value={workType} onChange={setWorkType} />
                <FilterChip options={EMPLOYMENT_TYPES} value={employmentType} onChange={setEmploymentType} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Results meta */}
        <div style={{
          background: '#fff',
          borderLeft: '1.5px solid #f5f5f4',
          borderRight: '1.5px solid #f5f5f4',
          borderBottom: '1.5px solid #f5f5f4',
          borderRadius: '0 0 16px 16px',
          padding: '12px 20px',
          marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '12px', color: '#a8a29e' }}>
            {loading ? 'Loading…' : `${jobs.length} opportunit${jobs.length !== 1 ? 'ies' : 'y'} found`}
            {activeFilters > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { setCategory(''); setWorkType(''); setEmploymentType(''); }}
                style={{
                  marginLeft: '10px', fontSize: '11px', color: '#d97706',
                  fontWeight: '600', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}
              >
                × Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
              </motion.button>
            )}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: '700', color: '#d97706',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ✦ Students Apply Free
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef3c7', borderRadius: '12px', padding: '14px 18px',
            border: '1px solid #fde68a', marginBottom: '20px',
          }}>
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: '#fef3c7', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
            }}>
              🔍
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#1c1917', marginBottom: '6px' }}>
              No opportunities found
            </p>
            <p style={{ fontSize: '13px', color: '#a8a29e' }}>
              Try adjusting your search or filters.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}
          >
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <JobCard
                    job={job}
                    onView={() => setSelectedJob(job)}
                    onApply={() => setApplyingJob(job)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Upsell strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '40px',
            background: 'linear-gradient(135deg, #1c1917, #292524)',
            borderRadius: '18px',
            padding: '24px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}
        >
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>
              ✦ Course students apply free to all opportunities
            </p>
            <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>
              Enrol in a FlowMate virtual assistance course and skip the application fee forever.
            </p>
          </div>
          <motion.a
            href="/academy"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', borderRadius: '10px', fontSize: '12px',
              fontWeight: '700', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(217,119,6,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            View Courses →
          </motion.a>
        </motion.div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && !applyingJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={() => { setApplyingJob(selectedJob); setSelectedJob(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyingJob && (
          <ApplicationFlow
            job={applyingJob}
            onClose={() => setApplyingJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}