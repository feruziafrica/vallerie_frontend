import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => (
  <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: "48px 24px" }}>
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520, width: "100%", textAlign: "center" }}
    >
      <div className="font-display" style={{ fontSize: 160, fontWeight: 700, color: "var(--amber-200)", lineHeight: 1, marginBottom: 0, userSelect: "none" }}>
        404
      </div>
      <h1 className="font-display" style={{ fontSize: 40, fontWeight: 600, color: "var(--amber-900)", marginBottom: 16, marginTop: -16 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--stone-500)", marginBottom: 40 }}>
        This page doesn't exist. You may have followed a broken link or mistyped the address.
      </p>
      <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>
        Back to Home →
      </Link>
    </motion.div>
  </main>
);

export default NotFound;