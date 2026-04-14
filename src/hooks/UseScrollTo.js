import { useCallback } from "react";

/**
 * useScrollTo — returns a stable scrollTo(id) function.
 * Optional onBeforeScroll callback (e.g. to close the mobile menu).
 *
 * Usage:
 *   const scrollTo = useScrollTo(() => setMenuOpen(false));
 *   <button onClick={() => scrollTo("contact")}>Contact</button>
 */
export function useScrollTo(onBeforeScroll) {
  return useCallback(
    (id) => {
      onBeforeScroll?.();
      const el = document.getElementById(id.toLowerCase());
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [onBeforeScroll]
  );
}