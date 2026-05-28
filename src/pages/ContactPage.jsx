import { motion } from "framer-motion";
import { useReveal } from "@/hooks";

const CONTACT_INFO = [
  { icon: "📧", label: "Email",         value: "hello@Flowmate.co"  },
  { icon: "📱", label: "WhatsApp",      value: "+254 704 060 364"  },
  { icon: "🕐", label: "Response Time", value: "Within 4 hours"   },
];

const CALENDAR_LINK = "https://calendar.google.com/calendar/u/0/r?pli=1";

// ── CONTACT ───────────────────────────────────────────────────────────────────
const Contact = () => {
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
          <p
            style={{
              fontSize: "clamp(14px, 3.5vw, 16px)",
              lineHeight: 1.8,
              color: "var(--stone-600)",
              marginBottom: 40,
              fontWeight: 300,
            }}
          >
            Let's discuss your needs. We respond to all inquiries within 4
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
                style={{ display: "flex", alignItems: "center", gap: 16 }}
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
              We're currently{" "}
              <strong style={{ color: "var(--amber-700)" }}>
                accepting 2 new clients.
              </strong>{" "}
              Limited spots — book early to secure your start
              date.
            </div>
          </div>
        </motion.div>

        {/* Right: booking CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{ width: "100%" }}
        >
          <div
            style={{
              background: "var(--cream)",
              borderRadius: 20,
              padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 36px)",
              border: "1px solid var(--amber-200)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                background: "var(--amber-100)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              📅
            </div>

            {/* Text */}
            <div>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 600,
                  color: "var(--amber-900)",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                Book a Free Discovery Call
              </h3>
              <p
                style={{
                  fontSize: "clamp(12px, 2.5vw, 13px)",
                  color: "var(--stone-500)",
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                Pick a time that works for you. We'll talk through your needs
                and figure out the best way to work together — no pressure,
                no commitment.
              </p>
            </div>

            {/* What to expect */}
            <div
              style={{
                width: "100%",
                background: "var(--amber-50)",
                borderRadius: 12,
                padding: "14px 18px",
                border: "1px solid var(--amber-200)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                "⏱️  30-minute video or voice call",
                "💬  Discuss your goals & pain points",
                "🎯  Get a tailored VA solution plan",
                "✅  No obligation — completely free",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 13px)",
                    color: "var(--stone-600)",
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Book Button */}
            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 28px",
                background: "#B4530E",
                color: "#fff",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(180,83,9,0.25)",
                transition: "background 0.2s, box-shadow 0.2s",
                width: "100%",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#92400E";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(180,83,9,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#B4530E";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(180,83,9,0.25)";
              }}
            >
              {/* Calendar icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8"  y1="2" x2="8"  y2="6" />
                <line x1="3"  y1="10" x2="21" y2="10" />
              </svg>
              Book My Free Call
            </a>

            <p
              style={{
                fontSize: 12,
                color: "var(--stone-400)",
                margin: 0,
              }}
            >
              Opens Google Calendar — pick any available slot
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;