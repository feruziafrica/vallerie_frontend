import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const spring = { type: 'spring', stiffness: 300, damping: 28 };

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extract YouTube video ID from the server-generated embed URL
// e.g. "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&..."  →  "dQw4w9WgXcQ"
// Used only to get the YouTube-hosted thumbnail — the raw ID is never stored
// in state or exposed elsewhere.
function getYouTubeThumbnail(embedUrl) {
  if (!embedUrl) return null;
  const match = embedUrl.match(/embed\/([^?]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating = 0, reviewCount = 0, size = 'sm' }) {
  const filled  = Math.floor(rating);
  const partial = rating % 1;
  const starSize = size === 'lg' ? '13px' : '10px';
  const numSize  = size === 'lg' ? '14px' : '11px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: numSize, fontWeight: '800', color: '#d97706' }}>
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
      <div style={{ display: 'flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = i <= filled ? 1 : i === filled + 1 ? partial : 0;
          return (
            <span key={i} style={{ fontSize: starSize, position: 'relative', display: 'inline-block' }}>
              <span style={{ color: '#d6d3d1' }}>★</span>
              {fill > 0 && (
                <span style={{
                  position: 'absolute', left: 0, top: 0,
                  width: `${fill * 100}%`, overflow: 'hidden', color: '#f59e0b',
                }}>★</span>
              )}
            </span>
          );
        })}
      </div>
      {reviewCount > 0 && (
        <span style={{ fontSize: size === 'lg' ? '11px' : '10px', color: '#a8a29e' }}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// ── YouTube Preview Player ─────────────────────────────────────────────────────
// `previewEmbedUrl` is the domain-locked embed URL built by the serializer.
// The raw YouTube video ID never lives in this component — only the embed URL.
// We extract the video ID solely to fetch YouTube's hosted thumbnail image.
function YouTubePreviewPlayer({ previewEmbedUrl, title }) {
  const [playing,   setPlaying]   = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const thumbnailUrl = getYouTubeThumbnail(previewEmbedUrl);

  // ── No video configured ──────────────────────────────────────────────────
  if (!previewEmbedUrl) {
    return (
      <div style={{ paddingTop: '56.25%', position: 'relative', background: '#111' }}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(217,119,6,0.12)',
            border: '1.5px solid rgba(217,119,6,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill="rgba(217,119,6,0.6)" />
            </svg>
          </div>
          <p style={{ color: '#57534e', fontSize: '11px', margin: 0, fontWeight: '500' }}>
            No preview available
          </p>
        </div>
      </div>
    );
  }

  // ── Click-to-play thumbnail state ────────────────────────────────────────
  if (!playing) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Play preview for ${title}`}
        onClick={() => setPlaying(true)}
        onKeyDown={(e) => e.key === 'Enter' && setPlaying(true)}
        style={{
          position: 'relative', paddingTop: '56.25%',
          cursor: 'pointer', overflow: 'hidden',
          background: '#0d0d0d',
        }}
      >
        {/* YouTube maxresdefault thumbnail */}
        {thumbnailUrl && !thumbError && (
          <motion.img
            src={thumbnailUrl}
            alt={`${title} preview`}
            onError={() => setThumbError(true)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay — darker at bottom for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
        }} />

        {/* Play button — enterprise style, not a basic circle */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.96)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 28px rgba(0,0,0,0.45)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1c1917">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </motion.div>
        </div>

        {/* Course preview badge — bottom left */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '999px', padding: '3px 10px',
          display: 'flex', alignItems: 'center', gap: '5px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{
            fontSize: '9px', fontWeight: '700', color: 'white',
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            Course Preview
          </span>
        </div>
      </div>
    );
  }

  // ── Playing — YouTube iframe ─────────────────────────────────────────────
  // The player chrome bar matches CourseLearning for a consistent look
  return (
    <div style={{ background: '#0d0d0d' }}>
      {/* macOS-style chrome bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color, i) => (
            <div key={i} style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: color, opacity: 0.7,
            }} />
          ))}
        </div>
        <p style={{
          margin: 0, fontSize: '11px', fontWeight: '500',
          color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          maxWidth: '60%',
        }}>
          {title}
        </p>
        <button
          onClick={() => setPlaying(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '0 2px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* iframe */}
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <iframe
          src={previewEmbedUrl}
          title={title}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            border: 'none', display: 'block',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

YouTubePreviewPlayer.propTypes = {
  previewEmbedUrl: PropTypes.string,
  title:           PropTypes.string.isRequired,
};

// ── Course Preview Modal ──────────────────────────────────────────────────────
function CoursePreviewModal({ course, onClose, onEnrol, isSelected }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const hasDiscount       = course.discount_percent > 0;
  const discountedPriceKes = hasDiscount
    ? Math.round(course.price_kes * (1 - course.discount_percent / 100))
    : null;
  const discountedPriceUsd = hasDiscount && course.price_usd
    ? Math.round(course.price_usd * (1 - course.discount_percent / 100))
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(12,10,9,0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '0' : '16px',
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: isMobile ? 1 : 0.94, y: isMobile ? '100%' : 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: isMobile ? 1 : 0.94, y: isMobile ? '100%' : 24 }}
          transition={spring}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: isMobile ? '22px 22px 0 0' : '20px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '900px',
            maxHeight: isMobile ? '92vh' : '90vh',
            overflow: 'hidden',
            // Refined enterprise shadow — not overdone
            boxShadow: '0 8px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
            ...(isMobile ? { position: 'fixed', bottom: 0, left: 0, right: 0 } : {}),
          }}
        >
          {/* Mobile handle */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#e7e5e4' }} />
            </div>
          )}

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '8px 16px 12px' : '14px 20px',
            borderBottom: '1px solid #f5f5f4',
            background: 'linear-gradient(110deg, #fffbeb 0%, #fff 60%)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <span style={{
                flexShrink: 0, fontSize: '9px', fontWeight: '800',
                letterSpacing: '0.1em', color: '#92400e', background: '#fef3c7',
                padding: '3px 9px', borderRadius: '999px', textTransform: 'uppercase',
              }}>
                Preview
              </span>
              {hasDiscount && (
                <span style={{
                  flexShrink: 0, fontSize: '9px', fontWeight: '800',
                  letterSpacing: '0.1em', color: '#fff', background: '#ef4444',
                  padding: '3px 9px', borderRadius: '999px', textTransform: 'uppercase',
                }}>
                  {course.discount_percent}% OFF
                </span>
              )}
              <span style={{
                fontSize: '12px', fontWeight: '700', color: '#1c1917',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {course.name}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0, width: '28px', height: '28px',
                borderRadius: '50%', background: '#f5f5f4',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: '#78716c', marginLeft: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e7e5e4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f4'; }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: isMobile ? 'column' : undefined,
            gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
            flex: 1, minHeight: 0,
            overflowY: isMobile ? 'auto' : 'hidden',
          }}>

            {/* Left — YouTube preview + stats */}
            <div style={{ background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {/*
                Uses course.preview_embed_url — built server-side by CourseListSerializer.
                The embed URL is domain-locked to your domain. No raw YouTube ID in props.
              */}
              <YouTubePreviewPlayer
                previewEmbedUrl={course.preview_embed_url}
                title={course.name}
              />

              {/* Stats */}
              <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px' }}>
                {[
                  { icon: '📚', value: course.modules_count, label: 'Modules'  },
                  { icon: '🎯', value: course.lessons_count, label: 'Lessons'  },
                  { icon: '⏱',  value: course.duration,      label: 'Duration' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '10px', padding: '9px 6px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: '13px', marginBottom: '3px' }}>{s.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontSize: '9px', color: '#78716c', marginTop: '3px',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features list — desktop only */}
              {!isMobile && course.features?.length > 0 && (
                <div style={{ padding: '0 12px 14px' }}>
                  <p style={{
                    fontSize: '9px', fontWeight: '700', color: '#57534e',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
                  }}>
                    What's inside
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {course.features.slice(0, 5).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>✦</span>
                        <span style={{ fontSize: '11px', color: '#a8a29e', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — detail + CTA */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              ...(isMobile ? {} : { minHeight: 0 }),
              background: '#fff',
            }}>
              <div style={{
                flex: 1,
                overflowY: isMobile ? 'visible' : 'auto',
                padding: isMobile ? '16px 16px 0' : '22px 22px 0',
              }}>
                <h2 style={{
                  fontSize: isMobile ? '17px' : '19px',
                  fontWeight: '900', color: '#1c1917',
                  marginBottom: '7px', lineHeight: 1.2, letterSpacing: '-0.02em',
                }}>
                  {course.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#78716c', marginBottom: '12px', lineHeight: 1.65 }}>
                  {course.tagline}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <StarRating rating={course.rating} reviewCount={course.review_count} size="lg" />
                </div>

                {/* Features — mobile only */}
                {isMobile && course.features?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '9px', fontWeight: '700', color: '#78716c',
                      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
                    }}>
                      What's inside
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {course.features.slice(0, 5).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                          <span style={{ color: '#d97706', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>✦</span>
                          <span style={{ fontSize: '12px', color: '#44403c', lineHeight: 1.45 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price card */}
                <div style={{
                  background: hasDiscount
                    ? 'linear-gradient(135deg, #fff1f2, #fef2f2)'
                    : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  borderRadius: '14px', padding: '14px 16px',
                  border: `1px solid ${hasDiscount ? '#fecaca' : '#fde68a'}`,
                  marginBottom: '16px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '6px',
                  }}>
                    <p style={{
                      fontSize: '9px', margin: 0, fontWeight: '800',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: hasDiscount ? '#991b1b' : '#92400e',
                    }}>
                      {hasDiscount
                        ? `🔥 Limited Time — ${course.discount_percent}% Off`
                        : 'Enrolment Fee'}
                    </p>
                    {hasDiscount && course.discount_label && (
                      <span style={{
                        fontSize: '9px', fontWeight: '700',
                        color: '#dc2626', background: '#fee2e2',
                        padding: '2px 8px', borderRadius: '999px',
                      }}>
                        {course.discount_label}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    {hasDiscount ? (
                      <>
                        <span style={{
                          fontSize: isMobile ? '24px' : '27px',
                          fontWeight: '900', color: '#dc2626', letterSpacing: '-0.02em',
                        }}>
                          KES {discountedPriceKes.toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: '700',
                          color: '#a8a29e', textDecoration: 'line-through',
                        }}>
                          KES {Number(course.price_kes).toLocaleString()}
                        </span>
                        {discountedPriceUsd && (
                          <span style={{ fontSize: '12px', color: '#a8a29e' }}>
                            / ${discountedPriceUsd}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span style={{
                          fontSize: isMobile ? '24px' : '27px',
                          fontWeight: '900', color: '#d97706', letterSpacing: '-0.02em',
                        }}>
                          KES {Number(course.price_kes).toLocaleString()}
                        </span>
                        {course.price_usd && (
                          <span style={{ fontSize: '12px', color: '#a8a29e' }}>
                            / ${course.price_usd}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                    {['One-time', 'Lifetime access', 'Email credentials'].map((t) => (
                      <span key={t} style={{
                        fontSize: '10px',
                        color: hasDiscount ? '#991b1b' : '#92400e',
                        display: 'flex', alignItems: 'center', gap: '3px',
                      }}>
                        <span style={{ color: hasDiscount ? '#dc2626' : '#d97706' }}>✓</span> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{
                padding: isMobile ? '14px 16px 20px' : '14px 22px',
                borderTop: '1px solid #f5f5f4',
                background: '#fff', flexShrink: 0,
              }}>
                <motion.button
                  whileHover={{ scale: 1.018 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => { onEnrol(course); onClose(); }}
                  style={{
                    width: '100%', padding: '13px',
                    background: isSelected
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : hasDiscount
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                        : 'linear-gradient(135deg, #d97706, #b45309)',
                    color: 'white', fontWeight: '800', fontSize: '14px',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 18px rgba(22,163,74,0.32)'
                      : hasDiscount
                        ? '0 4px 18px rgba(220,38,38,0.32)'
                        : '0 4px 18px rgba(217,119,6,0.32)',
                    letterSpacing: '0.01em', fontFamily: 'inherit',
                    transition: 'all 0.18s',
                  }}
                >
                  {isSelected
                    ? '✓ Selected — Continue to Enrolment'
                    : hasDiscount
                      ? `🔥 Claim ${course.discount_percent}% Off → Enrol Now`
                      : 'Enrol Now → Get Instant Access'}
                </motion.button>
                <p style={{
                  textAlign: 'center', fontSize: '10px',
                  color: '#a8a29e', marginTop: '9px', marginBottom: 0,
                }}>
                  🔒 Secure · Access within 24hrs · Credentials by email
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function CourseOptionCard({ course, isSelected, onSelect, onEnrol }) {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [imgHovered,  setImgHovered]  = useState(false);

  // Card thumbnail — use uploaded thumbnail from VPS if set, fallback to placeholder
  const thumbnail = course.thumbnail_url || `https://picsum.photos/seed/${course.id}/640/360`;

  const hasDiscount        = course.discount_percent > 0;
  const discountedPriceKes = hasDiscount
    ? Math.round(course.price_kes * (1 - course.discount_percent / 100))
    : null;

  return (
    <>
      <motion.div
        onClick={() => setModalOpen(true)}
        whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.13)' }}
        whileTap={{ scale: 0.982 }}
        style={{
          borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
          border: isSelected ? '2px solid #d97706' : '2px solid #e7e5e4',
          background: '#fff',
          boxShadow: isSelected
            ? '0 6px 28px rgba(217,119,6,0.18)'
            : '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'border 0.2s, box-shadow 0.2s',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div style={{
          height: '3px',
          background: isSelected
            ? 'linear-gradient(to right, #b45309, #d97706, #f59e0b)'
            : hasDiscount
              ? 'linear-gradient(to right, #dc2626, #ef4444)'
              : 'linear-gradient(to right, #e7e5e4, #d6d3d1)',
          transition: 'background 0.3s',
        }} />

        {/* Thumbnail */}
        <div
          style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
        >
          <motion.img
            src={thumbnail}
            alt={course.name}
            animate={{ scale: imgHovered ? 1.06 : 1 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 55%)',
          }} />

          {/* Badges */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            display: 'flex', gap: '5px', flexWrap: 'wrap',
          }}>
            {course.is_bestseller && (
              <span style={{
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.06em',
                background: '#d97706', color: 'white',
                padding: '3px 9px', borderRadius: '999px', textTransform: 'uppercase',
              }}>
                Bestseller
              </span>
            )}
            {hasDiscount && (
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{
                  fontSize: '9px', fontWeight: '800', letterSpacing: '0.06em',
                  background: '#ef4444', color: 'white',
                  padding: '3px 9px', borderRadius: '999px', textTransform: 'uppercase',
                }}
              >
                {course.discount_percent}% OFF
              </motion.span>
            )}
          </div>

          {/* Play overlay */}
          <motion.div
            animate={{ opacity: imgHovered ? 1 : 0, scale: imgHovered ? 1 : 0.78 }}
            transition={{ duration: 0.16 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.94)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(0,0,0,0.28)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1917">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </motion.div>

          {/* Duration pill */}
          <span style={{
            position: 'absolute', bottom: '10px', right: '10px',
            fontSize: '9px', fontWeight: '700',
            background: 'rgba(0,0,0,0.7)', color: 'white',
            padding: '3px 9px', borderRadius: '999px',
            backdropFilter: 'blur(4px)',
          }}>
            {course.duration}
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: '15px' }}>
          <h4 style={{
            fontSize: '13px', fontWeight: '800', color: '#1c1917',
            marginBottom: '4px', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.name}
          </h4>
          <p style={{
            fontSize: '11px', color: '#78716c', marginBottom: '9px', lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.tagline}
          </p>

          <div style={{ marginBottom: '9px' }}>
            <StarRating rating={course.rating} reviewCount={course.review_count} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '11px' }}>
            {[
              { icon: '📚', value: `${course.modules_count} modules`  },
              { icon: '🎯', value: `${course.lessons_count} lessons` },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px' }}>{s.icon}</span>
                <span style={{ fontSize: '10px', color: '#78716c' }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: '#f5f5f4', marginBottom: '11px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Price */}
            <div>
              {hasDiscount ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{
                    fontSize: '15px', fontWeight: '900',
                    color: '#dc2626', letterSpacing: '-0.02em',
                  }}>
                    KES {discountedPriceKes.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '10px', color: '#a8a29e', textDecoration: 'line-through' }}>
                    {Number(course.price_kes).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{
                    fontSize: '15px', fontWeight: '900',
                    color: '#1c1917', letterSpacing: '-0.02em',
                  }}>
                    KES {Number(course.price_kes).toLocaleString()}
                  </span>
                  {course.price_usd && (
                    <span style={{ fontSize: '10px', color: '#a8a29e', marginLeft: '4px' }}>
                      / ${course.price_usd}
                    </span>
                  )}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={(e) => { e.stopPropagation(); onSelect(course); }}
              style={{
                padding: '7px 15px',
                background: isSelected
                  ? 'linear-gradient(135deg, #16a34a, #15803d)'
                  : hasDiscount
                    ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                    : 'linear-gradient(135deg, #d97706, #b45309)',
                color: 'white', fontSize: '11px', fontWeight: '800',
                borderRadius: '999px', border: 'none', cursor: 'pointer',
                boxShadow: isSelected
                  ? '0 2px 10px rgba(22,163,74,0.28)'
                  : '0 2px 10px rgba(217,119,6,0.28)',
                fontFamily: 'inherit', transition: 'all 0.18s',
              }}
            >
              {isSelected ? '✓ Selected' : 'Select →'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {modalOpen && (
        <CoursePreviewModal
          course={course}
          onClose={() => setModalOpen(false)}
          onEnrol={(c) => { onSelect(c); if (onEnrol) onEnrol(c); }}
          isSelected={isSelected}
        />
      )}
    </>
  );
}

CourseOptionCard.propTypes = {
  course: PropTypes.shape({
    id:             PropTypes.number.isRequired,
    name:           PropTypes.string.isRequired,
    tagline:        PropTypes.string.isRequired,
    duration:       PropTypes.string.isRequired,
    modules_count:  PropTypes.number.isRequired,
    lessons_count:  PropTypes.number.isRequired,
    price_kes:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price_usd:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    thumbnail_url:  PropTypes.string,
    // ── YouTube (replaces preview_bunny_video_id) ──────────────────────────
    preview_embed_url: PropTypes.string,   // built server-side by CourseListSerializer
    // ── Social proof ──────────────────────────────────────────────────────
    rating:          PropTypes.number,
    review_count:    PropTypes.number,
    is_bestseller:   PropTypes.bool,
    // ── Promotions ─────────────────────────────────────────────────────────
    discount_percent: PropTypes.number,
    discount_label:   PropTypes.string,
    features:         PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect:   PropTypes.func.isRequired,
  onEnrol:    PropTypes.func,
};

CourseOptionCard.defaultProps = {
  onEnrol: null,
};