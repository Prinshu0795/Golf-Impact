import { Link } from 'react-router-dom';
import { Target, Mail, Phone, Heart } from 'lucide-react';

const SUPPORT_EMAIL = 'golfimpact.support@gmail.com';
const SUPPORT_PHONE_DISPLAY = '+91 6388626778';
const SUPPORT_PHONE = '+916388626778';

export default function Footer() {
  const linkStyle = {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
    display: 'block',
  };

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--bg-border-light)',
      padding: '4rem 1.5rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Golf Impact</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '240px' }}>
              Track your performance, win rewards, and make a real difference for charities you care about.
            </p>
            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <a href={`mailto:${SUPPORT_EMAIL}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Mail size={14} /> {SUPPORT_EMAIL}
              </a>
              <a href={`tel:${SUPPORT_PHONE}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#22C55E'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Phone size={14} /> {SUPPORT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['How It Works', '/#how-it-works'], ['Draw System', '/#draw-process'], ['Pricing', '/#pricing'], ['Charities', '/charities']].map(([label, href]) => (
                href.startsWith('/') && !href.includes('#') ? (
                  <Link key={href} to={href} style={linkStyle}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                    {label}
                  </Link>
                ) : (
                  <a key={href} href={href} style={linkStyle}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                    {label}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['Sign Up', '/signup'], ['Log In', '/login'], ['Dashboard', '/dashboard'], ['Profile', '/dashboard/profile']].map(([label, href]) => (
                <Link key={href} to={href} style={linkStyle}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Support & Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/support" style={linkStyle}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                Customer Care
              </Link>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" style={linkStyle}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--bg-border-light)', paddingTop: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Golf Impact. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Minimum 10% of winnings go to your chosen charity <Heart size={14} color="#f87171" fill="#f87171" />
          </p>
        </div>
      </div>
    </footer>
  );
}
