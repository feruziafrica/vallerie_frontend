import { motion } from "framer-motion";
import { useReveal } from "@/hooks";
import ABOUT_IMG from "../../assets/about_img.jpg";
import { useState, useEffect } from "react";

const SKILLS = [
  ["Admin Expert", "4+ yr", "Inbox, calendar, docs"],
  ["Social Media",  "4+ yr", "Strategy & content"],
  ["CRM & Tools",   "4+ yr", "HubSpot, Zapier, etc."],
  ["Project Mgmt",  "3+ yr", "Agile, Waterfall"],
];

const CERTIFICATIONS = ["Google Workspace", "HubSpot CRM", "Asana PM"];

// ── Responsive hook ────────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ── PHOTO AREA ────────────────────────────────────────────────────────────────
const AboutPhoto = ({ inView }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={inView ? { opacity: 1, x: 0 } : {}}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    style={{ position: "relative" }}
  >
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/5",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(120, 53, 15, 0.15)",
          border: "1px solid rgba(180, 83, 9, 0.1)",
        }}
      >
        <img
          src={ABOUT_IMG}
          alt="Vallerie VA"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(20,8,0,0) 0%, rgba(20,8,0,0.08) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Years badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "var(--cream)",
          borderRadius: 12,
          padding: "12px 16px",
          textAlign: "center",
          boxShadow: "0 12px 32px rgba(120, 53, 15, 0.2)",
          border: "1px solid rgba(180, 83, 9, 0.12)",
          zIndex: 10,
        }}
      >
        <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--amber-800)", lineHeight: 1 }}>4+</div>
        <div style={{ fontSize: 10, color: "var(--amber-700)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>Years</div>
      </motion.div>

      {/* Certifications card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          background: "var(--cream)",
          borderRadius: 12,
          padding: "12px 14px",
          boxShadow: "0 12px 32px rgba(120, 53, 15, 0.2)",
          border: "1px solid rgba(180, 83, 9, 0.12)",
          zIndex: 10,
          maxWidth: 130,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--amber-900)", marginBottom: 6, letterSpacing: "0.05em" }}>CERTIFIED</div>
        {CERTIFICATIONS.map((s, idx) => (
          <div key={s} style={{ fontSize: 10, color: "var(--stone-600)", marginBottom: idx !== CERTIFICATIONS.length - 1 ? 4 : 0, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber-700)", flexShrink: 0 }} />
            {s}
          </div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);

// ── ABOUT ─────────────────────────────────────────────────────────────────────
const About = () => {
  const [ref, inView] = useReveal();
  const isMobile = useIsMobile();

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: isMobile ? "72px 24px" : "120px 48px",
        background: "var(--cream)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 48 : 100,
          alignItems: "center",
        }}
      >
        {/* Photo — constrain width on mobile so it doesn't go full screen */}
        <div style={{ maxWidth: isMobile ? 380 : "100%", margin: isMobile ? "0 auto" : 0, width: "100%" }}>
          <AboutPhoto inView={inView} />
        </div>

        {/* Right: copy */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="section-label" style={{ marginBottom: 24, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber-700)" }}>
            About Me
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: isMobile ? "clamp(30px, 8vw, 40px)" : "clamp(36px, 3.5vw, 52px)",
              fontWeight: 600,
              color: "var(--amber-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 28,
            }}
          >
            Hi, I'm{" "}
            <em style={{ color: "var(--amber-600)", fontStyle: "italic" }}>Vallerie</em>{" "}
            —<br />
            Your Strategic<br />
            Business Partner
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--stone-600)", marginBottom: 20, fontWeight: 300 }}>
            With over 4 years of experience supporting executives, entrepreneurs, and fast-growing businesses, I bring structure, strategy, and a calm hand to the chaos of running a modern company.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--stone-600)", marginBottom: 36, fontWeight: 300 }}>
            Based in Nairobi, I work with clients across Africa, Europe, and North America. My approach combines deep technical proficiency with genuine care for your success.
          </p>

          {/* Skill grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 40,
            }}
          >
            {SKILLS.map(([title, exp, sub]) => (
              <div
                key={title}
                style={{
                  padding: "16px 14px",
                  background: "linear-gradient(135deg, rgba(180, 83, 9, 0.05) 0%, rgba(245, 158, 11, 0.03) 100%)",
                  borderRadius: 12,
                  border: "1px solid rgba(180, 83, 9, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(180, 83, 9, 0.1) 0%, rgba(245, 158, 11, 0.06) 100%)";
                  e.currentTarget.style.borderColor = "rgba(180, 83, 9, 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(180, 83, 9, 0.05) 0%, rgba(245, 158, 11, 0.03) 100%)";
                  e.currentTarget.style.borderColor = "rgba(180, 83, 9, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber-900)", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: "var(--amber-700)", fontWeight: 600, marginBottom: 6 }}>{exp}</div>
                <div style={{ fontSize: 12, color: "var(--stone-600)", fontWeight: 400, lineHeight: 1.5 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Buttons — stack on mobile */}
          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <button
              style={{
                padding: "14px 32px",
                background: "var(--amber-800)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(180, 83, 9, 0.2)",
              }}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => { e.target.style.background = "var(--amber-900)"; }}
              onMouseLeave={(e) => { e.target.style.background = "var(--amber-800)"; }}
            >
              Let's Work Together
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              style={{
                padding: "14px 32px",
                background: "transparent",
                color: "var(--amber-800)",
                border: "2px solid var(--amber-200)",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => { e.target.style.background = "rgba(180, 83, 9, 0.08)"; e.target.style.borderColor = "var(--amber-600)"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "var(--amber-200)"; }}
            >
              View Pricing
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;