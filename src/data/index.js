


// This is the only file you need to edit to update any content on the site — 
// change a price, add a testimonial, update a service description — without ever touching a component file.


// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// These mirror the CSS variables in globals.css.
// Use CSS vars in JSX inline styles; use this object in JS logic only.


export const PALETTE = {
  amber: {
    50:  "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
    400: "#f59e0b", 500: "#d97706", 600: "#b45309", 700: "#92400e",
    800: "#78350f", 900: "#451a03",
  },
  stone: {
    100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e",
    500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917",
  },
  cream:     "#faf7f2",
  warmWhite: "#fffdf9",
};

// ── NAVIGATION ────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  "Services",
  "Portfolio",
  "Pricing",
  "Testimonials",
  "About",
  "Contact",
];

// ── SERVICES ──────────────────────────────────────────────────────────────────
export const SERVICES = [
  {
    icon: "📋",
    title: "Admin Support",
    desc: "From inbox management to document prep, I handle the administrative backbone of your business with precision.",
    tags: ["Email", "Scheduling", "Reports"],
    color: "var(--amber-100)",
  },
  {
    icon: "📱",
    title: "Social Media Management",
    desc: "Strategic content creation, posting schedules, engagement, and analytics across all major platforms.",
    tags: ["Content", "Analytics", "Growth"],
    color: "#fef2f2",
  },
  {
    icon: "📅",
    title: "Email & Calendar",
    desc: "Zero-inbox strategy, priority filtering, and seamless calendar coordination across time zones.",
    tags: ["Gmail", "Outlook", "Google Cal"],
    color: "#f0fdf4",
  },
  {
    icon: "🎯",
    title: "Project Management",
    desc: "End-to-end project coordination using Asana, Trello, and ClickUp to keep every deliverable on track.",
    tags: ["Asana", "Trello", "ClickUp"],
    color: "#f0f9ff",
  },
  {
    icon: "🤖",
    title: "CRM & Automation",
    desc: "Build workflows, automate repetitive tasks, and keep your CRM clean and actionable with Zapier & Make.",
    tags: ["HubSpot", "Zapier", "Make"],
    color: "var(--amber-50)",
  },
  {
    icon: "📊",
    title: "Research & Data",
    desc: "Deep-dive market research, competitor analysis, and beautifully formatted data reports on demand.",
    tags: ["Research", "Analysis", "Excel"],
    color: "#fdf4ff",
  },
];

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: 1,
    title: "E-Commerce Brand Overhaul",
    desc: "Complete social media strategy and content calendar for a luxury skincare brand. Grew followers by 340% in 6 months.",
    tags: ["Social Media", "Strategy", "Content"],
    thumb: "🛍️",
    color: "var(--amber-100)",
    span: 2,
  },
  {
    id: 2,
    title: "C-Suite EA Support",
    desc: "6-month engagement as remote EA for a Series B startup CEO. Managed 400+ emails/week and 12 team calendars.",
    tags: ["Admin", "Calendar", "Email"],
    thumb: "💼",
    color: "#f0f9ff",
    span: 1,
  },
  {
    id: 3,
    title: "CRM Automation Suite",
    desc: "Built end-to-end HubSpot pipeline with Zapier automations, reducing manual data entry by 85%.",
    tags: ["HubSpot", "Zapier", "Automation"],
    thumb: "⚙️",
    color: "#f0fdf4",
    span: 1,
  },
  {
    id: 4,
    title: "Project Launch Coordination",
    desc: "Managed cross-functional teams across 4 countries for a SaaS product launch. Delivered 3 weeks ahead of schedule.",
    tags: ["Asana", "PM", "Coordination"],
    thumb: "🚀",
    color: "#fdf4ff",
    span: 1,
  },
  {
    id: 5,
    title: "Influencer Campaign Management",
    desc: "End-to-end management of 50+ influencer partnerships for a fashion brand's seasonal launch.",
    tags: ["Influencer", "Social", "Campaign"],
    thumb: "📸",
    color: "#fef2f2",
    span: 1,
  },
  {
    id: 6,
    title: "Research & Competitive Analysis",
    desc: "Deep-dive market research report for a VC-backed health-tech startup entering 3 new markets.",
    tags: ["Research", "Analysis", "Reporting"],
    thumb: "📊",
    color: "var(--amber-50)",
    span: 2,
  },
];

// ── PRICING ───────────────────────────────────────────────────────────────────
export const PLANS = [
  {
    name: "Starter",
    price: "Ksh 2,500",
    period: "/mo",
    desc: "Perfect for solopreneurs and early-stage businesses.",
    features: [
      "Up to 20 hrs/week",
      "Admin & email support",
      "Social media (1 platform)",
      "Weekly check-in call",
      "Email support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Growth",
    price: "k=Ksh 3,500",
    period: "/mo",
    desc: "For scaling businesses that need comprehensive support.",
    features: [
      "Up to 40 hrs/week",
      "Full admin & calendar",
      "Social media (3 platforms)",
      "CRM management",
      "Daily standups",
      "Priority response",
    ],
    cta: "Most Popular",
    featured: true,
  },
  {
    name: "Executive",
    price: "Custom",
    period: "",
    desc: "White-glove service for C-suite executives and enterprises.",
    features: [
      "Unlimited availability",
      "Full business support",
      "Dedicated VA team",
      "Custom integrations",
      "SLA guarantee",
      "Onboarding included",
    ],
    cta: "Book a Call",
    featured: false,
  },
];

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "CEO, Luminary Brands",
    avatar: "SM",
    text: "Working with Vallerie has been transformational. She manages my entire executive schedule, inbox, and social channels — I've reclaimed 15+ hours every week. Worth every cent.",
    rating: 5,
  },
  {
    name: "David Osei",
    role: "Founder, Venture42",
    avatar: "DO",
    text: "The level of professionalism and attention to detail is unmatched. Our CRM was a mess before. Now it's a revenue-generating machine. Absolute game-changer.",
    rating: 5,
  },
  {
    name: "Priya Kapoor",
    role: "COO, HealthTech Inc.",
    avatar: "PK",
    text: "I was skeptical about remote VA services, but I'm completely converted. Project delivered 3 weeks early. Communication was exceptional throughout.",
    rating: 5,
  },
  {
    name: "James Whitfield",
    role: "Partner, Apex Law Group",
    avatar: "JW",
    text: "Discreet, efficient, and incredibly talented. Managing our legal team's schedules across time zones is no small feat. Vallerie makes it look effortless.",
    rating: 5,
  },
];

// ── CONTACT ───────────────────────────────────────────────────────────────────
export const SERVICES_LIST = [
  "Admin Support",
  "Social Media Management",
  "Email & Calendar",
  "Project Management",
  "CRM & Automation",
  "Research & Data",
  "Other",
];