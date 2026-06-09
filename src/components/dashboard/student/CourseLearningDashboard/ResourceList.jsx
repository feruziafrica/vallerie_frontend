import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PdfViewer, DocViewer, ImageViewer, FallbackViewer } from './ResourceViewer';

// ─── Type Helpers ──────────────────────────────────────────────────────────────
const IMAGE_TYPES = new Set(['image', 'jpeg', 'jpg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif']);
const isImage = (type) => IMAGE_TYPES.has(type?.toLowerCase());

const getTypeColor = (type, fallback) => {
  if (type === 'pdf')                    return '#ef4444';
  if (type === 'doc' || type === 'docx') return '#2563eb';
  if (type === 'link')                   return '#3b82f6';
  if (isImage(type))                     return '#8b5cf6';
  return fallback;
};

const getActionLabel = (type) => (type === 'link' ? 'Open' : 'View');

const getTypeLabel = (type) => {
  if (type === 'pdf')                    return 'PDF Notes';
  if (type === 'doc' || type === 'docx') return 'Documents';
  if (type === 'link')                   return 'Links';
  if (isImage(type))                     return 'Images';
  return type.toUpperCase();
};

// ─── Resource Icon ─────────────────────────────────────────────────────────────
function ResourceIcon({ type, size = 14 }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round',
  };

  if (type === 'pdf') return (
    <svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  );
  if (type === 'doc' || type === 'docx') return (
    <svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="9"  x2="12" y2="9"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  );
  if (isImage(type)) return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
  // link / fallback
  return (
    <svg {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

// ─── Expand Icon ───────────────────────────────────────────────────────────────
function ExpandIcon({ expanded, size = 13 }) {
  return expanded ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}

// ─── Resource Viewer Modal ─────────────────────────────────────────────────────
function ResourceViewerModal({ resource, onClose, theme }) {
  const [downloading, setDownloading] = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  const typeColor = getTypeColor(resource.type, theme?.primary ?? '#6366f1');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (expanded) setExpanded(false);
        else onClose();
      }
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        setExpanded(x => !x);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, expanded]);

  // Download
  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res  = await fetch(resource.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob      = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link      = document.createElement('a');
      link.href        = objectUrl;
      link.download    = resource.title || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  }, [resource.url, resource.title, downloading]);

  // Viewer body
  const renderViewer = () => {
    // Detect type from URL extension as fallback
    const ext = resource.url?.split('.').pop()?.toLowerCase() || '';
    const effectiveType = resource.type === 'link' ? ext : resource.type;

    if (effectiveType === 'pdf')                               return <PdfViewer   url={resource.url} title={resource.title} />;
    if (effectiveType === 'doc' || effectiveType === 'docx')   return <DocViewer   url={resource.url} title={resource.title} />;
    if (isImage(effectiveType))                                return <ImageViewer url={resource.url} title={resource.title} />;
    return <FallbackViewer url={resource.url} type={effectiveType} />;
  };

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && !expanded) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: expanded ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.88)',
        backdropFilter: expanded ? 'none' : 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: expanded ? '0px' : '16px',
        transition: 'padding 0.3s ease, background 0.3s ease',
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Viewing ${resource.title}`}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: expanded ? 'none' : (isImage(resource.type) ? '900px' : '860px'),
          height: expanded ? '100%' : '90vh',
          borderRadius: expanded ? 0 : '16px',
          overflow: 'hidden',
          background: '#161616',
          border: expanded ? 'none' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: expanded ? 'none' : '0 8px 48px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          transition: 'border-radius 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px',
          padding: '13px 18px',
          background: '#111',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {/* Left: dots + badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }} aria-hidden="true">
              {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, opacity: 0.75 }} />
              ))}
            </div>
            <div style={{
              padding: '2px 8px', borderRadius: '5px',
              background: `${typeColor}20`,
              border: `1px solid ${typeColor}35`,
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '9px', fontWeight: '800', color: typeColor,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {resource.type}
              </span>
            </div>
            <p style={{
              margin: 0, fontSize: '13px', fontWeight: '600',
              color: 'rgba(255,255,255,0.75)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              {resource.title}
            </p>
          </div>

          {/* Right: download + expand + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Download */}
            <motion.button
              onClick={handleDownload}
              disabled={downloading}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              aria-label={downloading ? 'Downloading…' : 'Download resource'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 13px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.65)',
                fontSize: '12px', fontWeight: '600',
                cursor: downloading ? 'default' : 'pointer',
                opacity: downloading ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {downloading ? 'Downloading…' : 'Download'}
            </motion.button>

            {/* Expand / Collapse */}
            <motion.button
              onClick={() => setExpanded(x => !x)}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              aria-label={expanded ? 'Collapse to modal (F)' : 'Expand to full page (F)'}
              title={expanded ? 'Collapse  (F)' : 'Full page  (F)'}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: expanded ? `${typeColor}20` : 'rgba(255,255,255,0.06)',
                border: expanded ? `1px solid ${typeColor}40` : '1px solid rgba(255,255,255,0.08)',
                color: expanded ? typeColor : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, border 0.2s, color 0.2s',
              }}
            >
              <ExpandIcon expanded={expanded} />
            </motion.button>

            {/* Close */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              aria-label="Close resource viewer"
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '15px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Viewer body */}
        {renderViewer()}

        {/* Full-page hint */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                position: 'absolute', bottom: '18px', left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '6px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                Press{' '}
                <kbd style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '700',
                  color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace',
                }}>F</kbd>
                {' '}or{' '}
                <kbd style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '700',
                  color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace',
                }}>Esc</kbd>
                {' '}to exit full page
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Resource Row ──────────────────────────────────────────────────────────────
function ResourceRow({ resource, actionLabel, onClick, theme }) {
  const [hovered, setHovered] = useState(false);
  const typeColor = getTypeColor(resource.type, theme.primary);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  }, [onClick]);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={handleKeyDown}
      whileHover={{ x: 2 }}
      role="button"
      tabIndex={0}
      aria-label={`${resource.title} (${resource.type})`}
      style={{
        display: 'flex', alignItems: 'center',
        gap: '11px', padding: '9px 10px',
        borderRadius: '9px',
        background: hovered ? `${theme.primary}08` : 'transparent',
        color: theme.text, transition: 'background 0.12s',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: `${typeColor}12`, flexShrink: 0,
        border: `1px solid ${typeColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: typeColor,
        transition: 'transform 0.15s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }} aria-hidden="true">
        <ResourceIcon type={resource.type} />
      </div>

      <span style={{
        flex: 1, fontSize: '13px', fontWeight: '500', lineHeight: 1.4,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {resource.title}
      </span>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              fontSize: '10px', fontWeight: '700',
              color: typeColor, background: `${typeColor}12`,
              padding: '3px 8px', borderRadius: '6px',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {actionLabel}
          </motion.span>
        )}
      </AnimatePresence>

      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke={hovered ? typeColor : theme.textLight} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, transition: 'stroke 0.15s' }}
        aria-hidden="true">
        {resource.type === 'link' ? (
          <>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ─── ResourceList (default export) ────────────────────────────────────────────
export default function ResourceList({ resources, theme }) {
  // ✅ hooks always first, unconditionally
  const [error,   setError]   = useState(null);
  const [viewing, setViewing] = useState(null);

  const grouped = useMemo(() => {
    if (!Array.isArray(resources)) return {};
    return resources.reduce((acc, res) => {
      if (!res?.type) return acc;
      const t      = res.type.toLowerCase();
      const bucket = isImage(t) ? '__images__' : t;
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket].push({ ...res, type: t });
      return acc;
    }, {});
  }, [resources]);

  const handleResource = useCallback((res) => {
    setError(null);
    if (res.type === 'link') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setViewing(res);
  }, []);

  const handleCloseModal = useCallback(() => setViewing(null), []);

  // ✅ early return AFTER hooks
  if (!resources?.length) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        style={{
          borderRadius: '12px', border: `1px solid ${theme.border}`,
          overflow: 'hidden', background: theme.white,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '13px 18px', borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span style={{
            fontSize: '11px', fontWeight: '700', color: theme.text,
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            Resources
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: '10px', fontWeight: '600',
            color: theme.textLight,
            background: `${theme.primary}10`,
            padding: '2px 8px', borderRadius: '999px',
          }} aria-label={`${resources.length} ${resources.length === 1 ? 'file' : 'files'}`}>
            {resources.length} {resources.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {/* Inline error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                margin: '8px', padding: '10px 14px',
                borderRadius: '8px', background: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '10px',
                overflow: 'hidden',
              }}
              role="alert"
            >
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                aria-label="Close error message"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#dc2626', fontSize: '16px', lineHeight: 1,
                  flexShrink: 0, padding: '4px',
                }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items grouped by type */}
        <div style={{ padding: '8px' }}>
          {Object.entries(grouped).map(([bucket, items]) => {
            const displayType = bucket === '__images__' ? items[0].type : bucket;
            return (
              <div key={bucket}>
                <p style={{
                  fontSize: '10px', fontWeight: '700', color: theme.textLight,
                  textTransform: 'uppercase', letterSpacing: '0.09em',
                  padding: '6px 8px 4px', margin: 0,
                }}>
                  {bucket === '__images__' ? 'Images' : getTypeLabel(displayType)}
                </p>
                {items.map((res, i) => (
                  <ResourceRow
                    key={`${bucket}-${res.id || i}`}
                    resource={res}
                    actionLabel={getActionLabel(res.type)}
                    onClick={() => handleResource(res)}
                    theme={theme}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Viewer modal */}
      <AnimatePresence>
        {viewing && (
          <ResourceViewerModal
            resource={viewing}
            onClose={handleCloseModal}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
}