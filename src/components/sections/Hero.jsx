import HERO_BG_IMAGE from "../../assets/background_img.jpg";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "254704060364";
const WA_MESSAGE = encodeURIComponent(
  "I'm interested in knowing about your VA services"
);
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WA_MESSAGE}`;


// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 16 } },
};

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = () => (
  <div style={{ display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#92400e">
        <path d="M7 1l1.5 4H13L9.5 8l1.5 4-4-2.5L3 12l1.5-4L1 5h4.5z" />
      </svg>
    ))}
  </div>
);

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      v = Math.min(v + step, to);
      setVal(v);
      if (v >= to) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [to]);
  return <span>{val}{suffix}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP FLOATING BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const WhatsAppButton = () => (
  <motion.a
    href={WA_LINK}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.6, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 2.2, type: "spring", stiffness: 90 }}
    whileHover={{ scale: 1.07 }}
    whileTap={{ scale: 0.95 }}
    title="Chat on WhatsApp"
    style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      background: "#25D366", borderRadius: 50,
      padding: "13px 22px 13px 16px",
      boxShadow: "0 8px 32px rgba(37,211,102,0.38), 0 2px 8px rgba(0,0,0,0.12)",
      textDecoration: "none", color: "#fff",
      fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
    }}
  >
    <motion.span
      animate={{ scale: [1, 1.65], opacity: [0.45, 0] }}
      transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute", inset: 0, borderRadius: 50,
        border: "2px solid #25D366", pointerEvents: "none",
      }}
    />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
    <span>Chat with me</span>
  </motion.a>
);

// ─────────────────────────────────────────────────────────────────────────────
// HERO — WITH BACKGROUND IMAGE & WIDER HEADLINE
// ─────────────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <>
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        {/* ── BACKGROUND IMAGE WITH OVERLAY ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO_BG_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            zIndex: 0,
          }}
        />

        {/* ── OVERLAY: Gradient blend to cream from bottom ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(250,247,242,0.6) 0%, rgba(250,247,242,0.54) 50%, rgba(250,247,242,0.62) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* ── Additional soft overlay for depth ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(180, 83, 9, 0.03) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* ── CENTERED CONTENT CONTAINER ── */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 48px",
            width: "100%",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: "100%" }}
          >
            {/* Section Label */}
            <motion.div
              variants={itemVariants}
              className="section-label"
              style={{
                marginBottom: 28,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#B4530E",
              }}
            >
              Vallerie Virtual Assistant Services
            </motion.div>

            {/* Main Headline — 2-3 Lines for Wider Display */}
            <motion.h1
              variants={itemVariants}
              className="font-display"
              style={{
                fontSize: "clamp(48px, 7.5vw, 80px)",
                fontWeight: 700,
                lineHeight: 1.00,
                letterSpacing: "-0.03em",
                color: "#3F1C0C",
                marginBottom: 32,
                fontFamily: "var(--font-display, serif)",
                maxWidth: "100%",
              }}
            >
              Your Trusted Virtual Assistant
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #B4530E 0%, #92400E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 700,
                  display: "block",
                }}
              >
                for Seamless Productivity
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              style={{
                fontSize: 18,
                lineHeight: 1.75,
                color: "#5A4640",
                maxWidth: 640,
                margin: "0 auto 36px",
                fontWeight: 300,
              }}
            >
              I handle the complexity so you can focus on what matters most.
              Specialising in elite executive support, social media, and business automation.
            </motion.p>

            {/* Trust Strip */}
            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: "13px 20px",
                background: "rgba(180, 83, 9, 0.12)",
                borderRadius: 14,
                border: "1px solid rgba(180, 83, 9, 0.2)",
                width: "fit-content",
                margin: "0 auto 44px",
                backdropFilter: "blur(8px)",
              }}
            >
              <Stars />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>4.9/5</span>
              <span
                style={{
                  width: 1,
                  height: 16,
                  background: "rgba(180, 83, 9, 0.2)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 13, color: "#6B5D52", fontWeight: 400 }}>
                From 80+ verified clients
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 52 }}
            >
              <button
                onClick={() => scrollTo("contact")}
                style={{
                  padding: "14px 36px",
                  background: "#B4530E",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(180, 83, 9, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#92400E";
                  e.target.style.boxShadow = "0 6px 20px rgba(180, 83, 9, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#B4530E";
                  e.target.style.boxShadow = "0 4px 16px rgba(180, 83, 9, 0.25)";
                }}
              >
                Get Started
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => scrollTo("portfolio")}
                style={{
                  padding: "14px 36px",
                  background: "rgba(255, 255, 255, 0.7)",
                  color: "#B4530E",
                  border: "2px solid #B4530E",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.95)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.7)";
                }}
              >
                View Work
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                gap: 36,
                justifyContent: "center",
                borderTop: "1px solid rgba(180, 83, 9, 0.15)",
                paddingTop: 36,
                flexWrap: "wrap",
              }}
            >
              {[["3+", "Years Exp."], ["98%", "Satisfaction"], ["15+", "Projects"], ["⚡2h", "Response"]].map(([n, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#B4530E",
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8B7B72",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            opacity,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "#8B7B72",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 2,
                height: 28,
                background: "linear-gradient(to bottom, #B4530E, transparent)",
              }}
            />
          </div>
        </motion.div>
      </section>

      <WhatsAppButton />
    </>
  );
};

export default Hero;