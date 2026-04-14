import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * useReveal — triggers a one-time in-view animation.
 * Returns [ref, inView] to spread onto a section container.
 *
 * @param {string} margin  - rootMargin offset (default fires 80px before visible)
 */
export const useReveal = (margin = "0px 0px -80px 0px") => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  return [ref, inView];
};