import { motion } from "framer-motion";

/**
 * Spinner — animated loading ring.
 *
 * Props:
 *   size   {number}  diameter in px (default 16)
 *   color  {string}  border colour (default white)
 */
const Spinner = ({ size = 16, color = "white" }) => (
  <motion.span
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    style={{
      display:      "inline-block",
      width:        size,
      height:       size,
      border:       `2px solid ${color}33`,
      borderTopColor: color,
      borderRadius: "50%",
      flexShrink:   0,
    }}
  />
);

export default Spinner;