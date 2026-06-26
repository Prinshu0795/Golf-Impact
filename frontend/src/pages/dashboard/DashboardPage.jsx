import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { subscriptionService, scoreService, winnerService } from '../../services';
import { CreditCard, Trophy, Award, Heart, ChevronRight, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const content = (
    <motion.div variants={fadeUp} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {to && <ChevronRight size={16} color="#64748b" />}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, fontFamily: 'Inter, system-ui, sans-serif' }}>{value}</div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </motion.div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      scoreService.getScores(),
      winnerService.getMyWinnings(),
    ]).then(([scoresRes, winningsRes]) => {
      setScores(scoresRes.scores || []);
      setWinnings(winningsRes.winnings || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalWon = winnings.filter(w => w.status === 'paid').reduce((s, w) => s + parseFloat(w.prize_amount || 0), 0);
  const renewalDate = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><Spinner size={36} /></div>;
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's your Golf Impact overview</p>
      </div>

      {/* Subscription alert */}
      {!isActive && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#fbbf24" />
          <div>
            <p style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.9rem' }}>No active subscription</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subscribe to participate in monthly draws and win prizes.</p>
          </div>
          <Link to="/dashboard/subscription" className="btn-primary" style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Subscribe
          </Link>
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={CreditCard} label="Subscription" value={isActive ? 'Active' : 'Inactive'} sub={isActive ? `Renews ${renewalDate}` : 'Subscribe now'} color={isActive ? '#34d399' : '#f87171'} to="/dashboard/subscription" />
        <StatCard icon={Trophy} label="Scores Logged" value={scores.length} sub="Max 5 stored" color="#22C55E" to="/dashboard/scores" />
        <StatCard icon={Award} label="Total Winnings" value={`$${totalWon.toFixed(2)}`} sub={`${winnings.length} draw entries`} color="#fbbf24" to="/dashboard/rewards" />
        <StatCard icon={Heart} label="Charity Donation" value={`${user?.donation_pct || 10}%`} sub="Of your winnings" color="#f87171" to="/dashboard/charity" />
      </motion.div>

      {/* Recent Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Scores</h3>
            <Link to="/dashboard/scores" style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {scores.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No scores yet. <Link to="/dashboard/scores" style={{ color: 'var(--color-primary-light)' }}>Add your first score →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {scores.slice(0, 5).map((score) => (
                <div key={score.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--bg-border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: '#22C55E' }}>
                      {score.score}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(score.score_date).toLocaleDateString()}</span>
                  </div>
                  <TrendingUp size={14} color="#34d399" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Winnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Winnings</h3>
            <Link to="/dashboard/rewards" style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {winnings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No winnings yet. Keep playing — your draw entry is auto-generated! 🎯</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {winnings.slice(0, 4).map((w) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--bg-border-light)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>${parseFloat(w.prize_amount).toFixed(2)}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.draws?.draw_type?.toUpperCase()}</p>
                  </div>
                  <span className={`badge ${w.status === 'paid' ? 'badge-success' : w.status === 'approved' ? 'badge-info' : 'badge-warning'}`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .grid-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
