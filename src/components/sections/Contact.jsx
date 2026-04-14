import { useState } from "react";
import { motion } from "framer-motion";
import { SERVICES_LIST } from "@/data";
import { useReveal, useApi } from "@/hooks";
import { submitContact } from "@/services/api";
import { Spinner } from "@/components/ui";

const CONTACT_INFO = [
  { icon: "📧", label: "Email",         value: "hello@amarava.co"  },
  { icon: "📱", label: "WhatsApp",      value: "+254 700 000 000"  },
  { icon: "🕐", label: "Response Time", value: "Within 4 hours"   },
];

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 10,
  border: "1.5px solid var(--amber-200)",
  background: "white",
  fontSize: 14,
  color: "var(--stone-800)",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "DM Sans, sans-serif",
  boxSizing: "border-box",
};

const onFocus = (e) => { e.target.style.borderColor = "var(--amber-400)"; };
const onBlur  = (e) => { e.target.style.borderColor = "var(--amber-200)"; };

// ── SUCCESS STATE ─────────────────────────────────────────────────────────────
const SuccessMessage = ({ onReset }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    style={{
      textAlign: "center",
      padding: "clamp(24px, 5vw, 60px)",
      background: "var(--amber-50)",
      borderRadius: 24,
      border: "1px solid var(--amber-200)",
    }}
  >
    <div style={{ fontSize: "clamp(48px, 12vw, 64px)", marginBottom: 20 }}>🎉</div>
    <h3 className="font-display" style={{
      fontSize: "clamp(24px, 6vw, 30px)",
      fontWeight: 600,
      color: "var(--amber-900)",
      marginBottom: 12,
    }}>
      Message Sent!
    </h3>
    <p style={{
      fontSize: "clamp(13px, 3.5vw, 15px)",
      color: "var(--stone-500)",
      lineHeight: 1.7,
      marginBottom: 24,
    }}>
      Thank you! I'll review your request and get back to you within 4 hours.
    </p>
    <button
      className="btn-primary"
      onClick={onReset}
      style={{
        width: "100%",
        maxWidth: 300,
        padding: "12px 24px",
        fontSize: "clamp(13px, 3.5vw, 15px)",
      }}
    >
      Send Another
    </button>
  </motion.div>
);

// ── CONTACT FORM ──────────────────────────────────────────────────────────────
const ContactForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const { execute, loading, error } = useApi(submitContact);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await execute(form);
      onSuccess();
    } catch {
      // error displayed below via `error` state
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--cream)",
        borderRadius: 24,
        padding: "clamp(20px, 5vw, 40px)",
        border: "1px solid var(--amber-200)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Name & Email - Stack on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          placeholder="Your Name"
          required
          value={form.name}
          onChange={set("name")}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={set("email")}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      {/* Service Select */}
      <select
        value={form.service}
        onChange={set("service")}
        required
        style={{
          ...inputStyle,
          marginBottom: 16,
          cursor: "pointer",
          color: form.service ? "var(--stone-800)" : "var(--stone-400)",
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <option value="">Select Service Interest</option>
        {SERVICES_LIST.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* Message Textarea */}
      <textarea
        placeholder="Tell me about your needs…"
        required
        rows={5}
        value={form.message}
        onChange={set("message")}
        style={{
          ...inputStyle,
          resize: "vertical",
          minHeight: "120px",
          marginBottom: error ? 12 : 24,
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {/* Error Message */}
      {error && (
        <p
          style={{
            fontSize: 13,
            color: "#dc2626",
            marginBottom: 16,
            padding: "10px 14px",
            background: "#fef2f2",
            borderRadius: 8,
            border: "1px solid #fecaca",
          }}
        >
          ⚠️ {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{
          width: "100%",
          justifyContent: "center",
          fontSize: "clamp(13px, 3.5vw, 15px)",
          padding: "clamp(12px, 3vw, 16px)",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Spinner /> Sending…
          </span>
        ) : (
          "Send Message →"
        )}
      </button>
    </form>
  );
};

// ── CONTACT ───────────────────────────────────────────────────────────────────
const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [ref, inView] = useReveal();

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 48px)",
        background: "var(--warm-white)",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(40px, 8vw, 80px)",
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Left: info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ width: "100%" }}
        >
          <div
            className="section-label"
            style={{
              marginBottom: 24,
              fontSize: "clamp(12px, 2.5vw, 13px)",
            }}
          >
            Get In Touch
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(28px, 5.5vw, 52px)",
              fontWeight: 600,
              color: "var(--amber-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 28,
            }}
          >
            Ready to
            <br />
            <em style={{ color: "var(--amber-600)", fontStyle: "italic" }}>
              Transform
            </em>
            <br />
            Your Business?
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 3.5vw, 16px)",
              lineHeight: 1.8,
              color: "var(--stone-600)",
              marginBottom: 40,
              fontWeight: 300,
            }}
          >
            Let's discuss your needs. I respond to all inquiries within 4
            business hours. Book a free 30-minute discovery call to get
            started.
          </p>

          {/* Contact Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {CONTACT_INFO.map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    minWidth: 48,
                    background: "var(--amber-100)",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      fontWeight: 600,
                      color: "var(--stone-400)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(13px, 3vw, 15px)",
                      fontWeight: 500,
                      color: "var(--amber-800)",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Availability Card */}
          <div
            style={{
              background: "var(--amber-50)",
              borderRadius: 16,
              padding: "clamp(16px, 4vw, 24px)",
              border: "1px solid var(--amber-200)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(13px, 3vw, 14px)",
                fontWeight: 600,
                color: "var(--amber-900)",
                marginBottom: 8,
              }}
            >
              📅 Current Availability
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 3vw, 13px)",
                color: "var(--stone-500)",
                lineHeight: 1.6,
              }}
            >
              I'm currently{" "}
              <strong style={{ color: "var(--amber-700)" }}>
                accepting 2 new clients
              </strong>{" "}
              for May 2026. Limited spots — book early to secure your start
              date.
            </div>
          </div>
        </motion.div>

        {/* Right: form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{ width: "100%" }}
        >
          {submitted ? (
            <SuccessMessage onReset={() => setSubmitted(false)} />
          ) : (
            <ContactForm onSuccess={() => setSubmitted(true)} />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;