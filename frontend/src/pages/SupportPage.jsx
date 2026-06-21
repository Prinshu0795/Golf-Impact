import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, Send, CheckCircle, HeadphonesIcon, Clock, Shield } from 'lucide-react';
import api from '../services/api';

const SUPPORT_EMAIL = 'golfimpact.support@gmail.com';
const SUPPORT_PHONE = '+916388626778';
const SUPPORT_PHONE_DISPLAY = '+91 6388626778';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/support/message', form);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Hero ── */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--bg-border-light)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '20px', marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
          }}>
            <HeadphonesIcon size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Need Help?{' '}
            <span className="gradient-text">We're Here For You</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Reach our support team via email or phone. We typically respond within a few hours.
          </p>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              { icon: Clock, label: 'Fast Response' },
              { icon: Shield, label: 'Secure & Private' },
              { icon: CheckCircle, label: 'Dedicated Support' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Icon size={15} color="#6366f1" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Contact Cards ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>

          {/* Email Card */}
          <motion.div variants={fadeUp}
            style={{
              padding: '2.5rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--bg-border-light)',
              textAlign: 'center',
              transition: 'all 0.25s ease',
            }}
            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(99,102,241,0.15)' }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={28} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email Support</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Send us an email and we'll get back to you as soon as possible.
            </p>
            <p style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
              {SUPPORT_EMAIL}
            </p>
            <a
              id="email-support-btn"
              href={`mailto:${SUPPORT_EMAIL}?subject=Golf Impact Support Request`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Mail size={16} /> Send Email
            </a>
          </motion.div>

          {/* Phone Card */}
          <motion.div variants={fadeUp}
            style={{
              padding: '2.5rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--bg-border-light)',
              textAlign: 'center',
              transition: 'all 0.25s ease',
            }}
            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(34,197,94,0.12)' }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
              border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Phone size={28} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Phone Support</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Call us directly for urgent queries. We're available during business hours.
            </p>
            <p style={{ color: '#22C55E', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              {SUPPORT_PHONE_DISPLAY}
            </p>
            <a
              id="call-support-btn"
              href={`tel:${SUPPORT_PHONE}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #16a34a, #15803D)',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Phone size={16} /> Call Now
            </a>
          </motion.div>
        </motion.div>

        {/* ── Contact Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '640px', margin: '0 auto',
            padding: '2.5rem',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--bg-border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare size={22} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Send a Message</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>We'll reply to your email within 24 hours</p>
            </div>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center', padding: '2.5rem',
                background: 'rgba(34,197,94,0.06)', borderRadius: '16px',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
              <CheckCircle size={48} color="#22C55E" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Message Sent!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Thank you for reaching out. We'll get back to you at <strong>{form.email || SUPPORT_EMAIL}</strong> soon.
              </p>
              <button onClick={() => setSubmitted(false)} style={{
                marginTop: '1.5rem', padding: '0.6rem 1.5rem', borderRadius: '10px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', cursor: 'pointer', fontWeight: 600,
              }}>
                Send Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Your Name *
                  </label>
                  <input
                    id="support-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Prince Gupta"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Email Address *
                  </label>
                  <input
                    id="support-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Message *
                </label>
                <textarea
                  id="support-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question in detail…"
                  rows={5}
                  className="input-field"
                  style={{ resize: 'vertical', minHeight: '120px' }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              <button
                id="support-submit-btn"
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  padding: '0.875rem', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '12px', opacity: submitting ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {submitting ? 'Sending…' : 'Submit Message'}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          form > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
