import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Shuffle, Heart, Trophy, BarChart3, LogOut, Target, ArrowLeft, MessageSquare, Menu, X } from 'lucide-react';

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/draws', label: 'Draw Engine', icon: Shuffle },
  { path: '/admin/charities', label: 'Charities', icon: Heart },
  { path: '/admin/winners', label: 'Winners', icon: Trophy },
  { path: '/admin/support', label: 'Support Inbox', icon: MessageSquare },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/'); };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="GolfImpact" style={{ width: '130px', height: 'auto', maxWidth: '100%' }} />
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
            onClick={() => setSidebarOpen(false)}
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
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto" style={{ width: '240px', background: 'var(--bg-surface)', borderRight: '1px solid var(--bg-border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px', background: 'var(--bg-surface)', zIndex: 201, overflowY: 'auto', borderRight: '1px solid var(--bg-border)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <div className="flex md:hidden items-center justify-between p-4 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-amber-400 bg-transparent border-none cursor-pointer p-1">
            <Menu size={24} />
          </button>
          <img src="/logo.png" alt="GolfImpact" style={{ width: '120px', height: 'auto' }} />
          <div style={{ width: '24px' }} />
        </div>

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }} className="md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
