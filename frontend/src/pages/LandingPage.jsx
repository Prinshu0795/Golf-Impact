import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Target, Trophy, Heart, Zap, Shield, TrendingUp, Star, ArrowRight, Check, ChevronRight, Users, DollarSign, Shuffle, Clock } from 'lucide-react';
import { drawService, charityService } from '../services';

// ─── Animation Helpers ─────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function AnimatedSection({ children, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// ─── Hero Section ──────────────────────────────────────────────────────────
function HeroSection({ currentDraw, totalCharityRaised, charityCount }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', width: '100%', position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ flex: '1 1 600px', maxWidth: '780px' }}>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '2rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
              Golf. Rewards. Impact.
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Track Your Game.<br />
            <span className="gradient-text">Play for Rewards.</span><br />
            Give Back.
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '560px' }}>
            Track your golf scores, participate in monthly draws, and support the charity you choose. An exclusive platform for players who want more from their game.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/signup" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Join the Club <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              How It Works
            </a>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {totalCharityRaised ? formatINR(totalCharityRaised) : '...'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Charity Contributions</p>
            </div>
            {currentDraw && (
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-secondary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {formatINR(currentDraw.prize_pool)}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Prize Pool</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {charityCount > 0 ? charityCount : '...'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Charity Partners</p>
            </div>
          </motion.div>
        </div>

        {/* Current Draw Card */}
        {currentDraw && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ flex: '1 1 350px', maxWidth: '400px' }}>
            <div className="card" style={{ padding: '2rem', background: 'rgba(24, 24, 27, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Draw</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                  Entries Open
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Prize Pool</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-secondary)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1 }}>
                  {formatINR(currentDraw.prize_pool)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Clock size={16} />
                  <span>Draw Date: <strong style={{ color: 'var(--text-primary)' }}>{new Date(currentDraw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Target size={16} />
                  <span>Format: <strong style={{ color: 'var(--text-primary)' }}>{currentDraw.draw_type === '5match' ? 'Match 5 Numbers' : currentDraw.draw_type}</strong></span>
                </div>
              </div>

              <Link to="/signup" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', width: '100%' }}>
                Enter Draw
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Features Section ──────────────────────────────────────────────────────
const features = [
  { icon: Trophy, title: 'Score Tracking', desc: 'Log your golf scores with our smart system. Only your best 5 count — keeping things competitive and fair.' },
  { icon: Shuffle, title: 'Monthly Prize Draws', desc: 'Your scores become your lottery numbers. Match 3, 4, or 5 to win your share of the prize pool.' },
  { icon: Heart, title: 'Charity Impact', desc: 'At least 10% of every winning goes to your chosen charity. Play for yourself and the world.' },
  { icon: Shield, title: 'Secure & Verified', desc: 'JWT authentication, payments, and winner verification ensure a safe, fair experience.' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track your subscription, draw history, winnings, and charity contributions from one dashboard.' },
  { icon: Zap, title: 'Instant Results', desc: 'Draw results published live. Know immediately if you won and upload proof for verification.' },
];

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Everything You Need</motion.p>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Built for the Modern Golfer
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
            Every feature designed to make your golfing journey more rewarding, competitive, and impactful.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon size={22} color="var(--color-primary-light)" />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.625rem', fontSize: '1.1rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── How It Works / Draw Process ──────────────────────────────────────────
const steps = [
  { step: '01', title: 'Subscribe & Sign Up', desc: 'Choose your plan and select a charity to support. Your journey starts here.' },
  { step: '02', title: 'Log Your Golf Scores', desc: 'Add your round scores (1–45). Your 5 most recent scores become your unique draw numbers.' },
  { step: '03', title: 'Enter Monthly Draw', desc: 'Every month, a draw runs. Match 3, 4, or 5 numbers to win 25%, 35%, or 40% of the prize pool.' },
  { step: '04', title: 'Win & Give Back', desc: 'Winners verify their identity, get paid, and 10%+ goes directly to their chosen charity.' },
];

function DrawProcessSection({ currentDraw }) {
  const pool = currentDraw?.prize_pool || 0;
  
  return (
    <section id="how-it-works" style={{ padding: '6rem 1.5rem', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>The Draw Process</motion.p>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800 }}>How Golf Impact Works</motion.h2>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {steps.map(({ step, title, desc }, i) => (
            <AnimatedSection key={step}>
              <motion.div variants={fadeUp} style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(255,255,255,0.06)', marginBottom: '0.5rem', lineHeight: 1 }}>{step}</div>
                <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--color-primary), transparent)', margin: '0 0 1rem 0', display: i < steps.length - 1 ? 'block' : 'none' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.05rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Prize Pool visual */}
        {pool > 0 && (
          <AnimatedSection style={{ marginTop: '4rem' }}>
            <motion.div variants={fadeUp} style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '12px', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
              {[
                { label: '5 Match Winners (40%)', amount: pool * 0.40, color: 'var(--color-primary-light)' },
                { label: '4 Match Winners (35%)', amount: pool * 0.35, color: 'var(--text-primary)' },
                { label: '3 Match Winners (25%)', amount: pool * 0.25, color: 'var(--color-secondary)' },
              ].map(({ label, amount, color }) => (
                <div key={label}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '0.25rem' }}>{formatINR(amount)}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}

// ─── Charity Showcase ──────────────────────────────────────────────────────
function CharityShowcase({ charities }) {
  // Show up to 4 top charities by total raised
  const topCharities = [...charities].sort((a, b) => b.total_raised - a.total_raised).slice(0, 4);

  return (
    <section id="charities" style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div variants={fadeUp}>
            <p style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Charity Impact</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1.25rem' }}>
              Your game can make a difference.
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Every eligible entry contributes toward the charity selected by the player. Choose from our verified charity partners and watch your impact grow.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Minimum 10% of winnings go to charity', 'Increase your donation percentage anytime', 'Make independent donations directly', 'Track your total charity impact'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="var(--color-primary-light)" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/charities" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Browse All Charities <ChevronRight size={16} />
            </Link>
          </motion.div>

          {topCharities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topCharities.map(({ id, name, category, total_raised }) => (
                <AnimatedSection key={id}>
                  <motion.div variants={fadeUp} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{category}</div>
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Contributed</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'Inter, system-ui, sans-serif' }}>{formatINR(total_raised)}</div>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Michael Chen', role: 'Amateur Golfer', text: "I never thought my golf scores could help feed hungry families. Golf Impact turned my hobby into something meaningful.", stars: 5 },
  { name: 'Sarah Williams', role: 'Weekend Player', text: "Won ₹85,000 in the monthly draw and ₹8,500 went straight to Habitat for Humanity. That felt better than the win itself.", stars: 5 },
  { name: 'James O\'Brien', role: 'Club Member', text: "The score tracking is smart and the draw system is exciting. Every round feels like it matters now.", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section style={{ padding: '6rem 1.5rem', background: 'transparent' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>What Players Say</motion.h2>
        </AnimatedSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map(({ name, role, text, stars }) => (
            <AnimatedSection key={name}>
              <motion.div variants={fadeUp} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={16} fill="var(--color-secondary)" color="var(--color-secondary)" />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem', fontSize: '0.9rem', fontStyle: 'italic' }}>"{text}"</p>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role}</p>
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
    { name: 'Monthly', price: '₹799', period: '/month', desc: 'Perfect for getting started', features: ['All draw entries', 'Score tracking', 'Charity selection', 'Winner verification', 'Monthly draws'] },
    { name: 'Yearly', price: '₹7,999', period: '/year', desc: 'Save ~15% — best value', features: ['Everything in Monthly', 'Priority support', 'Early draw access', '15% savings', 'Annual charity report'], popular: true },
  ];

  return (
    <section id="pricing" style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>Simple, Transparent Pricing</motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)' }}>No hidden fees. Cancel anytime. Every plan includes charity impact.</motion.p>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map(({ name, price, period, desc, features, popular }) => (
            <AnimatedSection key={name}>
              <motion.div variants={fadeUp} className="card" style={{
                padding: '2rem',
                border: popular ? '1px solid var(--color-primary)' : '1px solid var(--bg-border-light)',
                background: 'var(--bg-card)',
                position: 'relative',
              }}>
                {popular && (
                  <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', padding: '0.25rem 1rem', borderRadius: '9999px', background: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{desc}</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Inter, system-ui, sans-serif', color: popular ? 'var(--color-primary)' : 'var(--text-primary)' }}>{price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{period}</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Check size={15} color="var(--color-primary-light)" /> {f}
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
    <section style={{ padding: '6rem 1.5rem', background: 'transparent' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <AnimatedSection>
          <motion.div variants={fadeUp} className="card" style={{ padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to Make an Impact?
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
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
  const [currentDraw, setCurrentDraw] = useState(null);
  const [charities, setCharities] = useState([]);
  const [totalCharityRaised, setTotalCharityRaised] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch draws
        const drawsRes = await drawService.getDraws();
        if (drawsRes?.data?.draws?.length > 0) {
          setCurrentDraw(drawsRes.data.draws[0]);
        }

        // Fetch charities
        const charitiesRes = await charityService.getCharities();
        if (charitiesRes?.data?.charities) {
          const fetchedCharities = charitiesRes.data.charities;
          setCharities(fetchedCharities);
          
          // Calculate total raised
          const total = fetchedCharities.reduce((acc, curr) => acc + (curr.total_raised || 0), 0);
          setTotalCharityRaised(total);
        }
      } catch (err) {
        console.error('Failed to fetch public data for landing page', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HeroSection 
        currentDraw={currentDraw} 
        totalCharityRaised={totalCharityRaised} 
        charityCount={charities.length} 
      />
      <FeaturesSection />
      <DrawProcessSection currentDraw={currentDraw} />
      <CharityShowcase charities={charities} />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
