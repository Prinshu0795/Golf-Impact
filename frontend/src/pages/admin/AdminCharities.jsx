import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

function CharityForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[['name', 'Charity Name', true], ['short_description', 'Short Description', false], ['description', 'Full Description', false], ['category', 'Category', false], ['website', 'Website URL', false]].map(([field, label, required]) => (
        <div key={field}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</label>
          {field === 'description' ? (
            <textarea {...register(field, { required: required ? `${label} is required` : false })} className="input-field" rows={3} style={{ resize: 'vertical' }} />
          ) : (
            <input {...register(field, { required: required ? `${label} is required` : false })} type="text" className="input-field" />
          )}
          {errors[field] && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[field].message}</p>}
        </div>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        <input {...register('is_featured')} type="checkbox" style={{ accentColor: '#fbbf24' }} /> Feature on homepage
      </label>
      <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
        {loading ? <><Spinner size={16} color="white" /> Saving...</> : <><Check size={16} /> Save Charity</>}
      </button>
    </form>
  );
}

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editCharity, setEditCharity] = useState(null);
  const { success, error } = useToast();

  const fetchCharities = async () => {
    try {
      const res = await adminService.getCharities();
      setCharities(res.charities || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await adminService.createCharity(data);
      success('Charity created!');
      setShowAdd(false);
      fetchCharities();
    } catch (e) { error(e.message); } finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await adminService.updateCharity(editCharity.id, data);
      success('Charity updated!');
      setEditCharity(null);
      fetchCharities();
    } catch (e) { error(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this charity?')) return;
    try {
      await adminService.deleteCharity(id);
      success('Charity deactivated.');
      fetchCharities();
    } catch (e) { error(e.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Charity Management</h1><p style={{ color: 'var(--text-muted)' }}>{charities.length} charities</p></div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Charity
        </button>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><Spinner size={32} /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {charities.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '14px', border: `1px solid ${c.is_active ? 'var(--bg-border-light)' : 'rgba(239,68,68,0.15)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {c.is_featured && <span className="badge badge-warning">Featured</span>}
                  <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => setEditCharity(c)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: 'var(--color-primary-light)' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: '#f87171' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{c.name}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{c.category}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.short_description}</p>
              <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.5rem', fontWeight: 600 }}>${parseFloat(c.total_raised || 0).toLocaleString()} raised</p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Charity" maxWidth="540px">
        <CharityForm onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal isOpen={!!editCharity} onClose={() => setEditCharity(null)} title="Edit Charity" maxWidth="540px">
        {editCharity && <CharityForm onSubmit={handleUpdate} loading={saving} defaultValues={editCharity} />}
      </Modal>
    </div>
  );
}
