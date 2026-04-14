/**
 * services/api.js
 *
 * All HTTP calls to the Django REST backend live here.
 * Components never call fetch() directly — they use these functions.
 *
 * Base URL is read from the VITE_API_BASE env variable so it works
 * in dev (proxied via vite) and in production (real domain).
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
    // Normalise Django REST Framework error shapes into a single message
    const message =
      data?.detail ??
      Object.values(data).flat().join(" ") ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// ── CONTACT ───────────────────────────────────────────────────────────────────

/**
 * submitContact — POST /api/contact/
 * @param {{ name: string, email: string, service: string, message: string }} payload
 */
export async function submitContact(payload) {
  return post("/contact/", payload);
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────

/**
 * createBooking — POST /api/bookings/
 * @param {{ client_name: string, client_email: string, plan: string, start_date: string, notes?: string }} payload
 */
export async function createBooking(payload) {
  return post("/bookings/", payload);
}

// ── M-PESA ────────────────────────────────────────────────────────────────────

/**
 * initiateMpesa — POST /api/payments/mpesa/initiate/
 * Triggers an STK Push to the customer's phone.
 *
 * @param {{ phone_number: string, plan: "starter"|"growth" }} payload
 * @returns {{ message: string, checkout_request_id: string }}
 */
export async function initiateMpesa(payload) {
  return post("/payments/mpesa/initiate/", payload);
}

// ── PAYPAL ────────────────────────────────────────────────────────────────────

/**
 * createPayPalOrder — POST /api/payments/paypal/create-order/
 * @param {{ plan: "starter"|"growth" }} payload
 * @returns {{ order_id: string, approval_url: string }}
 */
export async function createPayPalOrder(payload) {
  return post("/payments/paypal/create-order/", payload);
}

/**
 * capturePayPalOrder — POST /api/payments/paypal/capture/
 * Call this after the user returns from PayPal's approval URL.
 *
 * @param {{ order_id: string }} payload
 * @returns {{ message: string, capture_id: string }}
 */
export async function capturePayPalOrder(payload) {
  return post("/payments/paypal/capture/", payload);
}