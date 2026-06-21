import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { charityService } from '../../services';
import { Eye, EyeOff, Target, Mail, Lock, User, Heart } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);
  const { signup } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { donation_pct: 10 } });

  useEffect(() => {
    charityService.getCharities().then((res) => setCharities(res.charities || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      success('Account created! Welcome to Golf Impact 🎯');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const donationPct = watch('donation_pct', 10);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', paddingTop: '6rem', background: 'var(--bg-base)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(16,185,129,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #22C55E, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
            <Target size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create Your Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join Golf Impact and start making a difference</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                type="text" className="input-field" placeholder="John Smith" id="signup-name"
                style={{ paddingLeft: '2.5rem' }} />
            </div>
            {errors.full_name && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                type="email" className="input-field" placeholder="you@example.com" id="signup-email"
                style={{ paddingLeft: '2.5rem' }} />
            </div>
            {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                type={showPw ? 'text' : 'password'} className="input-field" placeholder="Min 8 characters" id="signup-password"
                style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.password.message}</p>}
          </div>

          {/* Charity Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              <Heart size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Choose a Charity
            </label>
            <select {...register('charity_id')} className="input-field" id="signup-charity" style={{ cursor: 'pointer' }}>
              <option value="">Select a charity (optional)</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Donation percentage */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.625rem' }}>
              <span>Donation Percentage</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{donationPct}%</span>
            </label>
            <input {...register('donation_pct', { min: 10, max: 100 })}
              type="range" min="10" max="100" step="5" id="signup-donation"
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              <span>10% (min)</span><span>100%</span>
            </div>
          </div>

          <button type="submit" className="btn-primary" id="signup-submit" disabled={loading}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Spinner size={18} color="white" /> Creating account...</> : 'Create Account 🎯'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#22C55E', fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
