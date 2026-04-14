import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Layout
import { Nav, Footer } from "@/components/layout";

// Sections
import {
  Hero, Marquee, Services, Portfolio,
  Pricing, Testimonials, About, Contact,
} from "@/components/sections";

// Pages
import NotFound       from "@/pages/NotFound";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel  from "@/pages/PaymentCancel";

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <motion.div
    exit={{ opacity: 0, y: -100 }}
    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    style={{
      position: "fixed", inset: 0,
      background: "var(--amber-900)",
      zIndex: 99999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <span className="font-display" style={{ fontSize: 52, fontWeight: 700, color: "var(--amber-300)" }}>
        AmaraVA
      </span>
    </motion.div>
  </motion.div>
);

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
const HomePage = () => (
  <main>
    <Hero />
    <Marquee />
    <Services />
    <Portfolio />
    <Pricing />
    <Testimonials />
    <About />
    <Contact />
  </main>
);

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!loaded && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <Routes>
        <Route path="/"                element={<HomePage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel"  element={<PaymentCancel />} />
        <Route path="*"                element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}