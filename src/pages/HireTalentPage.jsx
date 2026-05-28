/**
 * HireTalentPage.jsx
 * ──────────────────
 * Page-level wrapper for the Hire a Talent flow.
 * Handles SEO meta, page header, and mounts HireTalentFlow.
 * Drop this into your router as the /hire-a-talent route.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HireTalentFlow from '../components/hire/HireTalentFlow';

export default function HireTalentPage() {
  // ── SEO meta ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Hire a VA | FlowMate Brand — Vetted Virtual Assistants';

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('description',
      'Submit your hiring brief and get matched with a vetted virtual assistant within 24 hours. Flexible engagements — full-time, part-time, contract, or retainer.');
    setMeta('keywords',
      'hire virtual assistant, VA services Kenya, remote assistant, executive VA, hire talent');
    setMeta('og:title',       'Hire a VA | FlowMate Brand', true);
    setMeta('og:description', 'Get matched with a vetted VA in 24 hours.', true);
    setMeta('og:type',        'website', true);

    return () => { document.title = 'FlowMate Brand'; };
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>

      {/* ── Page hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff 100%)',
        borderBottom: '1px solid #fde68a',
        padding: '94px 24px 48px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1.5px solid #fde68a',
            borderRadius: '999px', padding: '5px 14px', marginBottom: '16px',
          }}>
            <span style={{
              fontSize: '9px', fontWeight: 800, color: '#92400e',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              ✦ Vetted Talent · 24hr Matching
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 900, color: '#1c1917',
            margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.08,
          }}>
            Find your perfect{' '}
            <span style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Virtual Assistant
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#78716c', margin: '0 auto',
            maxWidth: '520px', lineHeight: 1.65,
          }}>
            Tell us what you need. We match you with a trained, vetted VA.
            Typically within <strong style={{ color: '#1c1917' }}>24 hours</strong>.
          </p>

          {/* Trust indicators */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '20px', marginTop: '24px',
          }}>
            {[
              { icon: '🔒', text: 'Confidential brief' },
              { icon: '✦',  text: 'Pre-vetted talent only' },
              { icon: '⚡', text: 'No recruitment fee' },
            ].map(({ icon, text }) => (
              <span key={text} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: '#78716c', fontWeight: 600,
              }}>
                <span>{icon}</span>{text}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Form section ── */}
      <section
        aria-label="Hire a talent application form"
        style={{ padding: '40px 24px 80px', maxWidth: '640px', margin: '0 auto' }}
      >
        <HireTalentFlow />
      </section>

    </main>
  );
}