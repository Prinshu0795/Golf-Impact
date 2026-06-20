import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services';
import { Users, CreditCard, Trophy, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {trend && <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>+{trend}%</span>}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then((res) => setStats(res.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><Spinner size={36} /></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b' }}>Golf Impact platform overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="#818cf8" trend={5} />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={stats?.activeSubscriptions || 0} color="#34d399" trend={12} />
        <StatCard icon={BarChart3} label="Total Draws" value={stats?.totalDraws || 0} color="#fbbf24" />
        <StatCard icon={AlertCircle} label="Pending Verifications" value={stats?.pendingVerifications || 0} color="#f87171" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(0)}`} color="#60a5fa" />
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { href: '/admin/draws', label: '🎲 Run a Draw', color: '#6366f1' },
            { href: '/admin/winners', label: '🏆 Review Winners', color: '#fbbf24' },
            { href: '/admin/users', label: '👥 Manage Users', color: '#34d399' },
            { href: '/admin/charities', label: '💚 Manage Charities', color: '#f87171' },
          ].map(({ href, label, color }) => (
            <a key={href} href={href} style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: `${color}10`, border: `1px solid ${color}25`, color, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'block', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${color}20`}
              onMouseLeave={(e) => e.currentTarget.style.background = `${color}10`}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
