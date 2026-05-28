import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchCourses } from '@/api/courses';
import { useReveal } from '@/hooks';
import ClassSelectorCard from '@/components/academy/ClassSelectorCard';
import { api } from '@/api/auth';

/**
 * Hero Section — Compelling introduction to the academy
 */
const HeroSection = () => {
  const [ref, inView] = useReveal();

};


/**
 * Class Selector Section
 */
const ClassSelectorSection = () => {
  const [ref, inView] = useReveal();

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-5 md:px-8 bg-gradient-to-br from-cream to-warm-white"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-4">
             Courses We offer
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
            Pick your path to success
          </h2>
        </motion.div>

        {/* No wrapper — ClassSelectorCard renders flat into the page */}
        <ClassSelectorCard />
      </div>
    </section>
  );
};

/**
 * Trust Strip Section
 */
const TrustSection = () => {
  const [ref, inView] = useReveal();

  const trustItems = [
    {
      icon: '✓',
      title: 'Verified Training',
      description: 'Industry-aligned curriculum built for real VA roles',
    },
    {
      icon: '→',
      title: 'Direct Placement',
      description: 'Top graduates get matched with clients on our Opportunities Board',
    },
    {
      icon: '∞',
      title: 'Lifetime Access',
      description: 'Course materials and resources yours to keep after enrolment',
    },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 px-5 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {trustItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-amber-600 mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Main Academy Page Component
 */
export default function AcademyPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <ClassSelectorSection />
      <TrustSection />
    </div>
  );
}