import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import { scoreService } from '../../services';
import { Plus, Edit2, Trash2, Calendar, AlertCircle, X, Check } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

function ScoreForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Score (1–45)</label>
        <input {...register('score', {
          required: 'Score is required',
          min: { value: 1, message: 'Minimum score is 1' },
          max: { value: 45, message: 'Maximum score is 45' },
          valueAsNumber: true,
        })} type="number" min="1" max="45" className="input-field" placeholder="e.g. 28" />
        {errors.score && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.score.message}</p>}
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Date</label>
        <input {...register('score_date', { required: 'Date is required' })}
          type="date" className="input-field" max={new Date().toISOString().split('T')[0]} />
        {errors.score_date && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.375rem' }}>{errors.score_date.message}</p>}
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notes (optional)</label>
        <input {...register('notes')} type="text" className="input-field" placeholder="Course name, conditions..." />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {loading ? <><Spinner size={16} color="white" /> Saving...</> : <><Check size={16} /> Save Score</>}
        </button>
      </div>
    </form>
  );
}

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editScore, setEditScore] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { success, error } = useToast();

  const fetchScores = async () => {
    try {
      const res = await scoreService.getScores();
      setScores(res.scores || []);
    } catch (e) {
      error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      const res = await scoreService.addScore(data);
      success(res.message);
      setShowAddModal(false);
      fetchScores();
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await scoreService.updateScore(editScore.id, data);
      success('Score updated!');
      setEditScore(null);
      fetchScores();
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await scoreService.deleteScore(id);
      success('Score deleted');
      setDeleteConfirm(null);
      fetchScores();
    } catch (e) { error(e.message); }
  };

  const MAX = 5;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Golf Scores</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{scores.length}/{MAX} scores stored • Newest first</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Score
        </button>
      </div>

      {/* Rules info */}
      <div style={{ padding: '0.875rem 1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertCircle size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Only your <strong style={{ color: 'var(--color-primary-light)' }}>5 most recent scores</strong> are stored. Score range: <strong style={{ color: 'var(--color-primary-light)' }}>1–45</strong>. Each score must have a unique date. Adding a 6th score replaces the oldest.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><Spinner size={32} /></div>
      ) : scores.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛳</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No scores yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add your first golf score to start participating in draws</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">Add Your First Score</button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {scores.map((score, i) => (
              <motion.div key={score.id} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Score number */}
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', color: 'var(--color-primary-light)', fontFamily: 'Outfit', flexShrink: 0 }}>
                  {score.score}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Calendar size={13} color="#64748b" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(score.score_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {score.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{score.notes}</p>}
                </div>

                {i === 0 && <span className="badge badge-success">Latest</span>}
                {i === scores.length - 1 && scores.length === MAX && <span className="badge badge-muted">Oldest</span>}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setEditScore(score)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(score)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Golf Score">
        <ScoreForm onSubmit={handleAdd} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editScore} onClose={() => setEditScore(null)} title="Edit Score">
        {editScore && <ScoreForm onSubmit={handleUpdate} loading={saving} defaultValues={{ score: editScore.score, score_date: editScore.score_date, notes: editScore.notes }} />}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Score">
        {deleteConfirm && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Are you sure you want to delete the score <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.score}</strong> from {new Date(deleteConfirm.score_date).toLocaleDateString()}?</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger" style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
