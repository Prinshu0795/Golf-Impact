import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, User, Mail, RefreshCw, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | open | resolved

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support/messages');
      setMessages(res.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    setUpdatingId(id);
    try {
      await api.put(`/support/messages/${id}/status`, { status: newStatus });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
    } catch {}
    setUpdatingId(null);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this support message? This action cannot be undone.")) return;
    setUpdatingId(id);
    try {
      await api.delete(`/support/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {}
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? messages
    : messages.filter((m) => m.status === (filter === 'open' ? 'open' : 'resolved'));

  const openCount = messages.filter((m) => m.status === 'open' || !m.status).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Support Inbox</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {openCount} pending {openCount === 1 ? 'message' : 'messages'}
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-primary-light)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'open', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--bg-border-light)',
            color: filter === f ? 'var(--color-primary-light)' : 'var(--text-muted)',
            textTransform: 'capitalize',
          }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
          <Spinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)' }}>
          <MessageSquare size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No messages found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((msg) => {
            const isResolved = msg.status === 'resolved';
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: `1px solid ${isResolved ? 'rgba(52,211,153,0.15)' : 'var(--bg-border-light)'}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        <User size={15} /> {msg.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Mail size={13} />
                        <a href={`mailto:${msg.email}`} style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>{msg.email}</a>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                        background: isResolved ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                        color: isResolved ? '#34d399' : '#fbbf24',
                        border: `1px solid ${isResolved ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {isResolved ? 'Resolved' : 'Pending'}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {msg.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <Clock size={12} />
                      {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      cursor: updatingId === msg.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500,
                      opacity: updatingId === msg.id ? 0.6 : 1,
                    }}>
                      <input 
                        type="checkbox" 
                        checked={isResolved}
                        onChange={() => toggleStatus(msg.id, msg.status)}
                        disabled={updatingId === msg.id}
                        style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'inherit' }}
                      />
                      Mark as Resolved
                    </label>

                    <button onClick={() => deleteMessage(msg.id)} disabled={updatingId === msg.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', fontWeight: 600, fontSize: '0.85rem',
                        opacity: updatingId === msg.id ? 0.6 : 1,
                      }}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
