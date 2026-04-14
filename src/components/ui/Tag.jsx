/**
 * Tag — small pill label used for service tags, project tags, etc.
 *
 * Props:
 *   children  {string}
 *   variant   "default" | "outline" | "dark"
 *   size      "sm" | "md"
 */
const VARIANTS = {
  default: {
    background: "rgba(180,83,9,0.08)",
    color:      "var(--amber-700)",
    border:     "none",
  },
  outline: {
    background: "transparent",
    color:      "var(--amber-700)",
    border:     "1px solid var(--amber-300)",
  },
  dark: {
    background: "var(--amber-100)",
    color:      "var(--amber-800)",
    border:     "1px solid var(--amber-200)",
  },
};

const SIZES = {
  sm: { fontSize: 11, padding: "3px 10px" },
  md: { fontSize: 12, padding: "5px 14px" },
};

const Tag = ({ children, variant = "default", size = "sm" }) => (
  <span
    style={{
      display:      "inline-block",
      fontWeight:   600,
      letterSpacing:"0.06em",
      borderRadius: 20,
      lineHeight:   1,
      whiteSpace:   "nowrap",
      ...VARIANTS[variant],
      ...SIZES[size],
    }}
  >
    {children}
  </span>
);

export default Tag;