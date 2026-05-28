import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { initiatePayment, checkPaymentStatus } from '@/api/payments';

const STATE = { IDLE: 'idle', AWAITING: 'awaiting', SUCCESS: 'success', ERROR: 'error' };

export default function MpesaInlinePanel({
  course,
  enrolment,
  phone,
  studentName,
  studentEmail,
  onComplete,
}) {
  const [state, setState] = useState(STATE.IDLE);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [mpesaRef, setMpesaRef] = useState(null);
  const [error, setError] = useState('');
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  const priceKES = Number(course.price_kes) || 0;

  // ── Countdown while awaiting ──────────────────────────────────────────────
  useEffect(() => {
    if (state !== STATE.AWAITING) return;
    setTimeRemaining(120);
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    clearInterval(pollingRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = (checkoutRequestId) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(checkoutRequestId);
        if (res.status === 'success' || res.status === 'complete') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          setMpesaRef(res.mpesaRef || res.transactionId);
          setState(STATE.SUCCESS);
        } else if (res.status === 'failed') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          setError('Payment was declined. Please try again.');
          setState(STATE.ERROR);
        }
      } catch { /* network blip — keep polling */ }
    }, 3000);

    timeoutRef.current = setTimeout(() => {
      clearInterval(pollingRef.current);
      setError('Payment timed out. Check your M-Pesa messages and try again.');
      setState(STATE.ERROR);
    }, 120000);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await initiatePayment({
        phone,
        course_id: course.id,
        enrolment_id: enrolment.id,
        student_name: studentName,
        student_email: studentEmail,
        payment_method: 'mpesa',
      });
      setState(STATE.AWAITING);
      startPolling(res.checkoutRequestId);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to send M-Pesa request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setState(STATE.IDLE);
    setError('');
    setMpesaRef(null);
  };

  const formattedPhone = `${phone.slice(0,2)} ${phone.slice(2,5)} ${phone.slice(5,8)} ${phone.slice(8)}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">

      {/* IDLE */}
      {state === STATE.IDLE && (
        <motion.div key="idle"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
        >
          <div style={{
            background: '#fffbeb', borderRadius: '12px', padding: '13px 16px',
            border: '1px solid #fde68a', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#92400e', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                STK push to
              </p>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#1c1917', margin: 0, letterSpacing: '0.04em' }}>
                {formattedPhone}
              </p>
            </div>
            <span style={{ fontSize: '22px' }}>📱</span>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', borderRadius: '10px', padding: '10px 13px',
              border: '1px solid #fecaca', marginBottom: '12px',
              fontSize: '12px', color: '#dc2626', display: 'flex', gap: '6px',
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <motion.button
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={handleSend}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#e7e5e4' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: loading ? '#a8a29e' : 'white',
              fontWeight: '800', fontSize: '15px',
              borderRadius: '12px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(217,119,6,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{
                    display: 'inline-block', width: '15px', height: '15px',
                    border: '2px solid #a8a29e', borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
                Sending request…
              </>
            ) : ` Pay — KES ${priceKES.toLocaleString()}`}
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#a8a29e', marginTop: '10px', marginBottom: 0 }}>
            You'll get an M-Pesa prompt — enter your PIN to confirm
          </p>
        </motion.div>
      )}

      {/* AWAITING */}
      {state === STATE.AWAITING && (
        <motion.div key="awaiting"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#fef3c7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px',
            }}
          >
            📱
          </motion.div>

          <p style={{ fontSize: '14px', fontWeight: '800', color: '#1c1917', margin: '0 0 4px' }}>
            Check your phone
          </p>
          <p style={{ fontSize: '12px', color: '#78716c', margin: '0 0 16px' }}>
            M-Pesa prompt sent to <strong style={{ color: '#1c1917' }}>{formattedPhone}</strong>
          </p>

          <div style={{
            background: '#fffbeb', borderRadius: '12px', padding: '14px',
            border: '1px solid #fde68a', marginBottom: '12px',
          }}>
            <p style={{ fontSize: '32px', fontWeight: '900', color: '#d97706', margin: 0, letterSpacing: '-0.03em' }}>
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </p>
            <p style={{ fontSize: '11px', color: '#78716c', margin: '3px 0 0' }}>Waiting for confirmation…</p>
          </div>

          <div style={{ height: '3px', background: '#f5f5f4', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(to right, #d97706, #f59e0b)', borderRadius: '999px' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 120, ease: 'linear' }}
            />
          </div>

          <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>🔒 Enter your M-Pesa PIN when prompted</p>
        </motion.div>
      )}

      {/* SUCCESS */}
      {state === STATE.SUCCESS && (
        <motion.div key="success"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#dcfce7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px',
              fontSize: '22px', color: '#16a34a', fontWeight: '900',
            }}
          >
            ✓
          </motion.div>

          <p style={{ fontSize: '16px', fontWeight: '800', color: '#1c1917', margin: '0 0 14px' }}>
            Payment confirmed!
          </p>

          <div style={{
            background: '#fffbeb', borderRadius: '10px', padding: '12px 14px',
            border: '1px solid #fde68a', textAlign: 'left', marginBottom: '12px',
          }}>
            {[
              { label: 'Amount', value: `KES ${priceKES.toLocaleString()}` },
              { label: 'Reference', value: mpesaRef || '—' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: '12px',
                paddingBottom: i === 0 ? '8px' : 0, marginBottom: i === 0 ? '8px' : 0,
                borderBottom: i === 0 ? '1px solid #fde68a' : 'none',
              }}>
                <span style={{ color: '#78716c' }}>{r.label}</span>
                <span style={{ fontWeight: '700', color: '#1c1917' }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: '#f0f9ff', borderRadius: '10px', padding: '11px 13px',
            border: '1px solid #bae6fd', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: '#0c4a6e', margin: 0 }}>
              ✨ Login credentials will be sent to <strong>{studentEmail}</strong> within 24hrs.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.setItem('lastEnrolmentId', enrolment.id);
              onComplete?.();
              window.location.href = `/academy/success?enrolment_id=${enrolment.id}`;
            }}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', fontWeight: '800', fontSize: '14px',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)', fontFamily: 'inherit',
            }}
          >
            Continue to confirmation →
          </motion.button>
        </motion.div>
      )}

      {/* ERROR */}
      {state === STATE.ERROR && (
        <motion.div key="error"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#fee2e2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px',
            fontSize: '22px', color: '#dc2626',
          }}>
            ✕
          </div>

          <p style={{ fontSize: '15px', fontWeight: '800', color: '#1c1917', margin: '0 0 10px' }}>
            Payment failed
          </p>

          <div style={{
            background: '#fef2f2', borderRadius: '10px', padding: '12px 14px',
            border: '1px solid #fecaca', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>{error}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleRetry}
              style={{
                padding: '13px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: 'white', fontWeight: '700', fontSize: '13px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217,119,6,0.3)', fontFamily: 'inherit',
              }}
            >
              Try again
            </motion.button>
            <button
              onClick={() => window.location.href = '/academy'}
              style={{
                padding: '13px', background: '#f5f5f4', color: '#78716c',
                fontWeight: '600', fontSize: '13px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}

MpesaInlinePanel.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price_kes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  enrolment: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
  phone: PropTypes.string.isRequired,
  studentName: PropTypes.string.isRequired,
  studentEmail: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
};

MpesaInlinePanel.defaultProps = {
  onComplete: () => {},
};