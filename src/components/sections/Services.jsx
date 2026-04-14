import { motion } from "framer-motion";
import { SERVICES } from "@/data";
import { useReveal } from "@/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

const ServiceCard = ({ service, index, inView }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
    className="card-hover service-card"
    style={{
      background: service.color,
      borderRadius: 20,
      border: "1px solid rgba(180,83,9,0.08)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div className="service-card__icon">{service.icon}</div>
    <h3
      className="font-display service-card__title"
      style={{ fontWeight: 600, color: "var(--amber-900)", marginBottom: 12 }}
    >
      {service.title}
    </h3>
    <p
      style={{
        fontSize: "clamp(13px, 2vw, 15px)",
        lineHeight: 1.7,
        color: "var(--stone-600)",
        marginBottom: 24,
        fontWeight: 300,
      }}
    >
      {service.desc}
    </p>

    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
      {service.tags.map((t) => (
        <span
          key={t}
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            padding: "4px 12px",
            background: "rgba(180,83,9,0.08)",
            color: "var(--amber-700)",
            borderRadius: 20,
          }}
        >
          {t}
        </span>
      ))}
    </div>

    <button
      className="btn-outline"
      style={{ padding: "9px 22px", fontSize: 13, width: "100%", justifyContent: "center" }}
      onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
    >
      Hire Now →
    </button>
  </motion.div>
);

const Services = () => {
  const [ref, inView] = useReveal();

  return (
    <>
      <style>{`
        #services {
          padding: clamp(60px, 10vw, 120px) clamp(16px, 5vw, 48px);
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(16px, 3vw, 28px);
        }
        .service-card {
          padding: clamp(20px, 4vw, 36px);
        }
        .service-card__icon {
          font-size: clamp(28px, 5vw, 40px);
          margin-bottom: clamp(12px, 2.5vw, 20px);
        }
        .service-card__title {
          font-size: clamp(18px, 3vw, 26px);
          margin-bottom: 12px;
        }
      `}</style>

      <section id="services" ref={ref} style={{ background: "var(--warm-white)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionHeader
            label="What I Offer"
            title={
              <>
                Services Designed for
                <br />
                <em style={{ color: "var(--amber-600)" }}>Your Growth</em>
              </>
            }
            center
            inView={inView}
          />

          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.title} service={s} index={i} inView={inView} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;