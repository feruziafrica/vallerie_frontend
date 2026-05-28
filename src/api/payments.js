/**
 * src/api/payments.js
 *
 * All payment-related API calls.
 * Uses the shared `api` axios instance from auth.js — same base URL,
 * same auth headers, same interceptors as the rest of the app.
 *
 * REPLACES: src/services/api.js (which used plain fetch + wrong env var)
 */

import { api } from '@/api/auth';

// Payment calls hit external providers (Paystack) and can be slow.
// 30s gives enough headroom for Paystack API latency without leaving
// the user staring at a spinner indefinitely.
const PAYMENT_TIMEOUT = 30_000;

/**
 * createEnrolment — POST /api/payments/enrol/
 * Step 1: validate details and create a pending enrolment before payment.
 *
 * @param {{ student_name, student_email, phone, course, payment_method }} payload
 * @returns {{ id, student_name, student_email, phone, course, status, ... }}
 */
export async function createEnrolment(payload) {
  const { data } = await api.post('/api/payments/enrol/', payload, {
    timeout: PAYMENT_TIMEOUT,
  });
  return data;
}

/**
 * initiatePayment — POST /api/payments/paystack/initiate/
 * Step 2: get the Paystack authorization_url to redirect the student to.
 *
 * @param {number} enrolmentId
 * @param {string} checkoutToken
 * @returns {{ authorization_url, reference, enrolment_id }}
 */
export async function initiatePayment(enrolmentId, checkoutToken) {
  const { data } = await api.post(
    '/api/payments/paystack/initiate/',
    {
      enrolment_id:   enrolmentId,
      checkout_token: checkoutToken,
    },
    { timeout: PAYMENT_TIMEOUT },
  );
  return data;
}

/**
 * verifyPayment — GET /api/payments/paystack/verify/?reference=xxx
 * Step 3: verify after Paystack redirects back to your site.
 *
 * @param {string} reference
 * @returns {{ status, reference, amount, channel, student_name, course_name, ... }}
 */
export async function verifyPayment(reference) {
  const { data } = await api.get('/api/payments/paystack/verify/', {
    params:  { reference },
    timeout: PAYMENT_TIMEOUT,
  });
  return data;
}