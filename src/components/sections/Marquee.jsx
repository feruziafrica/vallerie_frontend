const ITEMS = [
  "Admin Support", "Social Media", "CRM Automation", "Email Management",
  "Project Planning", "Calendar Control", "Content Strategy", "Data Entry",
  "Research", "Client Relations",
];

const Marquee = () => {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div style={{ background: "var(--amber-800)", padding: "20px 0", overflow: "hidden" }}>
      <div className="marquee-track" style={{ display: "flex", gap: 48, whiteSpace: "nowrap", willChange: "transform" }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{ display: "inline-flex", alignItems: "center", gap: 16, fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber-300)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber-400)", flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;