import { useState, useEffect } from "react";

const FOOTER_LINKS = [
  ["Services", ["Admin Support", "Social Media", "Email & Calendar", "Project Mgmt", "CRM & Automation"]],
  ["Company",  ["About Me", "Portfolio", "Testimonials", "Pricing", "Blog"]],
  ["Legal",    ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"]],
];

const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

const Footer = () => {
  const width = useWindowWidth();

  const isMobile  = width <= 520;
  const isTablet  = width > 520 && width <= 900;
  const isDesktop = width > 900;

  const footerPadding = isMobile ? "40px 20px 24px" : isTablet ? "48px 28px 28px" : "64px 48px 32px";

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr 1fr 1fr",
    gap: isMobile ? 32 : isTablet ? 40 : 60,
    marginBottom: 60,
  };

  return (
    <footer style={{ background: "var(--stone-900)", padding: footerPadding, color: "var(--stone-400)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={gridStyle}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: "var(--amber-500)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" />
                </svg>
              </div>
              <span className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "var(--amber-100)" }}>
                Vallerie<span style={{ color: "var(--amber-400)" }}>VA</span>
              </span>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--stone-500)", maxWidth: 260, marginBottom: 24 }}>
              Premium virtual assistant services for executives and fast-growing businesses. Nairobi, Kenya.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              {["in", "tw", "ig"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{ width: 36, height: 36, background: "var(--stone-800)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--stone-400)", textDecoration: "none", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--amber-600)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--stone-800)"; e.currentTarget.style.color = "var(--stone-400)"; }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--stone-300)", marginBottom: 20 }}>
                {title}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map((l) => (
                  <li key={l} style={{ marginBottom: 10 }}>
                    <a
                      href="#"
                      style={{ fontSize: 14, color: "var(--stone-500)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--amber-300)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--stone-500)"; }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div style={{ borderTop: "1px solid var(--stone-800)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--stone-600)", margin: 0 }}>© 2026 SkillScript Academy. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "var(--stone-600)", margin: 0 }}>Payments secured by M-Pesa & PayPal · SSL Encrypted</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;