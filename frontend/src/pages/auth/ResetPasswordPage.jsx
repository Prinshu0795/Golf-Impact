import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { Target, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function ResetPasswordPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');
  
  const { error } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const newPassword = watch('new_password');

  useEffect(() => {
    if (!token || !id) {
      error('Invalid reset link.');
      navigate('/login');
    }
  }, [token, id, navigate, error]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        id,
        token,
        new_password: data.new_password,
      });
      setSuccess(true);
    } catch (err) {
      error(err.message || 'Failed to reset password. The link might be expired.');
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Reset Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter your new password below.</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Password Updated</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Your password has been successfully updated.</p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input {...register('new_password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                      pattern: { 
                        value: /^(?=.*[A-Z])(?=.*\d).{8,}$/, 
                        message: 'Must contain at least one uppercase letter and one number' 
                      }
                    })}
                    type={showPw ? 'text' : 'password'} className="input-field" placeholder="Enter new password"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.new_password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.new_password.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input {...register('confirm_password', { 
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                    type={showConfirmPw ? 'text' : 'password'} className="input-field" placeholder="Confirm new password"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm_password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.confirm_password.message}</p>}
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <><Spinner size={18} color="white" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
