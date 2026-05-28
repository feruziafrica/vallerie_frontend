
/**
 * services/api.js
 *
 * All HTTP calls to the Django REST backend live here.
 * Components never call fetch() directly — they use these functions.
 */

const BASE = import.meta.env.VITE_API_BASE ?? "/api";

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function post(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.detail ??
      Object.values(data).flat().join(" ") ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

async function get(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE}${endpoint}${query ? `?${query}` : ''}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.detail ??
      Object.values(data).flat().join(" ") ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// ── CONTACT ───────────────────────────────────────────────────────────────────

export async function submitContact(payload) {
  return post("/contact/", payload);
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────

export async function createBooking(payload) {
  return post("/bookings/", payload);
}

// ── MPESA (legacy — kept for reference) ──────────────────────────────────────

// export async function initiateMpesa(payload) {
//   return post("/payments/mpesa/initiate/", payload);
// }

// ── PAYPAL (legacy — kept for reference) ─────────────────────────────────────

// export async function createPayPalOrder(payload) {
//   return post("/payments/paypal/create-order/", payload);
// }

// export async function capturePayPalOrder(payload) {
//   return post("/payments/paypal/capture/", payload);
// }

// ── PAYSTACK ──────────────────────────────────────────────────────────────────

/**
 * createEnrolment — POST /api/payments/enrol/
 * Step 1: create a pending enrolment before payment.
 *
 * @param {{ student_name, student_email, phone, course, payment_method }} payload
 * @returns {{ id, student_name, student_email, status }}
 */
export async function createEnrolment(payload) {
  return post("/payments/enrol/", payload);
}

/**
 * initiatePayment — POST /api/payments/paystack/initiate/
 * Step 2: get the Paystack authorization_url to redirect the user to.
 *
 * @param {number} enrolmentId
 * @returns {{ authorization_url, reference, enrolment_id }}
 */
export async function initiatePayment(enrolmentId) {
  return post("/payments/paystack/initiate/", { enrolment_id: enrolmentId });
}

/**
 * verifyPayment — GET /api/payments/paystack/verify/?reference=xxx
 * Step 3: verify after Paystack redirects back to your site.
 *
 * @param {string} reference
 * @returns {{ status, reference, amount, channel, customer }}
 */
export async function verifyPayment(reference) {
  return get("/payments/paystack/verify/", { reference });
}