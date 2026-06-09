// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';


const NAV_LINKS = [
  
  // { label: 'Portfolio',    path: '/portfolio',            section: null,           highlight: false },
  { label: 'Our Courses',   path: '/academy',              section: null,           highlight: true  },
  { label: 'Services',     path: '/services',             section: null,           highlight: false },
  { label: 'About Us',        path: '/about',                section: null,           highlight: false },
  { label: 'Contact',      path: '/contact',              section: null,           highlight: false },
  {label: 'Blogs',         path: '/blogs',                section: null,           highlight: false },
  { label: 'Find a Job',   path: '/opportunities',        section: null,           highlight: true  },
]

// ── LOGO ──────────────────────────────────────────────────────────────────────
// const Logo = () => (
//   <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
//     <div style={{
//       width: '36px', height: '36px', borderRadius: '8px',
//       background: '#B5530A', display: 'flex',
//       alignItems: 'center', justifyContent: 'center',
//       flexShrink: 0,
//     }}>
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
//         <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
//       </svg>
//     </div>
//     <span style={{ fontSize: '16px', fontWeight: 700, color: '#2C0F00' }}>
//       FlowMate<span style={{ color: '#B5530A' }}>VA</span>
//     </span>
//   </Link>
// );

import flowmateLogo from '@/assets/flowmate-logo.svg';

const Logo = () => (
  <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
    <img
      src={flowmateLogo}
      alt="FlowMate Talents"
      style={{ height: '40px', width: 'auto' }}
    />
  </Link>
);

// ── DESKTOP NAV ───────────────────────────────────────────────────────────────
const DesktopNav = ({ onNavClick, activeSection }) => (
  <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {NAV_LINKS.map(({ label, path, section, highlight }) => {
      const isActive = section
        ? activeSection === section
        : window.location.pathname === path;

      return (
        <button
          key={label}
          onClick={() => onNavClick(path, section)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px',
            fontWeight: highlight ? 600 : 400,
            color: highlight ? '#B5530A' : '#5C3D2A',
            padding: '8px 12px', borderRadius: '6px',
            position: 'relative',
            transition: 'background 200ms, color 200ms',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F5EDE0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          {label}
          {isActive && (
            <div style={{
              position: 'absolute', bottom: '2px',
              left: '12px', right: '12px',
              height: '2px', background: '#B5530A', borderRadius: '1px',
            }} />
          )}
        </button>
      );
    })}
  </nav>
);

DesktopNav.propTypes = {
  onNavClick: PropTypes.func.isRequired,
  activeSection: PropTypes.string,
};

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
const MobileMenu = ({ isOpen, onClose, onNavClick, onLoginClick }) => (
  <>
    {isOpen && (
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.3)', zIndex: 39,
        }}
      />
    )}
    <div style={{
      position: 'fixed', top: '64px', left: 0, right: 0,
      background: '#FFFFFF',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      zIndex: 40,
      maxHeight: isOpen ? '100vh' : '0',
      overflow: 'hidden',
      transition: 'max-height 300ms ease',
    }}>
      {/* Nav links */}
      <nav style={{ padding: '12px 16px 0' }}>
        {NAV_LINKS.map(({ label, path, section, highlight }) => (
          <button
            key={label}
            onClick={() => { onNavClick(path, section); onClose(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '15px',
              fontWeight: highlight ? 600 : 400,
              color: highlight ? '#B5530A' : '#2C0F00',
              padding: '13px 16px', borderRadius: '8px',
              transition: 'background 200ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5EDE0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: '#EAE6E0', margin: '12px 16px' }} />

      {/* Action buttons */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => { onLoginClick(); onClose(); }}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent', border: '1.5px solid #B5530A',
            borderRadius: '8px', color: '#B5530A',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Student login
        </button>
        <Link
          to="/hire"
          onClick={onClose}
          style={{
            display: 'block', width: '100%', padding: '12px',
            background: '#B5530A', color: '#FFFFFF',
            borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, textDecoration: 'none',
            textAlign: 'center', boxSizing: 'border-box',
          }}
        >
          Hire a VA
        </Link>
      </div>
    </div>
  </>
);

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
};

// ── MAIN NAVBAR ───────────────────────────────────────────────────────────────
export const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location  = useLocation();
  const navigate  = useNavigate();

  // Track scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Track which section is in view (only on homepage)
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = ['services', 'portfolio', 'testimonials', 'about', 'contact'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, [location.pathname]);

  // Smart nav click handler
  // - If section link: navigate to / then scroll to section
  // - If page link (/academy etc): navigate directly
  const handleNavClick = (path, section) => {
    if (section) {
      if (location.pathname === '/') {
        // Already on homepage — just scroll
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // On another page — go to / then scroll after page loads
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      setActiveSection(section);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        
        /* Responsive visibility */
        .nav-desktop-links { display: none; }
        .nav-desktop-actions { display: none; }
        .nav-hamburger { display: flex !important; }

        @media (min-width: 768px) {
          .nav-desktop-links { display: flex !important; }
          .nav-desktop-actions { display: flex !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? '#FFFFFF' : 'transparent',
        borderBottom: scrolled ? '1px solid #EAE6E0' : 'none',
        transition: 'background 200ms, border 200ms',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
        }}>
          {/* Logo */}
          <Logo />

          {/* Desktop nav — controlled by CSS class, not inline display */}
          <div className="nav-desktop-links">
            <DesktopNav onNavClick={handleNavClick} activeSection={activeSection} />
          </div>

          {/* Desktop action buttons */}
          <div className="nav-desktop-actions" style={{ gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onLoginClick}
              style={{
                background: 'transparent', border: '1.5px solid #B5530A',
                color: '#B5530A', padding: '9px 18px',
                borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
                transition: 'background 200ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5EDE0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Student login
            </button>
            <Link
              to="/hire"
              style={{
                background: '#B5530A', color: '#FFFFFF',
                padding: '9px 18px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#9A3A00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#B5530A'; }}
            >
              Hire a VA
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', color: '#2C0F00',
            }}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavClick={handleNavClick}
        onLoginClick={onLoginClick}
      />
    </>
  );
};

Navbar.propTypes = { onLoginClick: PropTypes.func.isRequired };
export default Navbar;