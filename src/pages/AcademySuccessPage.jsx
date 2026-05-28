import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyPayment } from '@/services/api';

/**
 * AcademySuccessPage
 * Route: /academy/success
 * Paystack redirects here with: ?reference={reference}
 */
export default function AcademySuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found. Please try enrolling again.');
      setLoading(false);
      return;
    }

    verifyPayment(reference)
      .then(data => {
        setPaymentData(data);
        setError(null);
      })
      .catch(err => {
        console.error('Payment verification error:', err);
        setError(
          err?.message ||
          'Failed to confirm payment. Please contact support.'
        );
      })
      .finally(() => setLoading(false));
  }, [reference]);

  // Redirect to academy if no reference after load
  useEffect(() => {
    if (!loading && !reference) {
      const timer = setTimeout(() => navigate('/academy'), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, reference, navigate]);

  if (loading)  return <LoadingState />;
  if (error)    return <ErrorState error={error} />;
  return <SuccessState paymentData={paymentData} />;
}

// ── Loading ───────────────────────────────────────────────────────────────────
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white flex items-center justify-center px-5">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <span className="text-3xl">🔐</span>
      </motion.div>
      <p className="text-lg text-stone-600 font-medium">Confirming your payment…</p>
      <p className="text-sm text-stone-400 mt-2">This only takes a moment</p>
    </motion.div>
  </div>
);

// ── Error ─────────────────────────────────────────────────────────────────────
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white flex items-center justify-center px-5">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-10 text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-3xl">⚠️</span>
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-stone-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-stone-600 text-sm mb-6 leading-relaxed">{error}</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-red-900 font-semibold mb-2">Next steps:</p>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• Check your email for any payment confirmations</li>
              <li>• If you were charged, contact support immediately</li>
              <li>• You can try enrolling again when you're ready</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <a href="/academy"
              className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors no-underline text-center text-sm">
              Back to Academy
            </a>
            <a href="/contact"
              className="flex-1 py-3 bg-stone-100 text-stone-900 rounded-lg font-semibold hover:bg-stone-200 transition-colors no-underline text-center text-sm">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// ── Success ───────────────────────────────────────────────────────────────────
const SuccessState = ({ paymentData }) => {
  const whatsappLink = () => {
    const phone   = '+254712345678'; // ← replace with your WhatsApp number
    const message = encodeURIComponent(
      `Hi FlowMate! I just enrolled in ${paymentData?.course_name || 'the course'}. Looking forward to getting started!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-cream py-12 px-5">
      <div className="max-w-2xl mx-auto">

        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <motion.span
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl"
          >
            ✓
          </motion.span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            Payment Confirmed!
          </h1>
          <p className="text-lg text-stone-600">Welcome to the FlowMate Academy 🎉</p>
        </motion.div>

        {/* Payment details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-8"
        >
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
            Enrolment Details
          </p>
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">
            {paymentData?.course_name || 'Your Course'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-amber-50 to-warm-white rounded-xl border border-amber-100 mb-6">
            {[
              { label: 'Student Name',   value: paymentData?.student_name  || '—' },
              { label: 'Email',          value: paymentData?.student_email || '—' },
              { label: 'Amount Paid',    value: paymentData?.amount        || '—' },
              { label: 'Reference',      value: paymentData?.reference     || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-stone-500 uppercase font-semibold mb-1">{label}</p>
                <p className="text-sm font-semibold text-stone-900 break-all">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Payment Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <span>●</span> Confirmed
              </div>
            </div>
          </div>

          {/* Email reminder */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-1">📧 Check your email</p>
            <p className="text-sm text-blue-800">
              Login credentials have been sent to{' '}
              <strong>{paymentData?.student_email}</strong>.
              Check your inbox and spam folder.
            </p>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 text-center">
            What happens next?
          </h3>
          <div className="space-y-4">
            {[
              { step: '1', icon: '✓',  title: 'Payment verified',       desc: 'Your payment has been confirmed by Paystack.' },
              { step: '2', icon: '👤', title: 'Account setup',          desc: 'We will send your login details to your email within 24 hours.' },
              { step: '3', icon: '🎓', title: 'Start learning',         desc: 'Log in via the Student Login button in the navbar and begin your course.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="flex gap-4 p-6 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-amber-600">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-stone-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-stone-600">{item.desc}</p>
                </div>
                <span className="text-2xl">{item.icon}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <a
            href={whatsappLink()}
            target="_blank" rel="noopener noreferrer"
            className="w-full block p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow text-center no-underline"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span>💬</span> Chat with FlowMate on WhatsApp
            </div>
            <p className="text-sm opacity-90">Questions? We're here to help!</p>
          </a>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-8"
        >
          <h3 className="font-display text-xl font-bold text-stone-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {[
              { q: 'When will I get my login credentials?',
                a: 'Your login details will be sent within 24 hours. Check your spam folder too.' },
              { q: 'Can I access the course immediately?',
                a: 'Access is granted after account approval by our team — usually within 24 hours.' },
              { q: 'What if I forgot my password?',
                a: 'Use the "Forgot Password" link on the student login page to reset it.' },
              { q: 'Is there a money-back guarantee?',
                a: "Yes — we offer a 7-day money-back guarantee if you're not satisfied." },
            ].map((item, idx) => (
              <details key={idx} className="group border border-stone-200 rounded-lg overflow-hidden">
                <summary className="p-4 cursor-pointer font-semibold text-stone-900 hover:bg-amber-50 flex items-center justify-between text-sm">
                  {item.q}
                  <span className="group-open:rotate-180 transition-transform text-stone-400">▼</span>
                </summary>
                <div className="p-4 border-t border-stone-200 bg-stone-50">
                  <p className="text-sm text-stone-600">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href="/"
            className="flex-1 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors no-underline text-center">
            Back to Home
          </a>
          <a href="/contact"
            className="flex-1 py-4 bg-white text-amber-600 font-semibold border-2 border-amber-600 rounded-lg hover:bg-amber-50 transition-colors no-underline text-center">
            Contact Support
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center text-sm text-stone-500 mt-8"
        >
          🔒 Your data is secure. We never share your information with third parties.
        </motion.p>

      </div>
    </div>
  );
};






















// import { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { confirmStripePayment, getPaymentStatus } from '@/api/payments';

// /**
//  * Success Page after payment
//  * Route: /academy/success
//  * Query params: ?session_id={id} (Stripe) or ?enrolment_id={id} (M-Pesa)
//  */
// export default function AcademySuccessPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);

//   const sessionId = searchParams.get('session_id');
//   const enrolmentId = searchParams.get('enrolment_id');

//   // Fetch payment confirmation
//   useEffect(() => {
//     const confirmPayment = async () => {
//       try {
//         setLoading(true);

//         let data;

//         if (sessionId) {
//           // Stripe payment
//           data = await confirmStripePayment(sessionId);
//         } else if (enrolmentId) {
//           // M-Pesa payment
//           data = await getPaymentStatus(enrolmentId);
//         } else {
//           setError('No payment session found. Please try enrolling again.');
//           setLoading(false);
//           return;
//         }

//         setPaymentData(data);
//         setError(null);
//       } catch (err) {
//         console.error('Payment confirmation error:', err);
//         setError(
//           err.response?.data?.error ||
//           'Failed to confirm payment. Please contact support.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     confirmPayment();
//   }, [sessionId, enrolmentId]);

//   // Redirect if no valid params
//   useEffect(() => {
//     if (!loading && !sessionId && !enrolmentId) {
//       const timer = setTimeout(() => navigate('/academy'), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [loading, sessionId, enrolmentId, navigate]);

//   if (loading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return <ErrorState error={error} />;
//   }

//   return (
//     <SuccessState paymentData={paymentData} />
//   );
// }

// /**
//  * Loading State
//  */
// const LoadingState = () => (
//   <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white flex items-center justify-center px-5">
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="text-center"
//     >
//       <motion.div
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ duration: 1.5, repeat: Infinity }}
//         className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
//       >
//         <span className="text-3xl">💳</span>
//       </motion.div>
//       <p className="text-lg text-stone-600 font-medium">
//         Confirming your payment…
//       </p>
//     </motion.div>
//   </div>
// );

// /**
//  * Error State
//  */
// const ErrorState = ({ error }) => (
//   <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white flex items-center justify-center px-5">
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.4 }}
//       className="max-w-md w-full"
//     >
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         {/* Error header */}
//         <div className="p-8 md:p-10 text-center">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ duration: 0.4, delay: 0.1 }}
//             className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
//           >
//             <span className="text-3xl">⚠️</span>
//           </motion.div>

//           <h1 className="font-display text-2xl font-bold text-stone-900 mb-3">
//             Something went wrong
//           </h1>

//           <p className="text-stone-600 text-sm mb-6 leading-relaxed">
//             {error}
//           </p>

//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//             <p className="text-xs text-red-900 text-left">
//               <strong>Next steps:</strong>
//               <ul className="mt-2 space-y-1">
//                 <li>• Check your email for any payment confirmations</li>
//                 <li>• If you were charged, contact support immediately</li>
//                 <li>• You can try enrolling again when you're ready</li>
//               </ul>
//             </p>
//           </div>

//           <div className="flex gap-3">
//             <a
//               href="/academy"
//               className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors no-underline text-center"
//             >
//               Back to Academy
//             </a>
//             <a
//               href="/contact"
//               className="flex-1 py-3 bg-stone-100 text-stone-900 rounded-lg font-semibold hover:bg-stone-200 transition-colors no-underline text-center"
//             >
//               Contact Support
//             </a>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   </div>
// );

// /**
//  * Success State
//  */
// const SuccessState = ({ paymentData }) => {
//   const getWhatsAppLink = () => {
//     const phone = '+254712345678'; // Replace with your WhatsApp number
//     const message = encodeURIComponent(
//       `Hi FlowMate! I just enrolled in ${paymentData?.courseName || 'the course'}. Looking forward to getting started!`
//     );
//     return `https://wa.me/${phone}?text=${message}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-cream py-12 px-5">
//       <div className="max-w-2xl mx-auto">
//         {/* Animated checkmark */}
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
//           className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8"
//         >
//           <motion.span
//             initial={{ rotate: -180, opacity: 0 }}
//             animate={{ rotate: 0, opacity: 1 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="text-5xl"
//           >
//             ✓
//           </motion.span>
//         </motion.div>

//         {/* Main heading */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="text-center mb-12"
//         >
//           <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">
//             Payment Confirmed!
//           </h1>
//           <p className="text-lg text-stone-600">
//             Welcome to the FlowMate Academy
//           </p>
//         </motion.div>

//         {/* Payment details card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-8"
//         >
//           {/* Course info */}
//           <div className="mb-8">
//             <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
//               Enrollment Details
//             </p>
//             <h2 className="font-display text-2xl font-bold text-stone-900 mb-4">
//               {paymentData?.courseName || 'Your Course'}
//             </h2>

//             {/* Details grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-amber-50 to-warm-white rounded-xl border border-amber-100">
//               <div>
//                 <p className="text-xs text-stone-500 uppercase font-semibold mb-2">
//                   Student Name
//                 </p>
//                 <p className="text-base font-semibold text-stone-900">
//                   {paymentData?.studentName || 'Student'}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs text-stone-500 uppercase font-semibold mb-2">
//                   Email
//                 </p>
//                 <p className="text-base font-semibold text-stone-900 break-all">
//                   {paymentData?.studentEmail}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs text-stone-500 uppercase font-semibold mb-2">
//                   Amount Paid
//                 </p>
//                 <p className="text-base font-semibold text-amber-600">
//                   {paymentData?.amount || '—'}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs text-stone-500 uppercase font-semibold mb-2">
//                   Payment Status
//                 </p>
//                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
//                   <span>●</span>
//                   Confirmed
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Email reminder */}
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <p className="text-sm text-blue-900">
//               <strong>📧 Check your email</strong>
//             </p>
//             <p className="text-sm text-blue-800 mt-2">
//               We've sent your login credentials to <strong>{paymentData?.studentEmail}</strong>. 
//               Check your inbox (and spam folder) for your welcome email.
//             </p>
//           </div>
//         </motion.div>

//         {/* What happens next section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.4 }}
//           className="mb-8"
//         >
//           <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 text-center">
//             What happens next?
//           </h3>

//           <div className="space-y-4">
//             {[
//               {
//                 step: '1',
//                 title: 'We confirm your payment',
//                 desc: 'Within 24 hours, our team will verify your payment and activate your account.',
//                 icon: '✓',
//               },
//               {
//                 step: '2',
//                 title: 'Create your student account',
//                 desc: 'We will send your login details to your email with a temporary password.',
//                 icon: '👤',
//               },
//               {
//                 step: '3',
//                 title: 'Start learning',
//                 desc: 'Log in via the Student Login button in the navbar and begin your course immediately.',
//                 icon: '🎓',
//               },
//             ].map((item, idx) => (
//               <motion.div
//                 key={idx}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
//                 className="flex gap-4 p-6 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all"
//               >
//                 <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xl font-bold text-amber-600">{item.step}</span>
//                 </div>

//                 <div className="flex-1">
//                   <h4 className="font-bold text-stone-900 mb-1">{item.title}</h4>
//                   <p className="text-sm text-stone-600">{item.desc}</p>
//                 </div>

//                 <span className="text-2xl">{item.icon}</span>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* WhatsApp CTA */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.6 }}
//           className="mb-8"
//         >
//           <a
//             href={getWhatsAppLink()}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="w-full block p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow text-center no-underline"
//           >
//             <div className="flex items-center justify-center gap-2">
//               <span>💬</span>
//               Chat with FlowMate on WhatsApp
//             </div>
//             <p className="text-sm mt-1 opacity-90">
//               Questions? We're here to help!
//             </p>
//           </a>
//         </motion.div>

//         {/* FAQ Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.7 }}
//           className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
//         >
//           <h3 className="font-display text-xl font-bold text-stone-900 mb-6">
//             Frequently Asked Questions
//           </h3>

//           <div className="space-y-4">
//             {[
//               {
//                 q: 'When will I get my login credentials?',
//                 a: 'Your login details will be sent within 24 hours after payment confirmation. Make sure to check your spam folder.',
//               },
//               {
//                 q: 'Can I access the course immediately?',
//                 a: 'You can access the course after your account is approved by our team (usually within 24 hours).',
//               },
//               {
//                 q: 'What if I forgot my password?',
//                 a: 'You can reset your password using the "Forgot Password" link on the student login page.',
//               },
//               {
//                 q: 'Is there a money-back guarantee?',
//                 a: 'Yes! We offer a 7-day money-back guarantee if you\'re not satisfied with the course.',
//               },
//             ].map((item, idx) => (
//               <details
//                 key={idx}
//                 className="group border border-stone-200 rounded-lg overflow-hidden"
//               >
//                 <summary className="p-4 cursor-pointer font-semibold text-stone-900 hover:bg-amber-50 flex items-center justify-between">
//                   {item.q}
//                   <span className="group-open:rotate-180 transition-transform">▼</span>
//                 </summary>
//                 <div className="p-4 border-t border-stone-200 bg-stone-50">
//                   <p className="text-sm text-stone-600">{item.a}</p>
//                 </div>
//               </details>
//             ))}
//           </div>
//         </motion.div>

//         {/* CTA Buttons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.8 }}
//           className="mt-8 flex flex-col sm:flex-row gap-4"
//         >
//           <a
//             href="/"
//             className="flex-1 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors no-underline text-center"
//           >
//             Back to Home
//           </a>
//           <a
//             href="/contact"
//             className="flex-1 py-4 bg-white text-amber-600 font-semibold border-2 border-amber-600 rounded-lg hover:bg-amber-50 transition-colors no-underline text-center"
//           >
//             Contact Support
//           </a>
//         </motion.div>

//         {/* Trust message */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.9 }}
//           className="text-center text-sm text-stone-500 mt-8"
//         >
//           🔒 Your data is secure. We never share your information with third parties.
//         </motion.p>
//       </div>
//     </div>
//   );
// }