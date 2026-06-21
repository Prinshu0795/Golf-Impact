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
      <div className="premium-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #22C55E, #15803D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(34,197,94,0.3)',
          }}>
            <Target size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
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

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: '72px', bottom: 0, right: 0, width: '100%', maxWidth: '320px',
              background: 'var(--bg-surface)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--bg-border-light)',
              padding: '2rem 1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              zIndex: 99
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
