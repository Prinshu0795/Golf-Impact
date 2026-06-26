import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services';
import api from '../../services/api';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: { full_name: user?.full_name, phone: user?.phone || '' } });
  const { register: regPw, handleSubmit: handlePw, formState: { errors: pwErrors }, reset: resetPw, watch } = useForm();

  const onProfileSave = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (data.full_name) formData.append('full_name', data.full_name);
      if (data.phone) formData.append('phone', data.phone);
      const res = await userService.updateProfile(formData);
      updateUserData(res.user);
      success('Profile updated!');
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  const onPasswordSave = async (data) => {
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { current_password: data.current_password, new_password: data.new_password });
      success('Password changed successfully!');
      resetPw();
    } catch (e) { error(e.message); }
    finally { setSavingPw(false); }
  };

  const newPw = watch('new_password');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account information</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #22C55E, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: 'white', fontFamily: 'Inter, system-ui, sans-serif', flexShrink: 0 }}>
          {user?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{user?.full_name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          <span style={{ fontSize: '0.75rem', color: user?.role === 'admin' ? '#fbbf24' : 'var(--color-primary-light)', background: user?.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)', padding: '0.2rem 0.625rem', borderRadius: '6px', marginTop: '0.375rem', display: 'inline-block' }}>
            {user?.role === 'admin' ? '👑 Admin' : '⛳ Player'}
          </span>
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="#22C55E" /> Personal Information
        </h3>
        <form onSubmit={handleSubmit(onProfileSave)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
              <input {...register('full_name', { required: true })} type="text" className="input-field" />
              {errors.full_name && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone</label>
              <input {...register('phone')} type="tel" className="input-field" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
            <input value={user?.email} disabled className="input-field" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Email cannot be changed</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? <Spinner size={15} color="white" /> : <Save size={15} />} Save Changes
            </button>
          </div>
        </form>
      </motion.div>

      {/* Password form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#22C55E" /> Change Password
        </h3>
        <form onSubmit={handlePw(onPasswordSave)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Password</label>
            <input {...regPw('current_password', { required: 'Required' })} type="password" className="input-field" />
            {pwErrors.current_password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.current_password.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>New Password</label>
              <input {...regPw('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type="password" className="input-field" />
              {pwErrors.new_password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.new_password.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input {...regPw('confirm_password', { required: 'Required', validate: v => v === newPw || 'Passwords do not match' })} type="password" className="input-field" />
              {pwErrors.confirm_password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.confirm_password.message}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={savingPw} className="btn-primary" style={{ padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {savingPw ? <Spinner size={15} color="white" /> : <Lock size={15} />} Change Password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
