import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { charityService } from '../services';
import { Heart, Globe, ArrowLeft, Users, Calendar } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function CharityProfilePage() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charityService.getCharityById(id)
      .then((res) => setCharity(res.charity))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}><Spinner size={40} /></div>;
  if (!charity) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', color: '#64748b' }}>Charity not found.</div>;

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ height: '280px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(99,102,241,0.15) 100%)', display: 'flex', alignItems: 'flex-end', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Link to="/charities" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Charities
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              💚
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.25rem' }}>{charity.name}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.625rem', borderRadius: '6px' }}>{charity.category}</span>
                {charity.is_featured && <span style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.625rem', borderRadius: '6px' }}>⭐ Featured</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Main content */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>About</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.8 }}>{charity.description}</p>
            </motion.div>

            {/* Events */}
            {charity.charity_events?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>Events & Activities</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {charity.charity_events.map((event) => (
                    <div key={event.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <Calendar size={14} color="#818cf8" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Ongoing'}</span>
                      </div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{event.title}</h4>
                      {event.description && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{event.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Impact Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', fontFamily: 'Outfit' }}>${parseFloat(charity.total_raised || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total raised via Golf Impact</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                    <Users size={16} color="#818cf8" /> {charity.donor_count || 0}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Golf Impact donors</div>
                </div>
              </div>
            </motion.div>

            {charity.website && (
              <a href={charity.website} target="_blank" rel="noopener noreferrer"
                className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
                <Globe size={16} /> Visit Website
              </a>
            )}
            <Link to="/signup" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>
              <Heart size={16} /> Support This Charity
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .charity-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
