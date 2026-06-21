import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { Target, Mail, ArrowLeft } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { error } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      error(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', paddingTop: '6rem', background: 'var(--bg-base)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
            <Target size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Forgot Your Password?</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter your email and we'll send a secure reset link.</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Mail size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your inbox</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>We've sent a password reset link to your email. Please check your inbox to continue.</p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem', textDecoration: 'none' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                    type="email" className="input-field" placeholder="you@example.com" autoComplete="email"
                    style={{ paddingLeft: '2.5rem' }} />
                </div>
                {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <><Spinner size={18} color="white" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ color: '#64748b', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#94a3b8'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
