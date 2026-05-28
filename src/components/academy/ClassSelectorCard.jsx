import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '@/api/courses';
import CourseOptionCard from './CourseOptionCard';
import EnrolmentForm from '../auth/EnrolmentForm';
import CourseDetails from './CourseDetails';

const STEPS = { SELECT: 'select', ENROL: 'enrol', PAYMENT: 'payment', SUCCESS: 'success' };

export default function ClassSelectorCard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.SELECT);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolment, setEnrolment] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchCourses()
      .then(data => setCourses(data))
      .catch(err => {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (course) => {
    setSelectedCourse(prev => prev?.id === course.id ? null : course);
  };

  const handleEnrol = (course) => {
    setSelectedCourse(course);
    setStep(STEPS.ENROL);
  };

  const handleEnrolSuccess = ({ enrolment: e, course }) => {
    // ── FIX 1: detect already-confirmed students ──────────────────────────
    // If the backend resumed a *confirmed* enrolment (status === 'confirmed'),
    // the student is already enrolled and paid. Skip the payment step entirely
    // and send them straight to their dashboard.
    if (e?.status === 'confirmed') {
      navigate('/dashboard');
      return;
    }

    setEnrolment(e);
    setSelectedCourse(course);
    setStudentInfo({
      name:  e.student_name  || '',
      email: e.student_email || '',
      phone: e.phone         || '',
    });
    setStep(STEPS.PAYMENT);
  };

  // ── FIX 2: onComplete actually navigates after payment ────────────────────
  // CourseDetails calls this after the Paystack redirect URL is received.
  // In practice, window.location.href fires immediately so this is a fallback —
  // but it also covers any future in-page payment flows.
  const handlePaymentComplete = () => {
    navigate('/dashboard');
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── STEP 1: Course grid ── */}
      {step === STEPS.SELECT && (
        <motion.div
          key="select"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.28 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {courses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                  >
                    <CourseOptionCard
                      course={course}
                      isSelected={selectedCourse?.id === course.id}
                      onSelect={handleSelect}
                      onEnrol={handleEnrol}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Floating bottom bar when a course is selected */}
              <AnimatePresence>
                {selectedCourse && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    style={{
                      position: 'sticky',
                      bottom: '16px',
                      background: 'rgba(255,255,255,0.96)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '14px',
                      border: '1px solid #fde68a',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: '0 8px 32px rgba(217,119,6,0.18)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '10px', color: '#92400e', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Selected
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#1c1917', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedCourse.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: '#d97706', letterSpacing: '-0.02em' }}>
                        KES {Number(selectedCourse.price_kes).toLocaleString()}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setStep(STEPS.ENROL)}
                        style={{
                          padding: '10px 22px',
                          background: 'linear-gradient(135deg, #d97706, #b45309)',
                          color: 'white', fontWeight: 800, fontSize: '13px',
                          borderRadius: '10px', border: 'none', cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
                          fontFamily: 'inherit',
                        }}
                      >
                        Continue →
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}

      {/* ── STEP 2: Enrolment form ── */}
      {step === STEPS.ENROL && (
        <motion.div
          key="enrol"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.28 }}
        >
          <EnrolmentForm
            preselectedCourse={selectedCourse}
            onSuccess={handleEnrolSuccess}
            onBack={() => setStep(STEPS.SELECT)}
          />
        </motion.div>
      )}

      {/* ── STEP 3: Payment ── */}
      {step === STEPS.PAYMENT && (
        <motion.div
          key="payment"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.28 }}
        >
          <CourseDetails
            course={selectedCourse}
            enrolment={enrolment}
            studentName={studentInfo.name}
            studentEmail={studentInfo.email}
            phone={studentInfo.phone}
            paymentMethod="paystack"
            onBack={() => setStep(STEPS.ENROL)}
            onComplete={handlePaymentComplete}
          />
        </motion.div>
      )}

    </AnimatePresence>
  );
}