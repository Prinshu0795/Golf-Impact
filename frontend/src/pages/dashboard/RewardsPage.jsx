import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { winnerService } from '../../services';
import { Award, Upload, Clock, Check, X, DollarSign } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function RewardsPage() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const { success, error } = useToast();
  const fileRef = useRef();

  const fetchWinnings = async () => {
    try {
      const res = await winnerService.getMyWinnings();
      setWinnings(res.winnings || []);
    } catch (e) { error('Failed to load winnings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWinnings(); }, []);

  const handleUpload = async (id, file) => {
    setUploading(id);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await winnerService.uploadProof(id, formData);
      success('Proof uploaded! Awaiting admin review.');
      fetchWinnings();
    } catch (e) { error(e.message); }
    finally { setUploading(null); }
  };

  const totalEarned = winnings.filter(w => w.status === 'paid').reduce((s, w) => s + parseFloat(w.prize_amount || 0), 0);
  const totalPending = winnings.filter(w => w.status !== 'paid').reduce((s, w) => s + parseFloat(w.prize_amount || 0), 0);

  const statusConfig = {
    pending: { label: 'Pending Proof', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', icon: Clock },
    approved: { label: 'Approved', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: Check },
    paid: { label: 'Paid', color: '#34d399', bg: 'rgba(16,185,129,0.12)', icon: DollarSign },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)', icon: X },
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Rewards</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your draw winnings and submit verification</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, color: '#34d399' },
          { label: 'Pending', value: `$${totalPending.toFixed(2)}`, color: '#fbbf24' },
          { label: 'Total Winnings', value: winnings.length, color: 'var(--color-primary-light)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--bg-border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color, fontFamily: 'Outfit' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {winnings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No winnings yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Keep adding scores to participate in draws. Your numbers are auto-entered!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {winnings.map((w) => {
            const cfg = statusConfig[w.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'Outfit' }}>
                        ${parseFloat(w.prize_amount).toFixed(2)}
                      </span>
                      <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Draw: {w.draws?.draw_type?.toUpperCase()} • {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : '—'}
                    </p>
                    {w.admin_notes && <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.375rem' }}>Note: {w.admin_notes}</p>}
                  </div>

                  {w.status === 'pending' && !w.proof_url && (
                    <div>
                      <button onClick={() => fileRef.current?.click()} disabled={uploading === w.id} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {uploading === w.id ? <Spinner size={14} color="white" /> : <Upload size={14} />}
                        Upload Proof
                      </button>
                      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleUpload(w.id, e.target.files[0])} />
                    </div>
                  )}
                  {w.proof_url && w.status === 'pending' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-border-light)', padding: '0.375rem 0.75rem', borderRadius: '8px' }}>Proof submitted ✓</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
