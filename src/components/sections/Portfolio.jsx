import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "@/data";
import { useReveal } from "@/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

// ── RESPONSIVE STYLES ─────────────────────────────────────────────────────────
const PORTFOLIO_STYLES = `
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    grid-auto-rows: 260px;
  }

  .portfolio-card-span-2 { grid-column: span 2; }
  .portfolio-card-span-1 { grid-column: span 1; }

  @media (max-width: 1024px) {
    .portfolio-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 240px;
    }
    .portfolio-card-span-2 { grid-column: span 2; }
    .portfolio-card-span-1 { grid-column: span 1; }
  }

  @media (max-width: 640px) {
    .portfolio-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
    }
    .portfolio-card-span-2 { grid-column: span 1; }
    .portfolio-card-span-1 { grid-column: span 1; }
    .portfolio-card { min-height: 180px; }
  }

  .portfolio-section {
    padding: 120px 48px;
  }

  @media (max-width: 768px) {
    .portfolio-section { padding: 80px 20px; }
  }

  .modal-inner {
    padding: 48px;
  }
  @media (max-width: 480px) {
    .modal-inner { padding: 28px 20px; }
  }
`;

// ── PROJECT MODAL ─────────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.93, y: 32, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.93, y: 32, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="modal-inner"
      style={{
        background: "var(--warm-white)",
        borderRadius: 20,
        maxWidth: 560,
        width: "calc(100% - 32px)",
        maxHeight: "88vh",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "var(--amber-100)",
          border: "none",
          width: 32, height: 32,
          borderRadius: "50%",
          fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--amber-800)", fontWeight: 700,
          flexShrink: 0,
        }}
      >
        ×
      </button>

      <div style={{ fontSize: 52, marginBottom: 16 }}>{project.thumb}</div>

      <h3
        className="font-display"
        style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 600, color: "var(--amber-900)", marginBottom: 12, lineHeight: 1.2 }}
      >
        {project.title}
      </h3>

      <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--stone-600)", marginBottom: 16 }}>
        {project.desc}
      </p>

      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--stone-500)", marginBottom: 24 }}>
        This project involved close collaboration with the client to understand their unique needs and deliver tailored solutions. Key deliverables included detailed documentation, regular progress updates, and measurable KPIs throughout the engagement.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {project.tags.map((t) => (
          <span
            key={t}
            style={{ fontSize: 12, fontWeight: 600, padding: "5px 14px", background: "var(--amber-100)", color: "var(--amber-700)", borderRadius: 20, border: "1px solid var(--amber-200)" }}
          >
            {t}
          </span>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={() => { onClose(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
      >
        Start a Similar Project →
      </button>
    </motion.div>
  </motion.div>
);

// ── PROJECT CARD ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, index, inView, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay: 0.08 + index * 0.07 }}
    className={`card-hover portfolio-card portfolio-card-span-${project.span}`}
    onClick={onClick}
    style={{
      background: project.color,
      borderRadius: 16,
      padding: "28px 24px",
      border: "1px solid rgba(180,83,9,0.07)",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 180,
    }}
  >
    {/* Emoji */}
    <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>{project.thumb}</div>

    <div>
      <h3
        className="font-display"
        style={{ fontSize: "clamp(17px, 2.5vw, 21px)", fontWeight: 600, color: "var(--amber-900)", marginBottom: 6, lineHeight: 1.25 }}
      >
        {project.title}
      </h3>

      <p style={{
        fontSize: 13, color: "var(--stone-500)", lineHeight: 1.6, marginBottom: 12,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {project.desc}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {project.tags.map((t) => (
          <span
            key={t}
            style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", background: "rgba(180,83,9,0.07)", color: "var(--amber-700)", borderRadius: 20 }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>

    {/* Arrow */}
    <div style={{
      position: "absolute", bottom: 16, right: 16,
      width: 32, height: 32,
      background: "var(--amber-600)",
      borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M3 11L11 3M11 3H5M11 3v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </motion.div>
);

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
const Portfolio = () => {
  const [selected, setSelected] = useState(null);
  const [ref, inView] = useReveal();

  return (
    <section id="portfolio" ref={ref} className="portfolio-section" style={{ background: "var(--cream)" }}>
      <style>{PORTFOLIO_STYLES}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="Selected Work"
          title={<>Results That<br /><em style={{ color: "var(--amber-600)" }}>Speak for Themselves</em></>}
          inView={inView}
          maxWidth={520}
        />

        <div className="portfolio-grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              inView={inView}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;