import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANS } from "@/data";
import { useReveal, useApi } from "@/hooks";
import { initiateMpesa, createPayPalOrder } from "@/services/api";
import { Spinner } from "@/components/ui";
import SectionHeader from "@/components/ui/SectionHeader";

const TRUST_BADGES = [
  "🔒 Secure Payments",
  "✅ No Hidden Fees",
  "↩️ 14-Day Guarantee",
  "🌍 Pay via M-Pesa or PayPal",
];

// ── PAYMENT SUB-FORM ──────────────────────────────────────────────────────────
const PaymentSection = ({ planName, featured }) => {
  const [method, setMethod] = useState(null);
  const [phone, setPhone] = useState("");

  const mpesa = useApi(initiateMpesa);
  const paypal = useApi(createPayPalOrder);
  const planSlug = planName.toLowerCase();

  const handleMpesa = async () => {
    try { await mpesa.execute({ phone_number: phone, plan: planSlug }); } catch {}
  };

  const handlePayPal = async () => {
    try {
      const res = await paypal.execute({ plan: planSlug });
      if (res?.approval_url) window.location.href = res.approval_url;
    } catch {}
  };

  const btnStyle = (active) => ({
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    ...(active
      ? {
          background: "var(--amber-500)",
          border: "1px solid var(--amber-500)",
          color: "white",
        }
      : featured
      ? {
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "var(--amber-100)",
        }
      : {
          background: "white",
          border: "1px solid var(--amber-300)",
          color: "var(--amber-800)",
        }),
  });

  const wrapStyle = {
    marginTop: 20,
    padding: "16px",
    borderRadius: 12,
    overflow: "hidden",
    ...(featured
      ? { background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.1)" }
      : { background: "var(--amber-50)", border: "1px solid var(--amber-200)" }),
  };

  const labelColor = featured ? "var(--amber-200)" : "var(--amber-900)";
  const successColor = featured ? "var(--amber-300)" : "var(--amber-700)";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={wrapStyle}
    >
      <p style={{ fontSize: 13, color: labelColor, marginBottom: 14, fontWeight: 500 }}>
        Choose payment method for <strong>{planName}</strong>:
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setMethod("mpesa")} style={btnStyle(method === "mpesa")}>📱 M-Pesa</button>
        <button onClick={() => setMethod("paypal")} style={btnStyle(method === "paypal")}>💳 PayPal</button>
      </div>

      {method === "mpesa" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2547XXXXXXXX"
              style={{
                flex: 1, minWidth: 0,
                padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none",
                ...(featured
                  ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--amber-50)" }
                  : { background: "white", border: "1px solid var(--amber-300)", color: "var(--amber-900)" }),
              }}
            />
            <button
              onClick={handleMpesa}
              disabled={mpesa.loading || !phone}
              className="btn-primary"
              style={{
                padding: "10px 18px", fontSize: 13,
                background: "var(--amber-500)", color: "white",
                opacity: mpesa.loading || !phone ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              {mpesa.loading ? <Spinner size={14} color="white" /> : "Pay"}
            </button>
          </div>
          {mpesa.error && <p style={{ fontSize: 12, color: "#ef4444" }}>⚠️ {mpesa.error}</p>}
          {mpesa.data  && <p style={{ fontSize: 12, color: successColor }}>✅ {mpesa.data.message}</p>}
        </div>
      )}

      {method === "paypal" && (
        <div>
          <button
            onClick={handlePayPal}
            disabled={paypal.loading}
            className="btn-primary"
            style={{
              width: "100%", justifyContent: "center",
              background: "#003087", color: "white",
              fontSize: 13, opacity: paypal.loading ? 0.7 : 1,
            }}
          >
            {paypal.loading
              ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Spinner size={14} />Redirecting…</span>
              : "Continue with PayPal →"}
          </button>
          {paypal.error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>⚠️ {paypal.error}</p>}
        </div>
      )}
    </motion.div>
  );
};

// ── PLAN CARD ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, inView, openPay, setOpenPay }) => {
  const isOpen = openPay === plan.name;

  return (
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

      {/* Price header */}
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

      <button
        className="btn-primary"
        style={{
          width: "100%", justifyContent: "center", fontSize: 14,
          background: plan.featured ? "var(--amber-400)" : "var(--amber-600)",
          color: plan.featured ? "var(--amber-900)" : "white",
        }}
        onClick={() => {
          if (plan.price === "Custom") {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          } else {
            setOpenPay(isOpen ? null : plan.name);
          }
        }}
      >
        {plan.cta} {plan.price !== "Custom" ? "→ Pay Now" : "→"}
      </button>

      <AnimatePresence>
        {isOpen && plan.price !== "Custom" && (
          <PaymentSection planName={plan.name} featured={plan.featured} />
        )}
      </AnimatePresence>

      {plan.featured && (
        <div style={{
          position: "absolute", bottom: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(253,211,77,0.08)", pointerEvents: "none",
        }} />
      )}
    </motion.div>
  );
};

// ── PRICING ───────────────────────────────────────────────────────────────────
const Pricing = () => {
  const [openPay, setOpenPay] = useState(null);
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
            {TRUST_BADGES.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                index={i}
                inView={inView}
                openPay={openPay}
                setOpenPay={setOpenPay}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;