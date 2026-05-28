import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Shared: Spinner ───────────────────────────────────────────────────────────
function Spinner({ label }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '14px',
      background: '#1a1a1a', zIndex: 1,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)',
        }}
      />
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

// ─── Shared: Open-in-tab fallback ─────────────────────────────────────────────
function OpenInTabFallback({ url, icon, heading, sub }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      background: '#111',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
      }}>
        {icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', margin: '0 0 6px' }}>
          {heading}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '0 0 16px' }}>
          {sub}
        </p>
        <motion.a
          href={url} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px', borderRadius: '9px',
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none', fontSize: '13px', fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          Open in new tab
        </motion.a>
      </div>
    </div>
  );
}

// ─── PdfViewer ─────────────────────────────────────────────────────────────────
export function PdfViewer({ url, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  useEffect(() => {
    let objectUrl = null;
    setLoading(true);
    setFailed(false);
    setBlobUrl(null);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setFailed(true); });

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);

  if (loading) {
    return (
      <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#1a1a1a' }}>
        <Spinner label="Loading PDF…" />
      </div>
    );
  }

  if (failed || !blobUrl) {
    return (
      <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#1a1a1a' }}>
        <OpenInTabFallback
          url={url}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          }
          heading="Preview blocked by browser"
          sub="Open the PDF directly to view it."
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#1a1a1a' }}>
      <iframe
        src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        title={title}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}

// ─── DocViewer ─────────────────────────────────────────────────────────────────
export function DocViewer({ url, title }) {
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  useEffect(() => { setLoading(true); setFailed(false); }, [url]);

  const handleLoad  = useCallback(() => setLoading(false), []);
  const handleError = useCallback(() => { setLoading(false); setFailed(true); }, []);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#1a1a1a' }}>
      {loading && !failed && <Spinner label="Loading document…" />}
      {failed ? (
        <OpenInTabFallback
          url={url}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="9"  x2="12" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          }
          heading="Preview unavailable"
          sub="Open the document directly to view it."
        />
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%', height: '100%', border: 'none', display: 'block',
            opacity: loading ? 0 : 1, transition: 'opacity 0.2s',
          }}
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      )}
    </div>
  );
}

// ─── ImageViewer ───────────────────────────────────────────────────────────────
export function ImageViewer({ url, title }) {
  const [zoom,    setZoom]    = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  useEffect(() => { setLoading(true); setFailed(false); setZoom(false); }, [url]);

  const handleLoad   = useCallback(() => setLoading(false), []);
  const handleError  = useCallback(() => { setLoading(false); setFailed(true); }, []);
  const handleToggle = useCallback(() => { if (!failed) setZoom(z => !z); }, [failed]);

  return (
    <div
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
      }}
      style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#111',
        cursor: failed ? 'default' : zoom ? 'zoom-out' : 'zoom-in',
        padding: '16px', position: 'relative',
      }}
      aria-label={`Image viewer — ${zoom ? 'zoomed in, click to zoom out' : 'click to zoom in'}`}
    >
      {loading && !failed && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: 'rgba(255,255,255,0.6)',
            position: 'absolute',
          }}
          aria-hidden="true"
        />
      )}

      {failed ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Could not load image.</p>
          <motion.a
            href={url} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            style={{
              display: 'inline-block', marginTop: '10px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', fontSize: '12px',
            }}
          >
            Open in new tab
          </motion.a>
        </div>
      ) : (
        <motion.img
          src={url}
          alt={title}
          onLoad={handleLoad}
          onError={handleError}
          animate={{ scale: zoom ? 1.9 : 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: zoom ? 'none' : '100%',
            maxHeight: zoom ? 'none' : '100%',
            objectFit: 'contain',
            borderRadius: zoom ? '0' : '8px',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.2s, border-radius 0.2s',
            userSelect: 'none',
          }}
          loading="lazy"
        />
      )}

      {!loading && !failed && (
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
          padding: '4px 9px', backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }} aria-hidden="true">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '500' }}>
            {zoom ? 'Click to zoom out' : 'Click to zoom in'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── FallbackViewer ────────────────────────────────────────────────────────────
export function FallbackViewer({ url, type }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      background: '#111',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
        No preview available for type:{' '}
        <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{type}</strong>
      </p>
      {url && (
        <motion.a
          href={url} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px', borderRadius: '9px',
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none', fontSize: '13px', fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Open in new tab
        </motion.a>
      )}
    </div>
  );
}