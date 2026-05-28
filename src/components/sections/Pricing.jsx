import { motion } from "framer-motion";
import { PLANS } from "@/data";
import { useReveal } from "@/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

const TRUST_BADGES = [
  "✅ No Hidden Fees",
  "📅 Free Discovery Call",
  "🌍 Remote-Ready VAs",
  "⚡ 2-Hour Response Time",
];

// Build a Google Calendar "new event" URL pre-filled with plan details
const buildCalendarLink = (plan) => {
  const title = encodeURIComponent(`Discovery Call — ${plan.name} Plan`);
  const details = encodeURIComponent(
    `Hi! I'm interested in the ${plan.name} plan (${plan.price}${plan.period ? " " + plan.period : ""}).\n\nFeatures I'm looking for:\n${plan.features.map((f) => `• ${f}`).join("\n")}`
  );
  return `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${details}`;
};

// ── PLAN CARD ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, inView }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ delay: 0.15 + index * 0.1 }}
    className="plan-card"
    data-featured={plan.featured ? "true" : undefined}
    style={{
      borderRadius: 24,
      position: "relative",
      overflow: "hidden",
      background: plan.featured ? "var(--amber-800)" : "var(--cream)",
      border: plan.featured ? "none" : "1px solid var(--amber-200)",
      boxShadow: plan.featured ? "0 40px 80px rgba(120,53,15,0.3)" : "none",
    }}
  >
    {plan.featured && (
      <div style={{
        position: "absolute", top: 20, right: 20,
        background: "var(--amber-400)", color: "var(--amber-900)",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        padding: "4px 12px", borderRadius: 20, textTransform: "uppercase",
      }}>
        Best Value
      </div>
    )}

    {/* Plan name + price */}
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 18, fontWeight: 600, marginBottom: 8,
        color: plan.featured ? "var(--amber-100)" : "var(--amber-900)",
      }}>
        {plan.name}
      </h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
        <span
          className="font-display plan-card__price"
          style={{
            fontWeight: 700, lineHeight: 1,
            color: plan.featured ? "var(--amber-300)" : "var(--amber-700)",
          }}
        >
          {plan.price}
        </span>
        <span style={{ fontSize: 15, color: plan.featured ? "var(--amber-400)" : "var(--stone-400)" }}>
          {plan.period}
        </span>
      </div>
      <p style={{
        fontSize: 14, lineHeight: 1.6,
        color: plan.featured ? "var(--amber-300)" : "var(--stone-500)",
      }}>
        {plan.desc}
      </p>
    </div>

    {/* Feature list */}
    <div style={{ marginBottom: 32 }}>
      {plan.features.map((f) => (
        <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: plan.featured ? "var(--amber-400)" : "var(--amber-100)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11,
            color: plan.featured ? "var(--amber-900)" : "var(--amber-700)",
          }}>✓</span>
          <span style={{ fontSize: 14, color: plan.featured ? "var(--amber-200)" : "var(--stone-600)" }}>
            {f}
          </span>
        </div>
      ))}
    </div>

    {/* Book a Call CTA */}
    <a
      href={buildCalendarLink(plan)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "12px 20px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        textDecoration: "none",
        boxSizing: "border-box",
        cursor: "pointer",
        transition: "opacity 0.2s",
        background: plan.featured ? "var(--amber-400)" : "var(--amber-600)",
        color: plan.featured ? "var(--amber-900)" : "white",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {/* Calendar icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8"  y1="2" x2="8"  y2="6" />
        <line x1="3"  y1="10" x2="21" y2="10" />
      </svg>
      Book a Call — {plan.name}
    </a>

    {plan.featured && (
      <div style={{
        position: "absolute", bottom: -40, right: -40,
        width: 160, height: 160, borderRadius: "50%",
        background: "rgba(253,211,77,0.08)", pointerEvents: "none",
      }} />
    )}
  </motion.div>
);

// ── PRICING ───────────────────────────────────────────────────────────────────
const Pricing = () => {
  const [ref, inView] = useReveal();

  return (
    <>
      <style>{`
        #pricing {
          padding: clamp(60px, 10vw, 120px) clamp(16px, 5vw, 48px);
        }
        .plan-card {
          padding: clamp(20px, 4vw, 40px);
        }
        @media (min-width: 900px) {
          .plan-card[data-featured="true"] {
            transform: scale(1.03);
          }
        }
        .plan-card__price {
          font-size: clamp(36px, 6vw, 52px);
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: clamp(16px, 3vw, 24px);
          align-items: start;
        }
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: clamp(12px, 3vw, 32px);
          margin-bottom: 56px;
          flex-wrap: wrap;
          row-gap: 10px;
        }
        .trust-badges span {
          font-size: clamp(11px, 1.8vw, 13px);
          font-weight: 500;
          color: var(--stone-500);
        }
      `}</style>

      <section id="pricing" ref={ref} style={{ background: "var(--warm-white)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionHeader
            label="Transparent Pricing"
            title={<>Invest in Your<br /><em style={{ color: "var(--amber-600)" }}>Peace of Mind</em></>}
            center
            inView={inView}
          />

          <div className="trust-badges">
            {TRUST_BADGES.map((b) => <span key={b}>{b}</span>)}
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i} inView={inView} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;