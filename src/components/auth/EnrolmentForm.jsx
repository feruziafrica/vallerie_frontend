import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { api } from '@/api/auth';

// ── Floating accent dot ───────────────────────────────────────────────────────
function FloatingDot({ style }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], opacity: [0.35, 0.65, 0.35] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', width: '6px', height: '6px',
        borderRadius: '50%', background: '#d97706', pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '10px', fontWeight: '800', letterSpacing: '0.09em',
        textTransform: 'uppercase', color: '#78716c',
      }}>
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}
          >
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = (focused, hasError) => ({
  width: '100%',
  padding: '11px 14px',
  fontSize: '13px',
  color: '#1c1917',
  background: focused ? '#fffbeb' : '#fafaf9',
  border: `1.5px solid ${hasError ? '#dc2626' : focused ? '#d97706' : '#e7e5e4'}`,
  borderRadius: '10px',
  outline: 'none',
  transition: 'all 0.18s ease',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
});

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * EnrolmentForm
 *
 * Props:
 *  preselectedCourse  — { id, name } from the card step (can be null)
 *  onSuccess          — ({ enrolment, course }) => void
 *                       enrolment = API response from POST /api/enrol/
 *                       course    = full course object (for CourseDetails)
 *  onBack             — () => void — go back to course selection
 */
export default function EnrolmentForm({ preselectedCourse, onSuccess, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [form, setForm] = useState({
    student_name: '',
    student_email: '',
    phone: '',
    course: preselectedCourse?.id ? String(preselectedCourse.id) : '',
  });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Persist name + email to localStorage for downstream use (CourseDetails)
  useEffect(() => {
    if (form.student_name) localStorage.setItem('student_name', form.student_name);
    if (form.student_email) localStorage.setItem('student_email', form.student_email);
    if (form.phone) localStorage.setItem('student_phone', form.phone);
  }, [form.student_name, form.student_email, form.phone]);

  // Fetch course list from API
  useEffect(() => {
    api.get('/courses/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setCourses(list.filter(c => c.is_active !== false));
      })
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  // If parent pushes a new preselectedCourse after mount, sync it
  useEffect(() => {
    if (preselectedCourse?.id) {
      setForm(f => ({ ...f, course: String(preselectedCourse.id) }));
    }
  }, [preselectedCourse?.id]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.student_name.trim())
      e.student_name = 'Full name is required';
    else if (form.student_name.trim().split(/\s+/).length < 2)
      e.student_name = 'Please enter your full name';

    if (!form.student_email.trim())
      e.student_email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.student_email))
      e.student_email = 'Enter a valid email address';

    if (!form.phone.trim())
      e.phone = 'Phone number is required';
    else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid phone number';

    if (!form.course)
      e.course = 'Please select a course';

    return e;
  };

  // ── Submit → POST /api/payments/enrol/ ──────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    setSubmitError('');

    try {
      const { data } = await api.post('/payments/enrol/', {
        student_name:   form.student_name.trim(),
        student_email:  form.student_email.trim().toLowerCase(),
        phone:          form.phone.trim(),
        course:         Number(form.course),
        payment_method: 'paystack',
      });

      const selectedCourse =
        courses.find(c => String(c.id) === String(form.course)) || preselectedCourse;

      onSuccess({ enrolment: data, course: selectedCourse });
    } catch (err) {
      const errData = err?.response?.data;
      const msg =
        errData?.detail ||
        errData?.non_field_errors?.[0] ||
        (errData && Object.values(errData)?.[0]?.[0]) ||
        'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    if (submitError) setSubmitError('');
  };

  const selectedCourseObj = courses.find(c => String(c.id) === form.course);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}
    >
      {/* Decorative dots */}
      <FloatingDot style={{ top: '36px', right: '-10px' }} />
      <FloatingDot style={{ top: '200px', right: '-18px', width: '4px', height: '4px' }} />
      <FloatingDot style={{ bottom: '100px', left: '-12px' }} />

      {/* ── Back button ── */}
      {onBack && (
        <motion.button
          onClick={onBack}
          whileHover={{ x: -3 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: '#d97706', fontSize: '13px', fontWeight: '700',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '22px', fontFamily: 'inherit',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to courses
        </motion.button>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#fef3c7', borderRadius: '999px',
          padding: '4px 13px', marginBottom: '10px',
        }}>
          <span style={{
            fontSize: '9px', fontWeight: '800', color: '#92400e',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Step 1 of 3 · Enrolment
          </span>
        </div>
        <h2 style={{
          fontSize: '24px', fontWeight: '900', color: '#1c1917',
          margin: 0, lineHeight: 1.15, letterSpacing: '-0.025em',
        }}>
          Secure your spot
        </h2>
        {preselectedCourse?.name && (
          <p style={{ fontSize: '13px', color: '#78716c', margin: '7px 0 0', lineHeight: 1.5 }}>
            Enrolling in{' '}
            <strong style={{ color: '#1c1917' }}>{preselectedCourse.name}</strong>
          </p>
        )}
      </div>

      {/* ── Card ── */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1.5px solid #f0efee',
        padding: '26px',
        boxShadow: '0 6px 28px rgba(0,0,0,0.07)',
      }}>
        {/* Progress pips */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          marginBottom: '22px', paddingBottom: '18px',
          borderBottom: '1px solid #f5f5f4',
        }}>
          {['Details', 'Payment', 'Access'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <motion.div
                animate={{
                  width: i === 0 ? '28px' : '7px',
                  background: i === 0 ? '#d97706' : '#e7e5e4',
                }}
                style={{ height: '7px', borderRadius: '999px' }}
                transition={{ duration: 0.4 }}
              />
              {i === 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: '800', color: '#d97706',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Fields ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Full Name */}
          <Field label="Full Name" error={errors.student_name}>
            <input
              type="text"
              placeholder="e.g. Jane Wanjiku"
              value={form.student_name}
              onChange={set('student_name')}
              onFocus={() => setFocused('student_name')}
              onBlur={() => setFocused('')}
              style={inputStyle(focused === 'student_name', !!errors.student_name)}
              autoComplete="name"
            />
          </Field>

          {/* Email */}
          <Field
            label="Email Address"
            error={errors.student_email}
            hint="Login credentials will be sent here"
          >
            <input
              type="email"
              placeholder="jane@example.com"
              value={form.student_email}
              onChange={set('student_email')}
              onFocus={() => setFocused('student_email')}
              onBlur={() => setFocused('')}
              style={inputStyle(focused === 'student_email', !!errors.student_email)}
              autoComplete="email"
            />
          </Field>

          {/* Phone */}
          <Field
            label="Phone Number"
            error={errors.phone}
            hint="For M-Pesa payments — include country code"
          >
            <input
              type="tel"
              placeholder="+254 7XX XXX XXX"
              value={form.phone}
              onChange={set('phone')}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              style={inputStyle(focused === 'phone', !!errors.phone)}
              autoComplete="tel"
            />
          </Field>

          {/* Course selector */}
          <Field label="Course" error={errors.course}>
            <div style={{ position: 'relative' }}>
              <select
                value={form.course}
                onChange={set('course')}
                onFocus={() => setFocused('course')}
                onBlur={() => setFocused('')}
                disabled={loadingCourses}
                style={{
                  ...inputStyle(focused === 'course', !!errors.course),
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  paddingRight: '38px',
                  cursor: loadingCourses ? 'wait' : 'pointer',
                  color: form.course ? '#1c1917' : '#a8a29e',
                }}
              >
                <option value="" disabled>
                  {loadingCourses ? 'Loading courses…' : 'Select a course'}
                </option>
                {courses.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}{c.price_kes ? ` — KES ${Number(c.price_kes).toLocaleString()}` : ''}
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute', right: '13px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a8a29e',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </Field>

          {/* Live price preview */}
          <AnimatePresence>
            {selectedCourseObj && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  borderRadius: '12px', padding: '14px 16px',
                  border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{
                      fontSize: '9px', color: '#92400e', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '0.09em',
                      margin: '0 0 3px',
                    }}>Enrolment fee</p>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', margin: 0, letterSpacing: '-0.02em' }}>
                      KES {Number(selectedCourseObj.price_kes).toLocaleString()}
                      {selectedCourseObj.price_usd && (
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#a8a29e', marginLeft: '8px' }}>
                          / ${selectedCourseObj.price_usd}
                        </span>
                      )}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '10px', color: '#92400e', fontWeight: '700',
                    background: '#fef3c7', borderRadius: '7px',
                    padding: '5px 9px', border: '1px solid #fde68a',
                  }}>
                    {selectedCourseObj.duration || 'Self-paced'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API error banner */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: '#fef2f2', borderRadius: '10px', padding: '11px 14px',
                  border: '1px solid #fecaca', fontSize: '12px', color: '#dc2626',
                  display: 'flex', alignItems: 'flex-start', gap: '7px',
                }}
              >
                <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span>
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={!submitting ? { scale: 1.02 } : {}}
            whileTap={!submitting ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '14px',
              background: submitting ? '#e7e5e4' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: submitting ? '#a8a29e' : 'white',
              fontWeight: '800', fontSize: '14px',
              borderRadius: '11px', border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 5px 18px rgba(217,119,6,0.32)',
              transition: 'all 0.2s',
              letterSpacing: '0.01em', marginTop: '2px',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                  style={{
                    display: 'inline-block', width: '14px', height: '14px',
                    border: '2px solid #c4c0bc', borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
                Saving details…
              </span>
            ) : 'Continue to Payment →'}
          </motion.button>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '18px', marginTop: '16px',
      }}>
        {['🔒 Secure', '✉ Credentials by email', '⚡ Instant access'].map(t => (
          <span key={t} style={{ fontSize: '10px', color: '#a8a29e', fontWeight: '600' }}>{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

EnrolmentForm.propTypes = {
  preselectedCourse: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

EnrolmentForm.defaultProps = {
  preselectedCourse: null,
  onBack: null,
};














