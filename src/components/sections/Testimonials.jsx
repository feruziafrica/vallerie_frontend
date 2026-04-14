import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "@/data";
import { useReveal } from "@/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

const TestimonialCard = ({ testimonial }) => (
  <motion.div
    initial={{ opacity: 0, x: 32 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -32 }}
    transition={{ type: "spring", stiffness: 80, damping: 18 }}
    style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: 14,
      padding: "28px 32px",
      border: "0.5px solid rgba(251,191,36,0.2)",
    }}
  >
    {/* Opening quote */}
    <div
      className="font-display"
      style={{ fontSize: 36, lineHeight: 1, color: "var(--amber-600)", marginBottom: 12, opacity: 0.5, fontFamily: "Georgia, serif" }}
    >
      "
    </div>

    <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--amber-100)", fontWeight: 300, marginBottom: 20, fontStyle: "italic" }}>
      {testimonial.text}
    </p>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Avatar */}
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--amber-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "white", flexShrink: 0 }}>
        {testimonial.avatar}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--amber-100)" }}>{testimonial.name}</div>
        <div style={{ fontSize: 12, color: "var(--amber-400)", marginTop: 1 }}>{testimonial.role}</div>
      </div>

      {/* Stars */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
        {Array(testimonial.rating).fill(0).map((_, j) => (
          <span key={j} style={{ color: "var(--amber-400)", fontSize: 13 }}>★</span>
        ))}
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [ref, inView] = useReveal();

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="testimonials"
      ref={ref}
      style={{ padding: "64px 32px", background: "var(--amber-900)", position: "relative", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
        <SectionHeader
          label="Client Love"
          title={<>Trusted by<br /><em style={{ color: "var(--amber-300)" }}>Industry Leaders</em></>}
          center
          inView={inView}
        />

        {/* Override label colour for dark bg */}
        <style>{`.section-label { color: var(--amber-400) !important; } .section-label::before { background: var(--amber-400) !important; }`}</style>

        {/* Carousel */}
        <div style={{ position: "relative", minHeight: 200 }}>
          <AnimatePresence mode="wait">
            <TestimonialCard key={current} testimonial={TESTIMONIALS[current]} />
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? "var(--amber-400)" : "rgba(251,191,36,0.3)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;