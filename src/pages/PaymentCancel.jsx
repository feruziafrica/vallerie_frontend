import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentCancel = () => (
  <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: "48px 24px" }}>
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520, width: "100%", textAlign: "center", padding: 60, background: "var(--warm-white)", borderRadius: 24, border: "1px solid var(--amber-200)" }}
    >
      <div style={{ fontSize: 72, marginBottom: 24 }}>↩️</div>
      <h1 className="font-display" style={{ fontSize: 36, fontWeight: 600, color: "var(--amber-900)", marginBottom: 16 }}>
        Payment Cancelled
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--stone-500)", marginBottom: 36 }}>
        No charge was made. If you have questions about pricing or need a custom plan, feel free to reach out directly.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/#pricing" className="btn-primary" style={{ textDecoration: "none" }}>
          View Pricing →
        </Link>
        <Link to="/#contact" className="btn-outline" style={{ textDecoration: "none" }}>
          Contact Me
        </Link>
      </div>
    </motion.div>
  </main>
);

export default PaymentCancel;