import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { charityService } from '../../services';
import { Heart, ExternalLink, Check } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function CharityPage() {
  const { user, updateUserData } = useAuth();
  const { success, error } = useToast();
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [donationPct, setDonationPct] = useState(user?.donation_pct || 10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    charityService.getCharities().then((res) => {
      setCharities(res.charities || []);
      if (user?.charity_id) {
        const current = (res.charities || []).find(c => c.id === user.charity_id);
        setSelectedCharity(current || null);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await charityService.selectCharity({ charity_id: selectedCharity?.id, donation_pct: donationPct });
      updateUserData({ charity_id: selectedCharity?.id, donation_pct: donationPct });
      success('Charity preference saved!');
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Charity</h1>
        <p style={{ color: 'var(--text-muted)' }}>Select the charity to receive your donation from winnings</p>
      </div>

      {/* Current selection */}
      {selectedCharity && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} color="#34d399" />
            </div>
            <div>
              <p style={{ fontWeight: 700 }}>{selectedCharity.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedCharity.category} • Currently selected</p>
            </div>
            <Link to={`/charities/${selectedCharity.id}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#34d399', fontSize: '0.85rem', textDecoration: 'none' }}>
              View Profile <ExternalLink size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Donation percentage */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700 }}>Donation Percentage</h3>
          <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.25rem', fontFamily: 'Outfit' }}>{donationPct}%</span>
        </div>
        <input type="range" min="10" max="100" step="5" value={donationPct} onChange={(e) => setDonationPct(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>10% (minimum)</span><span>100%</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          From each winning, <strong style={{ color: '#34d399' }}>{donationPct}%</strong> will be donated to {selectedCharity?.name || 'your charity'}.
        </p>
      </div>

      {/* Charity list */}
      <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>All Charities</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {charities.map((charity) => (
          <motion.div key={charity.id} whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedCharity(charity)}
            style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '14px', cursor: 'pointer',
              border: selectedCharity?.id === charity.id ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--bg-border-light)',
              background: selectedCharity?.id === charity.id ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)',
              transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-border-light)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{charity.category}</span>
              {selectedCharity?.id === charity.id && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="white" /></div>}
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.375rem' }}>{charity.name}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{charity.short_description}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !selectedCharity} className="btn-primary" style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {saving ? <><Spinner size={16} color="white" /> Saving...</> : <><Check size={16} /> Save Preferences</>}
      </button>
    </div>
  );
}
