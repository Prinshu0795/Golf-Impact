import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Target } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Support', href: '/support' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navBg = scrolled
    ? 'var(--bg-surface)'
    : 'transparent';

  const linkColor = 'var(--text-muted)';
  const linkHover = 'var(--text-primary)';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 1.5rem',
      height: '72px',
      display: 'flex', alignItems: 'center',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(5, 5, 8, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <Target size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Golf Impact
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            link.href.startsWith('/') && !link.href.includes('#') ? (
              <Link key={link.href} to={link.href}
                style={{ color: location.pathname === link.href ? '#6366f1' : linkColor, fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.color = linkHover}
                onMouseLeave={(e) => e.target.style.color = location.pathname === link.href ? '#6366f1' : linkColor}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href}
                style={{ color: linkColor, fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.color = linkHover}
                onMouseLeave={(e) => e.target.style.color = linkColor}>
                {link.label}
              </a>
            )
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                  Admin
                </Link>
              )}
              <Link to="/dashboard" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                Log In
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                Get Started
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem' }} className="mobile-menu-btn">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute', top: '72px', left: 0, right: 0,
              background: 'var(--bg-surface)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--bg-border-light)',
              padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
            }}
          >
            {navLinks.map((link) => (
              link.href.startsWith('/') && !link.href.includes('#') ? (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                  style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none' }}>
                  {link.label}
                </a>
              )
            ))}

            {/* mobile theme toggle was here */}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
