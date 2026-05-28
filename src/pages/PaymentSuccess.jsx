import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { verifyPayment } from "@/services/api";  // replaces capturePayPalOrder
import { Spinner } from "@/components/ui";

/**
 * PaymentSuccess
 *
 * Paystack redirects here with ?reference=ENROL-XXXXXX after payment.
 * We call the backend to verify the transaction, then show confirmation.
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("capturing"); // capturing | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Paystack sends ?reference=ENROL-XXX (not ?token= like PayPal)
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    verifyPayment(reference)
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
        } else {
          // Paystack returned but payment wasn't successful
          setStatus("error");
          setMessage(
            `Payment status: ${data.status}. Please contact us if you were charged.`
          );
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [searchParams]);

  // ── UI — identical to before ───────────────────────────────────────────────
  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--cream)", padding: "48px 24px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 520, width: "100%", textAlign: "center", padding: 60,
          background: "var(--warm-white)", borderRadius: 24,
          border: "1px solid var(--amber-200)",
          boxShadow: "0 40px 80px rgba(120,53,15,0.08)",
        }}
      >
        {status === "capturing" && (
          <>
            <Spinner size={40} color="var(--amber-600)" />
            <p style={{ marginTop: 24, fontSize: 16, color: "var(--stone-500)" }}>
              Confirming your payment…
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
            <h1 className="font-display" style={{ fontSize: 40, fontWeight: 600, color: "var(--amber-900)", marginBottom: 16 }}>
              Payment Confirmed!
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--stone-500)", marginBottom: 36 }}>
              Thank you for your payment. I'll be in touch within 4 hours to get
              things started. Check your inbox for a confirmation email.
            </p>
            <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>
              Back to Home →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 72, marginBottom: 24 }}>⚠️</div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 600, color: "var(--amber-900)", marginBottom: 16 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 15, color: "var(--stone-500)", marginBottom: 8 }}>
              {message || "We couldn't confirm your payment. Please contact us directly."}
            </p>
            <p style={{ fontSize: 14, color: "var(--stone-400)", marginBottom: 36 }}>
              Email:{" "}
              <a href="mailto:hello@VFlowMate.co" style={{ color: "var(--amber-600)" }}>
                hello@FlowMate.co
              </a>
            </p>
            <Link to="/" className="btn-outline" style={{ textDecoration: "none" }}>
              Return Home
            </Link>
          </>
        )}
      </motion.div>
    </main>
  );
};

export default PaymentSuccess;