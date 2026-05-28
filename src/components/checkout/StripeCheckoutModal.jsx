import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { createStripeCheckoutSession } from '@/api/payments';

export const StripeCheckoutModal = ({ course, onClose, studentEmail, studentName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priceKES = Number(course.price_kes) || 0;
  const priceUSD = Number(course.price_usd) || 0;

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await createStripeCheckoutSession({
        course_id: course.id,
        student_name: studentName,
        student_email: studentEmail,
      });
      if (response.sessionUrl) {
        if (response.enrolmentId) {
          localStorage.setItem('lastEnrolmentId', response.enrolmentId);
        }
        window.location.href = response.sessionUrl;
      } else {
        throw new Error('No checkout session URL received');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to prepare checkout. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: '#fff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          minHeight: '540px',
        }}
      >
        {/* Top accent */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(to right, #d97706, #f59e0b)',
        }} />

        <div style={{ padding: '28px' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: '20px',
          }}>
            <div>
              <h2 style={{
                fontSize: '20px', fontWeight: '800',
                color: '#1c1917', margin: 0, marginBottom: '4px',
              }}>
                💳 Pay with Card
              </h2>
              <p style={{ fontSize: '13px', color: '#78716c', margin: 0 }}>
                Secure payment processed by Stripe
              </p>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: '#f5f5f4', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: '#78716c', flexShrink: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Course + price */}
          <div style={{
            background: '#fffbeb', borderRadius: '14px',
            border: '1px solid #fde68a', padding: '16px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '14px', fontWeight: '700',
              color: '#1c1917', marginBottom: '12px',
            }}>
              {course.name}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px', borderTop: '1px solid #fde68a',
            }}>
              <span style={{ fontSize: '13px', color: '#78716c' }}>Total due</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#d97706' }}>
                  ${priceUSD}
                </span>
                {priceKES > 0 && (
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '2px 0 0' }}>
                    ≈ KES {priceKES.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{
            background: '#f0f9ff', borderRadius: '12px',
            border: '1px solid #bae6fd', padding: '14px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>📧</span>
            <div>
              <p style={{
                fontSize: '13px', fontWeight: '700',
                color: '#0c4a6e', margin: 0,
              }}>
                {studentEmail || 'Email not provided'}
              </p>
              <p style={{ fontSize: '12px', color: '#0369a1', margin: '2px 0 0' }}>
                Login credentials sent here within 24hrs
              </p>
            </div>
          </div>

         {/* Error — always rendered, invisible when no error */}
          <div style={{
            background: error ? '#fef2f2' : 'transparent',
            borderRadius: '12px',
            border: error ? '1px solid #fecaca' : '1px solid transparent',
            padding: '12px 14px',
            marginBottom: '16px',
            minHeight: '44px', // ✅ always takes up space
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}>
            {error && (
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Security note */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            gap: '8px', marginBottom: '20px',
          }}>
            <span style={{ fontSize: '15px', marginTop: '1px' }}>🔒</span>
            <p style={{ fontSize: '12px', color: '#78716c', margin: 0, lineHeight: 1.5 }}>
              Your card details are processed securely by Stripe — we never store or see them.
            </p>
          </div>

          {/* Checkout button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading
                ? '#e7e5e4'
                : 'linear-gradient(135deg, #d97706, #b45309)',
              color: loading ? '#a8a29e' : 'white',
              fontWeight: '700', fontSize: '15px',
              borderRadius: '12px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(217,119,6,0.3)',
              marginBottom: '10px',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: '2px solid #d1d5db',
                    borderTopColor: '#9ca3af',
                  }}
                />
                Preparing checkout…
              </>
            ) : (
              '💳 Continue to Stripe Checkout'
            )}
          </motion.button>

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: '#f5f5f4', color: '#78716c',
              fontWeight: '600', fontSize: '14px',
              borderRadius: '12px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

StripeCheckoutModal.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price_kes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price_usd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  studentEmail: PropTypes.string.isRequired,
  studentName: PropTypes.string.isRequired,
};

export default StripeCheckoutModal;