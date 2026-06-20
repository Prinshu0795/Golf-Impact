import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Shuffle, Heart, Trophy, BarChart3, LogOut, Target, ArrowLeft, MessageSquare } from 'lucide-react';

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/draws', label: 'Draw Engine', icon: Shuffle },
  { path: '/admin/charities', label: 'Charities', icon: Heart },
  { path: '/admin/winners', label: 'Winners', icon: Trophy },
  { path: '/admin/support', label: 'Support Inbox', icon: MessageSquare },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '240px', background: '#09090e', borderRight: '1px solid rgba(245,158,11,0.15)', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#fbbf24' }}>Admin Panel</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Golf Impact Management</p>
        </div>

        {/* Admin user */}
        <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.06)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fbbf24' }}>👑 {user?.full_name}</p>
          <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Administrator</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {adminNav.map(({ path, label, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '10px',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: isActive ? '#fbbf24' : '#94a3b8',
                border: isActive ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '10px', fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
            <ArrowLeft size={17} /> Back to Dashboard
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '10px', fontSize: '0.875rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 500 }}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
