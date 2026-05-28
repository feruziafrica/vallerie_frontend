import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

// ── Google Fonts import (injected once) ───────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('cert-fonts')) {
  const link = document.createElement('link');
  link.id = 'cert-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400&display=swap';
  document.head.appendChild(link);
}

// ── Name resolver — never falls back to email ─────────────────────────────────
function resolveStudentName(certificateData, user) {
  // 1. Explicit name on the certificate record
  // 2. Compose from first + last
  // 3. Full name from user object
  const raw =
    certificateData?.student_name?.trim() ||
    [user?.first_name, user?.last_name].filter(Boolean).map(s => s.trim()).join(' ') ||
    user?.full_name?.trim() ||
    // 4. Split email local part as last resort (never show raw email)
    (user?.email
      ? user.email.split('@')[0].replace(/[._\-]/g, ' ')
      : '');

  if (raw.trim()) {
    return raw
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  return 'Valued Graduate';
}

// ── PDF print helper ──────────────────────────────────────────────────────────
function downloadCertificate(elementId, studentName) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Certificate — ${studentName}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=Cinzel:wght@400;600;700&display=swap">
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{width:1122px;height:793px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @media print{@page{size:A4 landscape;margin:0;}body{width:100%;height:100%;}}
    </style>
  </head><body>
    ${el.outerHTML}
    <script>window.onload=()=>{window.print();window.close();}<\/script>
  </body></html>`);
  win.document.close();
}

// ── Geometric SVG ornament ────────────────────────────────────────────────────
function CornerOrnament({ flip }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
      style={{ transform: flip ? 'scale(-1,-1)' : 'none' }}>
      <path d="M4 4 L4 28 M4 4 L28 4" stroke="#B8652F" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M4 4 L4 20 M4 4 L20 4" stroke="#B8652F" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <circle cx="4" cy="4" r="3" fill="#B8652F" opacity="0.6"/>
      <path d="M36 4 Q40 8 44 4" stroke="#B8652F" strokeWidth="1" fill="none" opacity="0.3"/>
    </svg>
  );
}

// ── Medallion seal SVG ────────────────────────────────────────────────────────
function MedallionSeal({ size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      {/* Outer ring */}
      <circle cx="45" cy="45" r="42" fill="none" stroke="#B8652F" strokeWidth="1.5" opacity="0.8"/>
      <circle cx="45" cy="45" r="37" fill="none" stroke="#B8652F" strokeWidth="0.5" opacity="0.5"/>
      {/* Radial ticks */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 360) / 24;
        const r1 = 38, r2 = 42;
        const x1 = 45 + r1 * Math.cos((a * Math.PI) / 180);
        const y1 = 45 + r1 * Math.sin((a * Math.PI) / 180);
        const x2 = 45 + r2 * Math.cos((a * Math.PI) / 180);
        const y2 = 45 + r2 * Math.sin((a * Math.PI) / 180);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8652F" strokeWidth="0.8" opacity="0.6"/>;
      })}
      {/* Inner filled circle */}
      <circle cx="45" cy="45" r="30" fill="url(#sealGrad)"/>
      <defs>
        <radialGradient id="sealGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#F5EFE7"/>
          <stop offset="100%" stopColor="#DFC9AE"/>
        </radialGradient>
      </defs>
      {/* Star */}
      <text x="45" y="50" textAnchor="middle" fontSize="22" fill="#B8652F" fontFamily="Georgia">★</text>
      {/* "CERTIFIED" arc text approximation */}
      <text x="45" y="68" textAnchor="middle" fontSize="5.5"
        fill="#8B4513" fontFamily="Georgia" letterSpacing="3">CERTIFIED</text>
    </svg>
  );
}

// ── Decorative divider ────────────────────────────────────────────────────────
function OrnamentalDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto' }}>
      <div style={{ height: '1px', width: '120px', background: 'linear-gradient(to right, transparent, #B8652F)' }}/>
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path d="M10 2 L11.8 7.6 L18 7.6 L13 11 L14.8 16.6 L10 13.2 L5.2 16.6 L7 11 L2 7.6 L8.2 7.6 Z"
          fill="#B8652F" opacity="0.8"/>
      </svg>
      <div style={{ height: '1px', width: '120px', background: 'linear-gradient(to left, transparent, #B8652F)' }}/>
    </div>
  );
}

// ── Certificate Visual ────────────────────────────────────────────────────────
function CertificateVisual({ studentName, certificateId, issuedAt, courseData, brandName }) {
  const issueDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      id="certificate-print"
      style={{
        width: '100%',
        aspectRatio: '1.414 / 1',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #FDFAF6 0%, #F8F0E4 40%, #F0E4D0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4% 6%',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {/* ── Background pattern ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(184,101,47,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, rgba(184,101,47,0.06) 0%, transparent 50%)
        `,
      }}/>

      {/* ── Outer border frame ── */}
      <div style={{
        position: 'absolute', inset: '14px',
        border: '2px solid #B8652F',
        pointerEvents: 'none', zIndex: 1,
      }}/>
      {/* ── Inner border frame ── */}
      <div style={{
        position: 'absolute', inset: '22px',
        border: '0.5px solid rgba(184,101,47,0.4)',
        pointerEvents: 'none', zIndex: 1,
      }}/>
      {/* ── Thin accent line top/bottom ── */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', right: '32px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(184,101,47,0.3), transparent)', zIndex: 1 }}/>
      <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(184,101,47,0.3), transparent)', zIndex: 1 }}/>

      {/* ── Corner ornaments ── */}
      <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}><CornerOrnament /></div>
      <div style={{ position: 'absolute', top: '14px', right: '14px', transform: 'scale(-1,1)', zIndex: 2 }}><CornerOrnament /></div>
      <div style={{ position: 'absolute', bottom: '14px', left: '14px', transform: 'scale(1,-1)', zIndex: 2 }}><CornerOrnament /></div>
      <div style={{ position: 'absolute', bottom: '14px', right: '14px', transform: 'scale(-1,-1)', zIndex: 2 }}><CornerOrnament /></div>

      {/* ── Watermark large star ── */}
      <div style={{
        position: 'absolute', right: '7%', bottom: '12%', zIndex: 0,
        fontSize: '160px', color: '#B8652F', opacity: 0.025,
        fontFamily: 'Georgia', lineHeight: 1, userSelect: 'none',
      }}>★</div>

      {/* ── Content ── */}
      <div style={{ zIndex: 2, width: '100%', textAlign: 'center' }}>

        {/* Academy name */}
        <p style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 'clamp(8px, 1.1vw, 12px)',
          letterSpacing: '0.5em', color: '#8B4513',
          textTransform: 'uppercase', margin: '0 0 2% 0',
        }}>
          {brandName}
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 'clamp(18px, 3.2vw, 36px)',
          fontWeight: '400', letterSpacing: '0.12em',
          color: '#3D2B1F', margin: '0 0 1.5% 0', lineHeight: 1.2,
        }}>
          Certificate of Completion
        </h1>

        <OrnamentalDivider />

        {/* "This is to certify that" */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(9px, 1.1vw, 13px)',
          letterSpacing: '0.25em', color: '#8B6E5A',
          textTransform: 'uppercase', margin: '2% 0 1.2% 0',
        }}>
          This is to certify that
        </p>

        {/* Student name — the hero element */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(26px, 5.5vw, 60px)',
          fontWeight: '400', fontStyle: 'italic',
          color: '#B8652F', margin: '0 0 0.5% 0', lineHeight: 1.1,
          textShadow: '0 2px 20px rgba(184,101,47,0.15)',
        }}>
          {studentName}
        </h2>

        {/* Underline */}
        <div style={{
          width: '45%', height: '1px', margin: '0 auto 2% auto',
          background: 'linear-gradient(to right, transparent, #B8652F 30%, #B8652F 70%, transparent)',
        }}/>

        {/* Body copy */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(9px, 1.2vw, 14px)',
          color: '#5C3A1F', lineHeight: 1.7,
          maxWidth: '65%', margin: '0 auto 1.5% auto',
          letterSpacing: '0.03em',
        }}>
          has successfully completed all requirements of the programme
        </p>

        {/* Course name */}
        <p style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 'clamp(11px, 1.9vw, 20px)',
          fontWeight: '600', letterSpacing: '0.1em',
          color: '#3D2B1F', textTransform: 'uppercase',
          margin: '0 0 3% 0',
          padding: '1% 4%',
          display: 'inline-block',
          borderTop: '0.5px solid rgba(184,101,47,0.3)',
          borderBottom: '0.5px solid rgba(184,101,47,0.3)',
        }}>
          {courseData?.name || 'VA Fundamentals Programme'}
        </p>

        {/* ── Footer row ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', width: '85%',
          margin: '0 auto', paddingTop: '2.5%',
          borderTop: '0.5px solid rgba(184,101,47,0.25)',
        }}>
          {/* Date */}
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(9px, 1vw, 12px)', color: '#5C3A1F',
              letterSpacing: '0.05em', margin: '0 0 4px 0',
            }}>
              {issueDate}
            </p>
            <div style={{ height: '0.5px', background: '#B8652F', margin: '0 0 4px 0', opacity: 0.6 }}/>
            <p style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#8B6E5A',
              letterSpacing: '0.25em', textTransform: 'uppercase',
            }}>
              Date Issued
            </p>
          </div>

          {/* Medallion */}
          <MedallionSeal size={86} />

          {/* Certificate ID */}
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(8px, 0.9vw, 10px)', color: '#5C3A1F',
              letterSpacing: '0.08em', margin: '0 0 4px 0',
            }}>
              {certificateId || 'PENDING'}
            </p>
            <div style={{ height: '0.5px', background: '#B8652F', margin: '0 0 4px 0', opacity: 0.6 }}/>
            <p style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#8B6E5A',
              letterSpacing: '0.25em', textTransform: 'uppercase',
            }}>
              Certificate ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    issued:  { label: 'Issued',           color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',  icon: '✓' },
    pending: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '⏳' },
    locked:  { label: 'Not Yet Earned',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', icon: '🔒' },
  };
  const s = map[status] || map.locked;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '999px',
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize: '11px', fontWeight: '700', color: s.color,
    }}>
      <span>{s.icon}</span> {s.label}
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function CertificateSection({
  certificateData,
  courseData,
  user,
  loading,
  error,
  theme,
}) {

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '2px solid rgba(201,122,58,0.2)', borderTopColor: '#c97a3a',
              margin: '0 auto 14px',
            }}
          />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Loading certificate…
          </p>
        </div>
      </div>
    );
  }

  // ── Resolve name (never email) ───────────────────────────────────────────
  const studentName = resolveStudentName(certificateData, user);
  const isIssued    = certificateData?.status === 'issued';
  const isPending   = certificateData?.status === 'pending';
  const certStatus  = isIssued ? 'issued' : isPending ? 'pending' : 'locked';
  const brandName = certificateData?.brand_name || 'FlowMate Academy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}
    >

      {/* ── Certificate preview ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: isIssued
            ? '0 24px 80px rgba(184,101,47,0.25), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 16px 48px rgba(0,0,0,0.35)',
          border: isIssued
            ? '1px solid rgba(184,101,47,0.4)'
            : '1px solid rgba(255,255,255,0.07)',
          filter: isIssued ? 'none' : 'grayscale(30%) brightness(0.9)',
          transition: 'all 0.4s ease',
          position: 'relative',
        }}
      >
        {/* Locked overlay */}
        {!isIssued && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(10,8,6,0.45)',
            backdropFilter: 'blur(1px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              padding: '14px 24px', borderRadius: '12px',
              background: 'rgba(15,12,9,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '22px', marginBottom: '6px' }}>
                {isPending ? '⏳' : '🔒'}
              </p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#f5efe7', margin: '0 0 3px' }}>
                {isPending ? 'Awaiting Approval' : 'Certificate Locked'}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {isPending
                  ? 'Our team is reviewing your completion'
                  : 'Complete all lessons to unlock'}
              </p>
            </div>
          </div>
        )}

        <CertificateVisual
          studentName={studentName}
          certificateId={certificateData?.certificate_id}
          issuedAt={certificateData?.issued_at}
          courseData={courseData}
          brandName={brandName}
        />
      </motion.div>

      {/* ── Action card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          borderRadius: '18px',
          background: '#1a1410',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '22px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Your Certificate
            </p>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f5efe7', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {courseData?.name || 'VA Fundamentals Programme'}
            </h3>
            {isIssued && certificateData?.issued_at && (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Issued {new Date(certificateData.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {certificateData?.certificate_id && ` · ID: ${certificateData.certificate_id}`}
              </p>
            )}
          </div>
          <StatusBadge status={certStatus} />
        </div>

        <AnimatePresence mode="wait">
          {isIssued ? (
            <motion.div
              key="issued"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {/* Share row */}
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.18)',
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '4px',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>🎓</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
                  Congratulations, <strong style={{ color: '#f5efe7' }}>{studentName.split(' ')[0]}</strong>!
                  Share your certificate on LinkedIn to showcase your achievement.
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => downloadCertificate('certificate-print', studentName)}
                  style={{
                    flex: 1, minWidth: '160px',
                    padding: '13px 16px',
                    background: 'linear-gradient(135deg, #c97a3a, #8B4513)',
                    color: 'white', fontWeight: '700', fontSize: '13px',
                    borderRadius: '11px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(180,83,9,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const text = encodeURIComponent(
                      `I just earned my ${courseData?.name || 'VA Fundamentals'} certificate from ${certificateData?.brand_name || 'FlowMate Academy'}! 🎓`
                    );
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`, '_blank');
                  }}
                  style={{
                    flex: 1, minWidth: '160px',
                    padding: '13px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '13px',
                    borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                  Share on LinkedIn
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              {/* Steps to unlock */}
              <div style={{ marginBottom: '14px' }}>
                {[
                  { done: true,  label: 'Enrolled in the course' },
                  { done: false, label: isPending ? 'Completion submitted — awaiting review' : 'Complete all course modules' },
                  { done: false, label: 'Certificate issued by FlowMate Academy' },
                ].map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 0',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step.done
                        ? 'linear-gradient(135deg, #c97a3a, #8B4513)'
                        : 'rgba(255,255,255,0.06)',
                      border: step.done ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontSize: '10px',
                    }}>
                      {step.done
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}>{i + 1}</span>}
                    </div>
                    <p style={{
                      fontSize: '12px', margin: 0,
                      color: step.done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                      fontWeight: step.done ? '500' : '400',
                    }}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>

              <button disabled style={{
                width: '100%', padding: '13px',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.2)', fontWeight: '700', fontSize: '13px',
                borderRadius: '11px', border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'not-allowed', fontFamily: 'inherit',
              }}>
                {isPending ? '⏳ Awaiting Admin Approval' : '🔒 Complete Course to Unlock'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </motion.div>
  );
}

CertificateSection.propTypes = {
  certificateData: PropTypes.shape({
    status:          PropTypes.string,
    certificate_id:  PropTypes.string,
    issued_at:       PropTypes.string,
    student_name:    PropTypes.string,
  }),
  courseData: PropTypes.shape({
    name: PropTypes.string,
  }),
  user: PropTypes.shape({
    full_name:   PropTypes.string,
    first_name:  PropTypes.string,
    last_name:   PropTypes.string,
    email:       PropTypes.string,
  }),
  loading: PropTypes.bool,
  error:   PropTypes.string,
  theme:   PropTypes.object.isRequired,
};

CertificateSection.defaultProps = {
  certificateData: null,
  courseData:      null,
  user:            null,
  loading:         false,
  error:           null,
};









// import { useRef } from 'react';
// import { motion } from 'framer-motion';
// import PropTypes from 'prop-types';

// // ── PDF Download Helper ───────────────────────────────────────────────────────
// const downloadCertificate = (elementId, studentName) => {
//   const element = document.getElementById(elementId);
//   if (!element) return;

//   const printWindow = window.open('', '_blank');
//   printWindow.document.write(`
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Certificate - ${studentName}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body { 
//             width: 1122px; 
//             height: 793px; 
//             overflow: hidden;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
//           @media print {
//             @page { size: A4 landscape; margin: 0; }
//             body { width: 100%; height: 100%; }
//           }
//         </style>
//       </head>
//       <body>
//         ${element.outerHTML}
//         <script>
//           window.onload = () => { window.print(); window.close(); }
//         </script>
//       </body>
//     </html>
//   `);
//   printWindow.document.close();
// };

// // ── Certificate Visual ────────────────────────────────────────────────────────
// function CertificateVisual({ studentName, certificateId, issuedAt, courseData, theme }) {
//   const issueDate = issuedAt
//     ? new Date(issuedAt).toLocaleDateString('en-US', {
//         year: 'numeric', month: 'long', day: 'numeric',
//       })
//     : new Date().toLocaleDateString('en-US', {
//         year: 'numeric', month: 'long', day: 'numeric',
//       });

//   return (
//     <div
//       id="certificate-print"
//       style={{
//         width: '100%',
//         aspectRatio: '1.414 / 1',
//         background: 'linear-gradient(135deg, #FDFAF6 0%, #F5EFE7 50%, #EDE4D8 100%)',
//         position: 'relative',
//         overflow: 'hidden',
//         fontFamily: 'Georgia, serif',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '5%',
//       }}
//     >
//       {/* Outer decorative border */}
//       <div style={{
//         position: 'absolute', inset: '16px',
//         border: '3px solid #B8652F',
//         borderRadius: '4px',
//         pointerEvents: 'none',
//       }} />
//       {/* Inner decorative border */}
//       <div style={{
//         position: 'absolute', inset: '24px',
//         border: '1px solid #C8854F',
//         borderRadius: '2px',
//         pointerEvents: 'none',
//       }} />

//       {/* Corner ornaments */}
//       {[
//         { top: '28px', left: '28px' },
//         { top: '28px', right: '28px' },
//         { bottom: '28px', left: '28px' },
//         { bottom: '28px', right: '28px' },
//       ].map((pos, i) => (
//         <div key={i} style={{
//           position: 'absolute', ...pos,
//           width: '40px', height: '40px',
//           borderTop: i < 2 ? '3px solid #B8652F' : 'none',
//           borderBottom: i >= 2 ? '3px solid #B8652F' : 'none',
//           borderLeft: i % 2 === 0 ? '3px solid #B8652F' : 'none',
//           borderRight: i % 2 === 1 ? '3px solid #B8652F' : 'none',
//         }} />
//       ))}

//       {/* Watermark seal */}
//       <div style={{
//         position: 'absolute',
//         bottom: '12%', right: '8%',
//         width: '100px', height: '100px',
//         borderRadius: '50%',
//         border: '3px solid #B8652F',
//         opacity: 0.08,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontSize: '36px',
//       }}>★</div>

//       {/* Content */}
//       <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>

//         {/* Brand */}
//         <p style={{
//           fontSize: 'clamp(10px, 1.5vw, 14px)',
//           letterSpacing: '0.4em',
//           color: '#B8652F',
//           textTransform: 'uppercase',
//           marginBottom: '4%',
//           fontFamily: 'Georgia, serif',
//         }}>
//           FlowMate Academy
//         </p>

//         {/* Title */}
//         <h1 style={{
//           fontSize: 'clamp(20px, 4vw, 42px)',
//           fontWeight: '400',
//           color: '#3D2B1F',
//           letterSpacing: '0.05em',
//           marginBottom: '2%',
//           fontFamily: 'Georgia, serif',
//         }}>
//           Certificate of Completion
//         </h1>

//         {/* Divider */}
//         <div style={{
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'center', gap: '12px',
//           marginBottom: '4%',
//         }}>
//           <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to right, transparent, #B8652F)' }} />
//           <span style={{ color: '#B8652F', fontSize: '18px' }}>✦</span>
//           <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to left, transparent, #B8652F)' }} />
//         </div>

//         {/* Presented to */}
//         <p style={{
//           fontSize: 'clamp(9px, 1.2vw, 13px)',
//           letterSpacing: '0.3em',
//           color: '#8B6E5A',
//           textTransform: 'uppercase',
//           marginBottom: '2%',
//         }}>
//           This certifies that
//         </p>

//         {/* Student Name */}
//         <h2 style={{
//           fontSize: 'clamp(22px, 4.5vw, 48px)',
//           fontWeight: '400',
//           color: '#B8652F',
//           fontStyle: 'italic',
//           marginBottom: '2%',
//           fontFamily: 'Georgia, serif',
//         }}>
//           {studentName}
//         </h2>

//         {/* Bottom divider */}
//         <div style={{
//           width: '40%', height: '1px',
//           background: 'linear-gradient(to right, transparent, #B8652F, transparent)',
//           margin: '0 auto 3%',
//         }} />

//         {/* Body text */}
//         <p style={{
//           fontSize: 'clamp(9px, 1.3vw, 13px)',
//           color: '#5C3A1F',
//           lineHeight: '1.8',
//           maxWidth: '70%',
//           margin: '0 auto 4%',
//           letterSpacing: '0.02em',
//         }}>
//           has successfully completed all requirements of the
//         </p>

//         {/* Course Name */}
//         <p style={{
//           fontSize: 'clamp(13px, 2.2vw, 22px)',
//           fontWeight: '600',
//           color: '#3D2B1F',
//           letterSpacing: '0.08em',
//           textTransform: 'uppercase',
//           marginBottom: '5%',
//         }}>
//           {courseData?.name || 'VA Fundamentals'}
//         </p>

//         {/* Footer row */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'flex-end',
//           width: '80%',
//           margin: '0 auto',
//           paddingTop: '3%',
//           borderTop: '1px solid #D4B896',
//         }}>
//           {/* Date */}
//           <div style={{ textAlign: 'center' }}>
//             <p style={{ fontSize: 'clamp(8px, 1vw, 11px)', color: '#5C3A1F', letterSpacing: '0.05em' }}>
//               {issueDate}
//             </p>
//             <div style={{ height: '1px', background: '#B8652F', margin: '4px 0' }} />
//             <p style={{ fontSize: 'clamp(7px, 0.9vw, 10px)', color: '#8B6E5A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
//               Date Issued
//             </p>
//           </div>

//           {/* Seal */}
//           <div style={{
//             width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)',
//             borderRadius: '50%',
//             border: '2px solid #B8652F',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             flexDirection: 'column',
//             background: 'radial-gradient(circle, #F5EFE7, #EDE4D8)',
//           }}>
//             <span style={{ fontSize: 'clamp(14px, 2.5vw, 24px)', color: '#B8652F' }}>★</span>
//             <p style={{ fontSize: 'clamp(4px, 0.7vw, 7px)', color: '#B8652F', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Certified</p>
//           </div>

//           {/* Certificate ID */}
//           <div style={{ textAlign: 'center' }}>
//             <p style={{ fontSize: 'clamp(8px, 1vw, 11px)', color: '#5C3A1F', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
//               {certificateId || 'PENDING'}
//             </p>
//             <div style={{ height: '1px', background: '#B8652F', margin: '4px 0' }} />
//             <p style={{ fontSize: 'clamp(7px, 0.9vw, 10px)', color: '#8B6E5A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
//               Certificate ID
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Component ────────────────────────────────────────────────────────────
// export default function CertificateSection({
//   certificateData,
//   courseData,
//   user,
//   loading,
//   error,
//   theme,
// }) {
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Infinity }}
//             className="w-10 h-10 border-2 rounded-full mx-auto mb-4"
//             style={{ borderColor: `${theme.primary}20`, borderTopColor: theme.primary }}
//           />
//           <p style={{ color: theme.textLight }}>Loading certificate…</p>
//         </div>
//       </div>
//     );
//   }

//   const isIssued = certificateData?.status === 'issued';
//   const studentName = certificateData?.student_name
//     || user?.first_name
//       ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
//       : user?.email || 'Student';

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="space-y-6"
//     >
//       {/* Certificate preview — always visible */}
//       <div style={{
//         borderRadius: '12px',
//         overflow: 'hidden',
//         boxShadow: '0 20px 60px rgba(92,58,31,0.15)',
//         border: `1px solid ${theme.border}`,
//       }}>
//         <CertificateVisual
//           studentName={studentName}
//           certificateId={certificateData?.certificate_id}
//           issuedAt={certificateData?.issued_at}
//           courseData={courseData}
//           theme={theme}
//         />
//       </div>

//       {/* Status & actions */}
//       <div
//         className="p-6 rounded-lg"
//         style={{ backgroundColor: theme.white, border: `1px solid ${theme.border}` }}
//       >
//         {isIssued ? (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
//               <div>
//                 <p className="font-medium" style={{ color: theme.text }}>
//                   Certificate Issued
//                 </p>
//                 <p className="text-xs" style={{ color: theme.textLight }}>
//                   ID: {certificateData?.certificate_id} · Issued{' '}
//                   {new Date(certificateData?.issued_at).toLocaleDateString('en-US', {
//                     year: 'numeric', month: 'long', day: 'numeric',
//                   })}
//                 </p>
//               </div>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => downloadCertificate('certificate-print', studentName)}
//               className="w-full px-6 py-3 rounded-lg text-white font-medium text-sm"
//               style={{ backgroundColor: theme.primary }}
//             >
//               Download Certificate (PDF)
//             </motion.button>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             <p className="text-sm font-medium" style={{ color: theme.text }}>
//               {certificateData?.status === 'pending'
//                 ? 'Certificate pending admin approval'
//                 : 'Complete all lessons to earn your certificate'}
//             </p>
//             <p className="text-xs" style={{ color: theme.textLight }}>
//               Once approved, your certificate will be available to download with your name printed on it.
//             </p>
//             <motion.button
//               disabled
//               className="w-full px-6 py-3 rounded-lg text-white font-medium text-sm opacity-40 cursor-not-allowed"
//               style={{ backgroundColor: theme.primary }}
//             >
//               Certificate Not Yet Available
//             </motion.button>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// CertificateSection.propTypes = {
//   certificateData: PropTypes.object,
//   courseData: PropTypes.object,
//   user: PropTypes.object,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   theme: PropTypes.object.isRequired,
// };