import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/data";

// ── STYLES ────────────────────────────────────────────────────────────────────
const NAV_STYLES = `
  .nav-desktop   { display: flex; }
  .nav-hamburger { display: none; }

  @media (max-width: 768px) {
    .nav-desktop   { display: none !important; }
    .nav-hamburger { display: flex !important; }
  }
`;

// ── LOGO ──────────────────────────────────────────────────────────────────────
const Logo = ({ menuOpen }) => (
  <a
    href="#"
    onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
    style={{ textDecoration: "none", zIndex: 1101, position: "relative" }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 40, height: 40,
        background: menuOpen ? "var(--amber-400)" : "var(--amber-600)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.3s",
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" />
        </svg>
      </div>
      <span className="font-display" style={{
        fontSize: 26, fontWeight: 600,
        color: menuOpen ? "#fff" : "var(--amber-900)",
        letterSpacing: "0.01em",
        transition: "color 0.3s",
      }}>
        Amara<span style={{ color: menuOpen ? "var(--amber-300)" : "var(--amber-500)" }}>VA</span>
      </span>
    </div>
  </a>
);

// ── DESKTOP LINKS ─────────────────────────────────────────────────────────────
const DesktopLinks = ({ scrollTo }) => (
  <div className="nav-desktop" style={{ alignItems: "center", gap: 32 }}>
    {NAV_LINKS.map((l) => (
      <button
        key={l}
        onClick={() => scrollTo(l)}
        style={{
          background: "none", border: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 500,
          color: "var(--stone-600)",
          letterSpacing: "0.02em",
          padding: "4px 0",
          position: "relative", cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.querySelector(".nl").style.width = "100%"; }}
        onMouseLeave={(e) => { e.currentTarget.querySelector(".nl").style.width = "0%"; }}
      >
        {l}
        <span className="nl" style={{ position: "absolute", bottom: -2, left: 0, height: 1.5, width: "0%", background: "var(--amber-500)", transition: "width 0.25s", borderRadius: 2 }} />
      </button>
    ))}
    <button
      className="btn-primary"
      onClick={() => scrollTo("Contact")}
      style={{ padding: "9px 20px", fontSize: 13 }}
    >
      Hire Me
    </button>
  </div>
);

// ── HAMBURGER ─────────────────────────────────────────────────────────────────
const Hamburger = ({ open, onToggle }) => (
  <button
    className="nav-hamburger"
    onClick={onToggle}
    aria-label={open ? "Close menu" : "Open menu"}
    style={{
      background: "none", border: "none",
      width: 40, height: 40,
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 5, cursor: "pointer",
      zIndex: 1101, position: "relative", flexShrink: 0,
    }}
  >
    <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
      style={{ display: "block", width: 22, height: 2, background: open ? "#fff" : "var(--amber-800)", borderRadius: 2, transformOrigin: "center" }} />
    <motion.span animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
      style={{ display: "block", width: 16, height: 2, background: open ? "#fff" : "var(--amber-800)", borderRadius: 2, transformOrigin: "center" }} />
    <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
      style={{ display: "block", width: 22, height: 2, background: open ? "#fff" : "var(--amber-800)", borderRadius: 2, transformOrigin: "center" }} />
  </button>
);

// ── MOBILE DROPDOWN ───────────────────────────────────────────────────────────
// Small, elegant dropdown from the top-right — NOT full screen
const MobileMenu = ({ open, scrollTo }) => (
  <AnimatePresence>
    {open && (
      <>
        {/* Dim backdrop — closes menu on tap outside */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => scrollTo(null)}
          style={{
            position: "fixed", inset: 0,
            zIndex: 1040,
            background: "rgba(0,0,0,0.25)",
          }}
        />

        {/* Dropdown panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: 64,
            left: 16,
            right: 16,
            zIndex: 1045,
            background: "rgba(255, 253, 249, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 16,
            border: "1px solid rgba(180, 83, 9, 0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
            padding: "8px 0",
          }}
        >
          {/* Nav items */}
          {NAV_LINKS.map((l, i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <button
                onClick={() => scrollTo(l)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "13px 20px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--stone-700)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s, color 0.15s",
                  borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(180,83,9,0.06)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(180,83,9,0.04)";
                  e.currentTarget.style.color = "var(--amber-700)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "var(--stone-700)";
                }}
              >
                <span>{l}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.3 }}>
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          ))}

          {/* CTA */}
          <div style={{ padding: "10px 16px 6px" }}>
            <button
              className="btn-primary"
              onClick={() => scrollTo("Contact")}
              style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "12px" }}
            >
              Hire Me →
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── NAV ───────────────────────────────────────────────────────────────────────
const Nav = ({ menuOpen, setMenuOpen }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const fn = () => setMenuOpen(false);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [menuOpen, setMenuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (!id) return;
    setTimeout(() => {
      const el = document.getElementById(id.toLowerCase());
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  return (
    <>
      <style>{NAV_STYLES}</style>

      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: 1050,
          padding: scrolled ? "12px 48px" : "20px 48px",
          background: scrolled
            ? "rgba(250,247,242,0.96)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(253,230,138,0.25)" : "none",
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Logo menuOpen={menuOpen} />
        <DesktopLinks scrollTo={scrollTo} />
        <Hamburger open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      </motion.nav>

      <MobileMenu open={menuOpen} scrollTo={scrollTo} />
    </>
  );
}; 

export default Nav;