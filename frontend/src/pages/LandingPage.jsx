import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Target, Trophy, Heart, Zap, Shield, TrendingUp, Star, ArrowRight, Check, ChevronRight, Users, DollarSign, Shuffle } from 'lucide-react';

// ─── Animation Helpers ─────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function AnimatedSection({ children, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────
function HeroSection() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount(c => c < 2847 ? c + 37 : 2847), 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 50%)', pointerEvents: 'none' }} />
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

      {/* Floating orbs */}
      <div className="animate-float" style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="animate-float delay-300" style={{ position: 'absolute', bottom: '20%', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '780px' }}>
          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '2rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.8rem', fontWeight: 600, color: '#818cf8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 2s infinite' }} />
              Monthly Draws Now Live • $24,750 Prize Pool
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Golf Scores That{' '}
            <span className="gradient-text">Change Lives</span>
            {' '}& Reward Players
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '560px' }}>
            Track your golf scores, enter monthly prize draws, and automatically donate to the charity of your choice — all in one premium platform.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/signup" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Start Free Today <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              See How It Works
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Active Players', value: `${count.toLocaleString()}+`, color: '#818cf8' },
              { label: 'Donated to Charities', value: '$142K+', color: '#34d399' },
              { label: 'Monthly Draws', value: '24', color: '#fbbf24' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color, fontFamily: 'Outfit' }}>{value}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ──────────────────────────────────────────────────────
const features = [
  { icon: Trophy, title: 'Score Tracking', desc: 'Log your golf scores with our smart system. Only your best 5 count — keeping things competitive and fair.', color: '#fbbf24' },
  { icon: Shuffle, title: 'Monthly Prize Draws', desc: 'Your scores become your lottery numbers. Match 3, 4, or 5 to win your share of the prize pool.', color: '#818cf8' },
  { icon: Heart, title: 'Charity Impact', desc: 'At least 10% of every winning goes to your chosen charity. Play for yourself and the world.', color: '#34d399' },
  { icon: Shield, title: 'Secure & Verified', desc: 'JWT authentication, Stripe payments, and winner verification ensure a safe, fair experience.', color: '#f87171' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track your subscription, draw history, winnings, and charity contributions from one dashboard.', color: '#60a5fa' },
  { icon: Zap, title: 'Instant Results', desc: 'Draw results published live. Know immediately if you won and upload proof for verification.', color: '#c084fc' },
];

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.p variants={fadeUp} style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Everything You Need</motion.p>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Built for the Modern Golfer
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
            Every feature designed to make your golfing journey more rewarding, competitive, and impactful.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div key={title} variants={fadeUp} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.625rem', fontSize: '1.1rem' }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── How It Works / Draw Process ──────────────────────────────────────────
const steps = [
  { step: '01', title: 'Subscribe & Sign Up', desc: 'Choose your plan (monthly or yearly) and select a charity to support. Your journey starts here.' },
  { step: '02', title: 'Log Your Golf Scores', desc: 'Add your round scores (1–45). Your 5 most recent scores become your unique draw numbers.' },
  { step: '03', title: 'Enter Monthly Draw', desc: 'Every month, a draw runs. Match 3, 4, or 5 numbers to win 25%, 35%, or 40% of the prize pool.' },
  { step: '04', title: 'Win & Give Back', desc: 'Winners verify their identity, get paid, and 10%+ goes directly to their chosen charity.' },
];

function DrawProcessSection() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.p variants={fadeUp} style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>The Draw Process</motion.p>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800 }}>How Golf Impact Works</motion.h2>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {steps.map(({ step, title, desc }, i) => (
            <AnimatedSection key={step}>
              <motion.div variants={fadeUp} style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Outfit', color: 'rgba(99,102,241,0.12)', marginBottom: '0.5rem', lineHeight: 1 }}>{step}</div>
                <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #6366f1, transparent)', margin: '0 0 1rem 0', display: i < steps.length - 1 ? 'block' : 'none' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.05rem' }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Prize Pool visual */}
        <AnimatedSection style={{ marginTop: '4rem' }}>
          <motion.div variants={fadeUp} style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { label: '5 Match Winners', pct: '40%', color: '#818cf8', desc: 'Split equally' },
              { label: '4 Match Winners', pct: '35%', color: '#34d399', desc: 'Split equally' },
              { label: '3 Match Winners', pct: '25%', color: '#fbbf24', desc: 'Split equally' },
            ].map(({ label, pct, color, desc }) => (
              <div key={label}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{pct}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>
              </div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Charity Showcase ──────────────────────────────────────────────────────
const charities = [
  { name: "St. Jude Children's", category: 'Healthcare', raised: '$48K+', color: '#f87171', emoji: '🏥' },
  { name: 'American Red Cross', category: 'Humanitarian', raised: '$31K+', color: '#60a5fa', emoji: '🆘' },
  { name: 'Habitat for Humanity', category: 'Housing', raised: '$28K+', color: '#34d399', emoji: '🏠' },
  { name: 'World Wildlife Fund', category: 'Environment', raised: '$19K+', color: '#86efac', emoji: '🌿' },
];

function CharityShowcase() {
  return (
    <section id="charities" style={{ padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatedSection style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <motion.div variants={fadeUp}>
            <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Charity Impact</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1.25rem' }}>
              Play Golf.{' '}
              <span className="gradient-text-green">Change the World.</span>
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
              Every subscription, every draw, every win — a portion goes to the charity you believe in. Choose from verified charities and watch your impact grow over time.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Minimum 10% of winnings go to charity', 'Increase your donation percentage anytime', 'Make independent donations directly', 'Track your total charity impact'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#34d399" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/charities" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Browse All Charities <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {charities.map(({ name, category, raised, color, emoji }) => (
              <AnimatedSection key={name}>
                <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>{category}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color, fontFamily: 'Outfit' }}>{raised}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>raised</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #charities .grid-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Michael Chen', role: 'Amateur Golfer', text: "I never thought my golf scores could help feed hungry families. Golf Impact turned my hobby into something meaningful.", stars: 5 },
  { name: 'Sarah Williams', role: 'Weekend Player', text: "Won $850 in the monthly draw and $85 went straight to Habitat for Humanity. That felt better than the win itself.", stars: 5 },
  { name: 'James O\'Brien', role: 'Club Member', text: "The score tracking is smart and the draw system is exciting. Every round feels like it matters now.", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>What Players Say</motion.h2>
        </AnimatedSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map(({ name, role, text, stars }) => (
            <AnimatedSection key={name}>
              <motion.div variants={fadeUp} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={{ color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.25rem', fontSize: '0.9rem', fontStyle: 'italic' }}>"{text}"</p>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{role}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    { name: 'Monthly', price: '$9.99', period: '/month', desc: 'Perfect for getting started', features: ['All draw entries', 'Score tracking', 'Charity selection', 'Winner verification', 'Monthly draws'] },
    { name: 'Yearly', price: '$89.99', period: '/year', desc: 'Save 25% — best value', features: ['Everything in Monthly', 'Priority support', 'Early draw access', '25% savings', 'Annual charity report'], popular: true },
  ];

  return (
    <section id="pricing" style={{ padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>Simple, Transparent Pricing</motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#64748b' }}>No hidden fees. Cancel anytime. Every plan includes charity impact.</motion.p>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map(({ name, price, period, desc, features, popular }) => (
            <AnimatedSection key={name}>
              <motion.div variants={fadeUp} style={{
                padding: '2rem',
                borderRadius: '20px',
                border: popular ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: popular ? 'rgba(99,102,241,0.06)' : 'var(--bg-card)',
                position: 'relative',
              }}>
                {popular && (
                  <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', padding: '0.25rem 1rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{desc}</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', color: popular ? '#818cf8' : '#f8fafc' }}>{price}</span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{period}</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                      <Check size={15} color="#34d399" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={popular ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '0.75rem' }}>
                  Get Started
                </Link>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ───────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <AnimatedSection>
          <motion.div variants={fadeUp} style={{ padding: '3rem 2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to Make an Impact?
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
              Join thousands of golfers who track performance, win prizes, and support charities they love.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.875rem 2rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/charities" className="btn-secondary" style={{ padding: '0.875rem 2rem', textDecoration: 'none' }}>
                Browse Charities
              </Link>
            </motion.div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <DrawProcessSection />
      <CharityShowcase />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
