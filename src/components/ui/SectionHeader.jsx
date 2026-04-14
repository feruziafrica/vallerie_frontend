import { motion } from "framer-motion";

/**
 * SectionHeader — reusable eyebrow label + headline block.
 *
 * Props:
 *   label     {string}  - small caps eyebrow text
 *   title     {JSX}     - main headline (can include <em>, <br /> etc.)
 *   center    {boolean} - centres everything (default false = left-aligned)
 *   inView    {boolean} - drives entrance animation
 *   maxWidth  {number}  - optional cap on headline width
 */
const SectionHeader = ({ label, title, center = false, inView, maxWidth }) => (
  <div style={{ textAlign: center ? "center" : "left", marginBottom: 72 }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="section-label"
      style={{ justifyContent: center ? "center" : "flex-start", marginBottom: 20 }}
    >
      {label}
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="font-display"
      style={{
        fontSize: "clamp(36px, 4vw, 56px)",
        fontWeight: 600,
        color: "var(--amber-900)",
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        maxWidth: maxWidth ?? "none",
        margin: center ? "0 auto" : undefined,
      }}
    >
      {title}
    </motion.h2>
  </div>
);

export default SectionHeader;