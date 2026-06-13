import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const YT_ORIGIN = 'https://www.youtube.com';

export default function VideoPlayer({ lesson, theme, iframeRef }) {
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isYouTube = useMemo(
    () => /(youtube(-nocookie)?\.com|youtu\.be)/.test(lesson?.video_embed_url || ''),
    [lesson?.video_embed_url]
  );

  const embedUrl = useMemo(() => {
    if (!lesson?.video_embed_url) return null;
    const raw = lesson.video_embed_url;

    if (!isYouTube) return raw;

    try {
      const url = new URL(raw);
      url.searchParams.set('enablejsapi', '1');
      url.searchParams.set('modestbranding', '1');
      url.searchParams.set('rel', '0');
      url.searchParams.set('controls', '0');
      url.searchParams.set('iv_load_policy', '3');
      url.searchParams.set('playsinline', '1');
      url.searchParams.set('disablekb', '1');
      if (typeof window !== 'undefined') {
        url.searchParams.set('origin', window.location.origin);
      }
      return url.toString();
    } catch {
      return raw;
    }
  }, [lesson?.video_embed_url, isYouTube]);

  useEffect(() => {
    setPlayerReady(false);
    setIsPlaying(false);
    const t = setTimeout(() => setPlayerReady(true), 80);
    return () => clearTimeout(t);
  }, [lesson?.id]);

  // Track YouTube player state so the overlay knows whether to show
  // a play or pause affordance.
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event) => {
      if (event.origin !== YT_ORIGIN) return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data?.event === 'infoDelivery' && typeof data?.info?.playerState === 'number') {
        setIsPlaying(data.info.playerState === 1); // 1 = YT.PlayerState.PLAYING
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, lesson?.id]);

  // Once the YouTube iframe loads, register for state-change events
  // via the IFrame Player API postMessage protocol.
  const handleIframeLoad = () => {
    if (!isYouTube) return;
    const win = iframeRef?.current?.contentWindow;
    if (!win) return;
    setTimeout(() => {
      win.postMessage(JSON.stringify({ event: 'listening', id: lesson?.id }), YT_ORIGIN);
      win.postMessage(
        JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
        YT_ORIGIN
      );
    }, 250);
  };

  // Overlay intercepts every click before it reaches the iframe, so
  // YouTube's logo/title/end-card links can never navigate the user
  // away from the site. We replicate play/pause via postMessage.
  const handleOverlayClick = () => {
    const win = iframeRef?.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({ event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo', args: [] }),
      YT_ORIGIN
    );
  };

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
          <>
            <iframe
              ref={iframeRef}
              key={`${lesson.id}-${isYouTube ? 'yt' : 'bunny'}`}
              src={embedUrl}
              title={lesson?.title || 'Lesson video'}
              onLoad={handleIframeLoad}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />

            {/* Click-blocking overlay — YouTube only. Sits above the iframe
                so no click ever reaches YouTube's own DOM/links, while still
                letting users toggle play/pause through us. */}
            {isYouTube && (
              <div
                onClick={handleOverlayClick}
                role="button"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {!isPlaying && (
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 19,12 5,21" fill="#fff" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </>
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