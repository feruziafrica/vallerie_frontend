import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Services from "@/components/sections/Services";
// import Portfolio from "@/components/sections/Portfolio";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

/**
 * Home Page - Main landing page with all sections
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Services />
      {/* <Portfolio /> */}
      <Pricing />
      <Testimonials />
      <About />
      <Contact />
    </main>
  );
}