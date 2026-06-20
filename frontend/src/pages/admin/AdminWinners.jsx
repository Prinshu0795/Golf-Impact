import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { winnerService } from '../../services';
import { Check, X, DollarSign, Clock, Filter } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected', 'paid'];

export default function AdminWinners() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [reviewModal, setReviewModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await winnerService.getAllVerifications({ status: statusFilter || undefined, page });
      setVerifications(res.verifications || []);
      setPagination(res.pagination || {});
    } catch (e) { error('Failed to load verifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVerifications(); }, [statusFilter, page]);

  const handleReview = async (status) => {
    setSaving(true);
    try {
      await winnerService.reviewVerification(reviewModal.id, { status, admin_notes: notes });
      success(`Verification ${status}!`);
      setReviewModal(null);
      setNotes('');
      fetchVerifications();
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async (id) => {
    try {
      await winnerService.markPaid(id);
      success('Marked as paid!');
      fetchVerifications();
    } catch (e) { error(e.message); }
  };

  const statusColors = { pending: '#fbbf24', approved: '#60a5fa', rejected: '#f87171', paid: '#34d399' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Winner Verification</h1>
          <p style={{ color: '#64748b' }}>{pagination.total || 0} total verifications</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((s) => (
            <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: statusFilter === s ? `${statusColors[s] || '#6366f1'}18` : 'transparent',
                border: statusFilter === s ? `1px solid ${statusColors[s] || '#6366f1'}40` : '1px solid rgba(255,255,255,0.08)',
                color: statusFilter === s ? (statusColors[s] || '#818cf8') : '#64748b',
              }}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><Spinner size={32} /></div> : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Winner</th><th>Draw</th><th>Prize</th><th>Status</th><th>Proof</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {verifications.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No verifications found</td></tr>
              ) : verifications.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{v.users?.full_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{v.users?.email}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{v.draws?.draw_type?.toUpperCase()} · {v.draws?.draw_date ? new Date(v.draws.draw_date).toLocaleDateString() : '—'}</td>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'Outfit' }}>${parseFloat(v.prize_amount).toFixed(2)}</td>
                  <td><span className={`badge badge-${v.status === 'paid' ? 'success' : v.status === 'approved' ? 'info' : v.status === 'rejected' ? 'danger' : 'warning'}`}>{v.status}</span></td>
                  <td>
                    {v.proof_url ? (
                      <a href={v.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', fontSize: '0.8rem' }}>View Proof</a>
                    ) : <span style={{ color: '#475569', fontSize: '0.8rem' }}>Not submitted</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {v.status === 'pending' && (
                        <button onClick={() => setReviewModal(v)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>
                          Review
                        </button>
                      )}
                      {v.status === 'approved' && (
                        <button onClick={() => handleMarkPaid(v.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: '#34d399', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <DollarSign size={12} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setNotes(''); }} title="Review Winner Verification">
        {reviewModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p><strong style={{ color: '#f8fafc' }}>{reviewModal.users?.full_name}</strong></p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Prize: ${parseFloat(reviewModal.prize_amount).toFixed(2)}</p>
              {reviewModal.proof_url && <a href={reviewModal.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#818cf8' }}>View Proof Document →</a>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Admin Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" rows={3} placeholder="Add any notes for the winner..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => handleReview('rejected')} disabled={saving} className="btn-danger" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <X size={16} /> Reject
              </button>
              <button onClick={() => handleReview('approved')} disabled={saving} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {saving ? <Spinner size={16} color="white" /> : <Check size={16} />} Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
