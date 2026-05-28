import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/auth';
import { endpoints } from '@/api/endpoints';

const MESSAGE_TYPES = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    color: '#25D366',
    charLimit: 4096,
  },
  {
    value: 'sms',
    label: 'SMS',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#3B82F6',
    charLimit: 160,
  },
  {
    value: 'email',
    label: 'Email',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    color: '#B8652F',
    charLimit: 10000,
  },
];

const RECIPIENT_KEYS = [
  { value: 'all',              label: 'All Active Students' },
  { value: 'in_progress',      label: 'In Progress' },
  { value: 'completed',        label: 'Completed Course' },
  { value: 'pending_approval', label: 'Pending Approval' },
];

const TEMPLATES = [
  {
    title: 'Welcome',
    tag: 'Onboarding',
    tagColor: '#10B981',
    text: "Welcome to FlowMate Academy! We're excited to have you on board. Your learning journey starts today — log in and explore your first module.",
  },
  {
    title: 'Continue Learning',
    tag: 'Engagement',
    tagColor: '#3B82F6',
    text: "Hey! You're making great progress. Don't lose momentum — your next module is waiting. Log in and keep going!",
  },
  {
    title: 'Course Completed',
    tag: 'Milestone',
    tagColor: '#F59E0B',
    text: 'Congratulations on completing the course! Your certificate is being prepared and will be available shortly. Well done!',
  },
  {
    title: 'New Course Available',
    tag: 'Announcement',
    tagColor: '#B8652F',
    text: 'A new course just launched on FlowMate Academy. Check it out and expand your skills — early enrollees get priority support.',
  },
];

function Skel({ w = '100%', h = 12, r = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

export default function BulkMessaging() {
  const [messageType,      setMessageType]      = useState('whatsapp');
  const [recipientFilter,  setRecipientFilter]  = useState('all');
  const [message,          setMessage]          = useState('');
  const [sending,          setSending]          = useState(false);
  const [sent,             setSent]             = useState(false);
  const [sentCount,        setSentCount]        = useState(0);
  const [error,            setError]            = useState(null);
  const [recipientOptions, setRecipientOptions] = useState(null);
  const [countsError,      setCountsError]      = useState(false);
  // Mobile: show preview panel or compose panel
  const [mobileTab,        setMobileTab]        = useState('compose');

  const fetchCounts = useCallback(async () => {
    setCountsError(false);
    try {
      const res    = await api.get(endpoints.dashboard.stats);
      const counts = res.data?.recipient_counts ?? {};
      setRecipientOptions(RECIPIENT_KEYS.map((r) => ({ ...r, count: counts[r.value] ?? '—' })));
    } catch {
      setCountsError(true);
      setRecipientOptions(RECIPIENT_KEYS.map((r) => ({ ...r, count: '—' })));
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const activeType      = MESSAGE_TYPES.find((t) => t.value === messageType);
  const activeRecipient = recipientOptions?.find((r) => r.value === recipientFilter);
  const charLimit       = activeType?.charLimit ?? 160;
  const charPct         = Math.min((message.length / charLimit) * 100, 100);
  const isOverLimit     = message.length > charLimit;
  const canSend         = message.trim() && !sending && !isOverLimit && recipientOptions !== null;
  const recipientsLoading = recipientOptions === null;

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await api.post(endpoints.dashboard.messageBulk, {
        message_type:     messageType,
        recipient_filter: recipientFilter,
        message_content:  message,
      });
      setSentCount(res.data?.sent_count ?? activeRecipient?.count ?? 0);
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 5000);
      fetchCounts();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message;
      setError(detail || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ── Preview panel (shared between desktop sidebar and mobile tab) ──────────
  const PreviewPanel = () => (
    <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Live Preview</div>
        <div style={{ fontSize: '11px', color: '#9b9b9b', marginTop: '1px' }}>As seen on {activeType?.label}</div>
      </div>
      <div style={{ padding: '14px 16px', background: '#F7F4F0' }}>
        <div style={{ background: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ padding: '10px 14px', background: activeType?.color || '#B8652F', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>VA</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>FlowMate Academy</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{activeType?.label === 'WhatsApp' ? 'Online' : 'Official Account'}</div>
            </div>
          </div>
          <div style={{ padding: '14px', background: messageType === 'whatsapp' ? '#ECE5DD' : '#F7F4F0', minHeight: '80px' }}>
            <div style={{ background: messageType === 'whatsapp' ? '#DCF8C6' : '#ffffff', borderRadius: messageType === 'whatsapp' ? '8px 8px 8px 0' : '8px', padding: '10px 12px', maxWidth: '90%', border: messageType !== 'whatsapp' ? '1px solid rgba(0,0,0,0.07)' : 'none' }}>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: message ? '#1a1a1a' : '#9b9b9b', whiteSpace: 'pre-wrap', fontStyle: message ? 'normal' : 'italic' }}>
                {message || 'Your message will appear here…'}
              </p>
              <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '10px', color: '#9b9b9b', fontFamily: 'monospace' }}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {messageType === 'whatsapp' && ' ✓✓'}
              </div>
            </div>
          </div>
        </div>

        {/* Meta summary */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { label: 'Recipients', value: recipientsLoading ? '…' : (activeRecipient?.count ?? '—'), color: '#1a1a1a' },
            { label: 'Channel',    value: activeType?.label,                                         color: activeType?.color },
            { label: 'Characters', value: `${message.length} / ${charLimit}`,                       color: isOverLimit ? '#DC2626' : '#1a1a1a' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#9b9b9b' }}>{row.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: row.color, fontFamily: 'monospace' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* Desktop: side-by-side grid; preview sticky */
        .bm-grid        { display: grid; grid-template-columns: 1fr 260px; gap: 16px; align-items: start; }
        .bm-preview-desktop { display: block; position: sticky; top: 0; }
        .bm-preview-mobile  { display: none; }
        .bm-mobile-tabs     { display: none; }
        .bm-channels    { display: flex; gap: 8px; }
        .bm-templates   { grid-template-columns: repeat(2, minmax(0,1fr)); }

        @media (max-width: 640px) {
          .bm-grid              { grid-template-columns: 1fr !important; gap: 12px; }
          .bm-preview-desktop   { display: none !important; }
          .bm-preview-mobile    { display: block !important; }
          .bm-mobile-tabs       { display: flex !important; }
          .bm-channels          { flex-wrap: wrap !important; gap: 6px !important; }
          .bm-channels button   { flex: 1; min-width: 80px; justify-content: center; padding: 8px 10px !important; font-size: 12px !important; }
          .bm-templates         { grid-template-columns: 1fr !important; }
          .bm-compose-inner     { padding: 16px !important; }
          .bm-send-btn          { font-size: 14px !important; padding: 13px !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px', fontFamily: "'Geist', sans-serif" }}>

        {/* ── Toasts ── */}
        <AnimatePresence>
          {sent && (
            <motion.div key="success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#059669' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Messages sent successfully to {sentCount} students.
            </motion.div>
          )}
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '13px', padding: 0 }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile tab switcher (Compose / Preview) ── */}
        <div className="bm-mobile-tabs" style={{ display: 'none', background: '#F7F4F0', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          {['compose', 'preview'].map((tab) => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: mobileTab === tab ? '#ffffff' : 'transparent', color: mobileTab === tab ? '#1a1a1a' : '#6b6b6b', fontSize: '13px', fontWeight: mobileTab === tab ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: mobileTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {tab === 'compose' ? '✏️ Compose' : '👁 Preview'}
            </button>
          ))}
        </div>

        {/* ── Main compose + preview grid ── */}
        <div className="bm-grid">

          {/* Compose card — hidden on mobile when preview tab active */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            className={mobileTab === 'preview' ? 'bm-hide-mobile' : ''}>

            <style>{`.bm-hide-mobile { } @media(max-width:640px){ .bm-hide-mobile { display: none !important; } }`}</style>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Compose Message</div>
            </div>

            <div className="bm-compose-inner" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Channel selector */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '10px' }}>Channel</div>
                <div className="bm-channels" style={{ display: 'flex', gap: '8px' }}>
                  {MESSAGE_TYPES.map((type) => {
                    const isActive = messageType === type.value;
                    return (
                      <motion.button key={type.value} whileTap={{ scale: 0.97 }} onClick={() => setMessageType(type.value)}
                        style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '8px', border: isActive ? `1.5px solid ${type.color}` : '1px solid rgba(0,0,0,0.08)', background: isActive ? `${type.color}0f` : 'transparent', color: isActive ? type.color : '#6b6b6b', fontSize: '13px', fontWeight: isActive ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                        {type.icon}{type.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient selector */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b', marginBottom: '10px' }}>Recipients</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recipientsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Skel w={130} h={12} /><Skel w={28} h={18} r={99} />
                        </div>
                      ))
                    : recipientOptions.map((opt) => {
                        const isActive = recipientFilter === opt.value;
                        return (
                          <button key={opt.value} onClick={() => setRecipientFilter(opt.value)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: isActive ? '1.5px solid rgba(184,101,47,0.4)' : '1px solid rgba(0,0,0,0.07)', background: isActive ? 'rgba(184,101,47,0.06)' : 'rgba(0,0,0,0.02)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: isActive ? '4px solid #B8652F' : '1.5px solid rgba(0,0,0,0.2)', background: 'white', transition: 'all 0.15s', flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#1a1a1a' : '#6b6b6b' }}>{opt.label}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'monospace', padding: '2px 7px', borderRadius: '99px', background: isActive ? 'rgba(184,101,47,0.12)' : 'rgba(0,0,0,0.06)', color: isActive ? '#B8652F' : '#9b9b9b' }}>
                              {opt.count}
                            </span>
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b9b9b' }}>Message</div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: isOverLimit ? '#DC2626' : charPct > 80 ? '#D97706' : '#9b9b9b' }}>
                    {message.length} / {charLimit}
                  </span>
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here…" rows={5}
                  style={{ width: '100%', padding: '12px 14px', background: '#F7F4F0', border: `1px solid ${isOverLimit ? 'rgba(220,38,38,0.4)' : 'rgba(0,0,0,0.07)'}`, borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                  onFocus={(e) => { if (!isOverLimit) e.target.style.borderColor = '#B8652F'; }}
                  onBlur={(e)  => { e.target.style.borderColor = isOverLimit ? 'rgba(220,38,38,0.4)' : 'rgba(0,0,0,0.07)'; }} />
                <div style={{ height: '2px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${charPct}%`, background: isOverLimit ? '#DC2626' : charPct > 80 ? '#F59E0B' : '#B8652F', borderRadius: '99px', transition: 'width 0.1s, background 0.2s' }} />
                </div>
              </div>

              {/* Send button */}
              <motion.button className="bm-send-btn"
                whileHover={canSend ? { scale: 1.01 } : {}} whileTap={canSend ? { scale: 0.98 } : {}}
                onClick={handleSend} disabled={!canSend}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: canSend ? '#B8652F' : 'rgba(0,0,0,0.06)', color: canSend ? 'white' : '#9b9b9b', fontSize: '13px', fontWeight: 600, cursor: canSend ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.15s', letterSpacing: '-0.01em' }}>
                {sending ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                    Sending…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send via {activeType?.label}{activeRecipient?.count !== '—' ? ` · ${activeRecipient?.count} students` : ''}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Desktop preview sidebar */}
          <div className="bm-preview-desktop">
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <PreviewPanel />
            </motion.div>
          </div>

          {/* Mobile preview tab */}
          {mobileTab === 'preview' && (
            <div className="bm-preview-mobile">
              <PreviewPanel />
            </div>
          )}
        </div>

        {/* ── Templates ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Quick Templates</div>
            <span style={{ fontSize: '11px', color: '#9b9b9b' }}>Tap to populate</span>
          </div>
          <div className="bm-templates" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px' }}>
            {TEMPLATES.map((tpl) => (
              <motion.button key={tpl.title} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setMessage(tpl.text); setMobileTab('compose'); }}
                style={{ padding: '14px 16px', background: message === tpl.text ? 'rgba(184,101,47,0.06)' : 'rgba(0,0,0,0.02)', border: message === tpl.text ? '1.5px solid rgba(184,101,47,0.35)' : '1px solid rgba(0,0,0,0.07)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{tpl.title}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '99px', background: `${tpl.tagColor}14`, color: tpl.tagColor, flexShrink: 0 }}>{tpl.tag}</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b6b6b', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {tpl.text}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}