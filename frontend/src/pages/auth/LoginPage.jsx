import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Target, Mail, Lock } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Login failed. Please try again.');
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #22C55E, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
            <Target size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your Golf Impact account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                type="email" className="input-field" placeholder="you@example.com" autoComplete="email"
                style={{ paddingLeft: '2.5rem' }} id="login-email" />
            </div>
            {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input {...register('password', { required: 'Password is required' })}
                type={showPw ? 'text' : 'password'} className="input-field" placeholder="Enter your password"
                style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} id="login-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.password.message}</p>}
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#22C55E', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#15803D'} onMouseLeave={(e) => e.target.style.color = '#22C55E'}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary" id="login-submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Spinner size={18} color="white" /> Signing in...</> : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#22C55E', fontWeight: 600 }}>Sign up free</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
