import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function VideoPlayer({ lesson, theme, iframeRef }) {
  const [playerReady, setPlayerReady] = useState(false);

  const embedUrl = useMemo(() => {
    if (!lesson?.video_embed_url) return null;
    const url = lesson.video_embed_url;
    return url.includes('enablejsapi') ? url : `${url}&enablejsapi=1`;
  }, [lesson?.video_embed_url]);

  useEffect(() => {
    setPlayerReady(false);
    const t = setTimeout(() => setPlayerReady(true), 80);
    return () => clearTimeout(t);
  }, [lesson?.id]);

  return (
    <motion.div
      key={lesson?.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%', maxWidth: '760px', margin: '0 auto',
        borderRadius: '14px', overflow: 'hidden',
        background: '#0d0d0d',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative',
      }}
    >
      {/* ── Chrome bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#111111',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color, i) => (
            <div key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: color, opacity: 0.7,
            }} />
          ))}
        </div>
        <p style={{
          margin: 0, fontSize: '12px', fontWeight: '500',
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em',
          maxWidth: '60%', overflow: 'hidden',
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {lesson?.title || 'No lesson selected'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: embedUrl ? theme.primary : 'rgba(255,255,255,0.15)',
          }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: '500' }}>
            {embedUrl ? 'Ready' : 'No video'}
          </span>
        </div>
      </div>

      {/* ── Video frame ── */}
      <div style={{ aspectRatio: '16/9', position: 'relative', background: '#000' }}>
        {embedUrl && playerReady ? (
          <iframe
            ref={iframeRef}
            key={`${lesson.id}-yt`}
            src={embedUrl}
            title={lesson?.title || 'Lesson video'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : embedUrl && !playerReady ? (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <style>{`
              @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
              @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: theme.primary, animation: 'spin 0.9s linear infinite',
            }} />
          </div>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: 0, fontWeight: '500' }}>
              No video available
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}