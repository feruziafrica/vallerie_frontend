import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { initiatePayment } from '@/api/payments';  // ← was @/services/api (wrong client)

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      border: '2px solid #fde68a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: '900', color: '#b45309', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CourseDetails({
  course, enrolment, studentName, studentEmail,
  phone, onBack, onComplete,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priceKES = Number(course.price_kes) || 0;
  const priceUSD = Number(course.price_usd) || 0;

  // ── Guard — enrolment not ready yet ──────────────────────────────────────
  // This should only flash for a moment at most. If it persists, the
  // enrolment object from POST /api/payments/enrol/ is missing its `id`.
  // Check the browser console for the API response shape.
  if (!enrolment?.id) {
    return (
      <div style={{ maxWidth: '420px', margin: '60px auto', textAlign: 'center', color: '#a8a29e', fontSize: '13px' }}>
        ⏳ Loading payment details…
      </div>
    );
  }

  // ── Redirect to Paystack checkout ─────────────────────────────────────────
  const handlePaystack = async () => {
  setError('');
  setLoading(true);

  try {
    // Get the checkout_token from enrolment response
    const checkoutToken = enrolment.checkout_token; // ← from enrol response
    
    const payment = await initiatePayment(enrolment.id, checkoutToken);

    if (!payment?.authorization_url) {
      throw new Error('No authorization URL returned from server.');
    }

    // Redirect to Paystack with the token
    window.location.href = payment.authorization_url;

  } catch (err) {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Could not initiate payment. Please try again.';

    setError(msg);
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: '420px', margin: '0 auto' }}
    >
      {/* Back */}
      <motion.button onClick={onBack} whileHover={{ x: -3 }} style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        color: '#d97706', fontSize: '13px', fontWeight: '700',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 0, marginBottom: '22px', fontFamily: 'inherit',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to details
      </motion.button>

      {/* Step label */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', background: '#fef3c7', borderRadius: '999px', padding: '4px 13px', marginBottom: '10px' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', color: '#92400e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Step 2 of 3 · Payment
          </span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1c1917', margin: 0, lineHeight: 1.15, letterSpacing: '-0.025em' }}>
          Complete your payment
        </h2>
      </div>

      {/* Main card */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        border: '1.5px solid #f0efee', padding: '22px',
        boxShadow: '0 6px 28px rgba(0,0,0,0.07)', marginBottom: '16px',
      }}>
        {/* Student row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#fafaf9', borderRadius: '12px',
          padding: '12px 14px', border: '1px solid #f5f5f4', marginBottom: '18px',
        }}>
          <Avatar name={studentName} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#1c1917', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentName}
            </p>
            <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentEmail}
            </p>
          </div>
          <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: '800', color: '#92400e', background: '#fef3c7', padding: '3px 9px', borderRadius: '999px', border: '1px solid #fde68a' }}>
            #{enrolment.id}
          </span>
        </div>

        {/* Price row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', marginBottom: '18px',
          borderTop: '1px solid #f5f5f4', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <p style={{ fontSize: '10px', color: '#a8a29e', margin: '0 0 3px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Total due
            </p>
            <span style={{ fontSize: '30px', fontWeight: '900', color: '#d97706', letterSpacing: '-0.03em' }}>
              KES {priceKES.toLocaleString()}
            </span>
          </div>
          {priceUSD > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', color: '#a8a29e', margin: '0 0 3px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                or in USD
              </p>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#b45309', letterSpacing: '-0.02em' }}>
                ${priceUSD}
              </span>
            </div>
          )}
        </div>

        {/* Payment info */}
        <p style={{ fontSize: '10px', fontWeight: '800', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '10px' }}>
          Payment method
        </p>

        {/* Paystack info banner */}
        <div style={{
          background: '#f0fdf4', borderRadius: '12px', padding: '12px 14px',
          border: '1px solid #bbf7d0', marginBottom: '16px',
          fontSize: '12px', color: '#15803d', lineHeight: 1.55,
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '11px' }}>
            🔐 Paystack Secure Checkout
          </p>
          Pay with M-Pesa, Visa, Mastercard, or bank transfer — all on one secure page.
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', padding: '10px 14px',
            fontSize: '12px', color: '#dc2626', marginBottom: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Paystack button */}
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={handlePaystack}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading
              ? '#d1d5db'
              : 'linear-gradient(135deg, #d97706, #b45309)',
            color: 'white', fontWeight: '800', fontSize: '15px',
            borderRadius: '12px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(217,119,6,0.35)',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            transition: 'background 0.2s',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              Redirecting to Paystack...
            </>
          ) : (
            <>🔒 Pay KES {priceKES.toLocaleString()} securely</>
          )}
        </motion.button>

        {/* Accepted methods */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          marginTop: '12px', flexWrap: 'wrap',
        }}>
          {['🇰🇪 M-Pesa', '💳 Visa', '💳 Mastercard', '🏦 Bank'].map(method => (
            <span key={method} style={{
              fontSize: '10px', color: '#a8a29e', fontWeight: '600',
              background: '#f5f5f4', padding: '3px 8px', borderRadius: '999px',
            }}>
              {method}
            </span>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: '#a8a29e', marginTop: '14px', marginBottom: 0 }}>
          🔒 Secure · Confirmed within 24 hrs · Login sent by email
        </p>
      </div>

      {/* Order summary */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        borderRadius: '14px', padding: '16px', border: '1px solid #fde68a',
      }}>
        <p style={{ fontSize: '9px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Order Summary
        </p>
        {[
          { label: course.name, value: `KES ${priceKES.toLocaleString()}` },
          { label: 'Enrolment type', value: 'One-time, lifetime access' },
          // { label: 'Enrolment ID', value: `#${enrolment.id}` },
        ].map((r, i, arr) => (
          <div key={r.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
            padding: '7px 0',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(253,230,138,0.5)' : 'none',
          }}>
            <span style={{ fontSize: '11px', color: '#92400e' }}>{r.label}</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1c1917', textAlign: 'right' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

CourseDetails.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price_kes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price_usd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  enrolment: PropTypes.shape({ id: PropTypes.number }),
  studentName: PropTypes.string.isRequired,
  studentEmail: PropTypes.string.isRequired,
  phone: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
};

CourseDetails.defaultProps = {
  phone: '',
  onComplete: () => {},
};