import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #d97706, #b45309)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: '800', color: '#fff',
      flexShrink: 0, letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
}

// ── Category Pill ─────────────────────────────────────────────────────────────
function CategoryPill({ category }) {
  if (!category) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 14px',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '800',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: category.color || '#92400e',
      background: `${category.color || '#d97706'}14`,
      border: `1px solid ${category.color || '#d97706'}28`,
    }}>
      {category.name}
    </span>
  );
}

// ── Tag Chip ──────────────────────────────────────────────────────────────────
function TagChip({ tag }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: '600', color: '#a8a29e',
      background: '#f5f5f4', border: '1px solid #e7e5e4',
      padding: '3px 10px', borderRadius: '8px',
    }}>
      #{tag}
    </span>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function OrnamentalDivider() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      margin: '0 auto', maxWidth: '200px',
    }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d6d3d1)' }} />
      <span style={{ fontSize: '11px', color: '#d97706', opacity: 0.7 }}>✦</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #d6d3d1)' }} />
    </div>
  );
}

// ── Content Renderer ──────────────────────────────────────────────────────────
function ContentRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentParagraph = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      return;
    }

    if (trimmed.startsWith('## ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <h2 key={`h2-${idx}`} style={{
          fontSize: '22px', fontWeight: '700', color: '#1c1917',
          marginTop: '32px', marginBottom: '16px',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '-0.02em',
        }}>
          {trimmed.replace('## ', '')}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <h1 key={`h1-${idx}`} style={{
          fontSize: '28px', fontWeight: '800', color: '#1c1917',
          marginTop: '40px', marginBottom: '20px',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '-0.03em',
        }}>
          {trimmed.replace('# ', '')}
        </h1>
      );
    } else if (trimmed.startsWith('> ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <blockquote key={`bq-${idx}`} style={{
          borderLeft: '4px solid #d97706', paddingLeft: '16px',
          marginLeft: 0, marginRight: 0, marginBottom: '20px',
          marginTop: '20px',
          fontStyle: 'italic', color: '#78716c', fontSize: '15px',
          lineHeight: 1.75,
        }}>
          {trimmed.replace('> ', '')}
        </blockquote>
      );
    } else if (trimmed.startsWith('- ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <li key={`li-${idx}`} style={{
          fontSize: '15px', lineHeight: 1.75, color: '#44403c',
          marginLeft: '20px', marginBottom: '8px',
        }}>
          {trimmed.replace('- ', '')}
        </li>
      );
    } else if (trimmed.startsWith('`')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{
            fontSize: '15px', lineHeight: 1.75, color: '#44403c',
            marginBottom: '20px', margin: '0 0 20px 0',
          }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <pre key={`code-${idx}`} style={{
          background: '#f5f5f4', padding: '14px', borderRadius: '8px',
          overflow: 'auto', marginBottom: '20px', fontSize: '13px',
          color: '#44403c', lineHeight: 1.6, border: '1px solid #e7e5e4',
        }}>
          <code>{trimmed.replace(/`/g, '')}</code>
        </pre>
      );
    } else {
      currentParagraph.push(trimmed);
    }
  });

  if (currentParagraph.length > 0) {
    elements.push(
      <p key={`p-final`} style={{
        fontSize: '15px', lineHeight: 1.75, color: '#44403c',
        marginBottom: '20px', margin: '0 0 20px 0',
      }}>
        {currentParagraph.join(' ')}
      </p>
    );
  }

  return <>{elements}</>;
}

// ── Post Row ──────────────────────────────────────────────────────────────────
function PostRow({ post, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: '880px', margin: '0 auto', padding: '48px 24px',
          borderBottom: !isLast ? '1px solid #ece8e3' : 'none',
          cursor: expanded ? 'default' : 'pointer',
        }}
      >
        {/* Header */}
        <div onClick={() => !expanded && setExpanded(true)}>
          {/* Category + Issue */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {post.category && <CategoryPill category={post.category} />}
            <span style={{
              fontSize: '10px', color: '#c4b5a0',
              fontWeight: '600', letterSpacing: '0.06em',
            }}>
              No. {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Title */}
          <motion.h2
            animate={{ x: hovered && !expanded ? -3 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: '900',
              color: '#1c1917',
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {post.title}
          </motion.h2>

          {/* Excerpt */}
          {!expanded && (
            <p style={{
              fontSize: '15px',
              color: '#78716c',
              lineHeight: 1.75,
              marginBottom: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {post.excerpt}
            </p>
          )}

          {/* Meta + CTA */}
          {!expanded && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #f5f5f4',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar initials={post.author_initials} size={32} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#1c1917', margin: 0 }}>
                    {post.author_name}
                  </p>
                  <p style={{ fontSize: '10px', color: '#a8a29e', margin: 0 }}>
                    {formatDate(post.published_at)}
                  </p>
                </div>
              </div>

              <motion.div
                animate={{
                  x: hovered ? 6 : 0,
                  opacity: hovered ? 1 : 0.6,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '11px', fontWeight: '800',
                  color: '#d97706',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Read article
                <span style={{ fontSize: '14px' }}>→</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: '32px' }}
            >
              {/* Full Content */}
              <div style={{ marginBottom: '40px' }}>
                <ContentRenderer content={post.content} />
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div style={{
                  marginBottom: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f5f5f4',
                }}>
                  <p style={{ fontSize: '12px', color: '#a8a29e', marginBottom: '12px', fontWeight: '600' }}>
                    TAGS
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {post.tags.map((tag, i) => (
                      <TagChip key={i} tag={tag} />
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div style={{
                background: '#faf9f7', padding: '24px', borderRadius: '12px',
                marginBottom: '24px', border: '1px solid #ece8e3',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <Avatar initials={post.author_initials} size={48} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1c1917', margin: 0 }}>
                      {post.author_name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>
                      Published {formatDate(post.published_at)}
                    </p>
                  </div>
                </div>
                {post.read_time_minutes > 0 && (
                  <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>
                    {post.read_time_minutes} min read
                  </p>
                )}
              </div>

              {/* Close Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setExpanded(false)}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  color: '#d97706', border: '1.5px solid #d97706',
                  borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#d97706';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#d97706';
                }}
              >
                Show Less
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow({ index }) {
  return (
    <div style={{
      maxWidth: '880px', margin: '0 auto', padding: '48px 24px',
      borderBottom: index < 2 ? '1px solid #ece8e3' : 'none',
    }}>
      {[['60%', '12px'], ['90%', '32px'], ['75%', '32px'], ['100%', '15px'], ['85%', '15px']].map(([w, h], i) => (
        <div key={i} style={{
          width: w, height: h, borderRadius: '6px',
          background: 'linear-gradient(90deg, #f5f5f4 25%, #ede9e4 50%, #f5f5f4 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s infinite',
          marginBottom: '14px',
        }} />
      ))}
    </div>
  );
}

// ── Category Bar ──────────────────────────────────────────────────────────────
function CategoryBar({ categories, activeCategory, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: '8px', flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      {[{ id: '', name: 'All', slug: '', color: '#d97706' }, ...categories].map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <motion.button
            key={cat.id || 'all'}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(cat.slug === activeCategory && cat.slug !== '' ? '' : cat.slug)}
            style={{
              padding: '8px 16px', borderRadius: '999px', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer', border: '1.5px solid',
              borderColor: isActive ? (cat.color || '#d97706') : '#e7e5e4',
              background: isActive ? `${cat.color || '#d97706'}12` : 'transparent',
              color: isActive ? (cat.color || '#92400e') : '#78716c',
              transition: 'all 0.15s', fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            {cat.name}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '880px', margin: '0 auto' }}
    >
      <div style={{
        width: '60px', height: '60px', borderRadius: '18px',
        background: '#fef3c7', margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px',
      }}>
        ✦
      </div>
      <p style={{
        fontSize: '20px', fontWeight: '900', color: '#1c1917',
        marginBottom: '8px',
        fontFamily: "'Playfair Display', Georgia, serif",
      }}>
        No articles found
      </p>
      <p style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '20px' }}>
        Try a different category or browse everything.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClear}
        style={{
          padding: '10px 28px',
          background: 'linear-gradient(135deg, #d97706, #b45309)',
          color: '#fff', borderRadius: '999px', border: 'none',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Show all articles
      </motion.button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const debounceRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/blog/categories/`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  // Fetch posts
  const fetchPosts = useCallback((params) => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    fetch(`${API_BASE}/blog/?${qs}`)
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : d.results || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPosts({ category: activeCategory });
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [activeCategory, fetchPosts]);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        maxWidth: '880px', margin: '0 auto', padding: '48px 24px 40px',
        borderBottom: '1px solid #ece8e3',
      }}>
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '900',
            color: '#1c1917',
            letterSpacing: '-0.03em',
            marginBottom: '32px',
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          Blog & Insights
        </motion.h1>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </motion.div>
      </header>

      {/* ── Feed ────────────────────────────────────────────────────────────── */}
      <main aria-label="Blog articles">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </>
        ) : posts.length === 0 ? (
          <EmptyState onClear={() => setActiveCategory('')} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {posts.map((post, i) => (
                <PostRow
                  key={post.id}
                  post={post}
                  index={i}
                  isLast={i === posts.length - 1}
                />
              ))}

              {/* End of feed */}
              <div style={{
                maxWidth: '880px', margin: '0 auto',
                padding: '48px 24px',
                textAlign: 'center',
                borderTop: '1px solid #ece8e3',
              }}>
                <OrnamentalDivider />
                <p style={{
                  fontSize: '12px', color: '#c4b5a0',
                  marginTop: '20px', letterSpacing: '0.06em',
                  fontWeight: '600', textTransform: 'uppercase',
                }}>
                  End of journal
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,900&display=swap');
      `}</style>
    </div>
  );
}

