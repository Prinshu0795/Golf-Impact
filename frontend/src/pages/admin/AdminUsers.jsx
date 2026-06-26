import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services';
import { Search, Edit2, Check, X } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: search || undefined, page });
      setUsers(res.users || []);
      setPagination(res.pagination || {});
    } catch (e) { error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, page]);

  const handleUpdate = async (updates) => {
    setSaving(true);
    try {
      await adminService.updateUser(editUser.id, updates);
      success('User updated!');
      setEditUser(null);
      fetchUsers();
    } catch (e) { error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>{pagination.total || 0} total users</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} type="text"
            className="input-field" placeholder="Search by email..." style={{ paddingLeft: '2.5rem', width: '280px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><Spinner size={32} /></div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border-light)', borderRadius: '16px', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Subscription</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    {user.subscriptions?.[0] ? (
                      <span className={`badge ${user.subscriptions[0].status === 'active' ? 'badge-success' : 'badge-muted'}`}>{user.subscriptions[0].plan} · {user.subscriptions[0].status}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => setEditUser(user)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.375rem 0.625rem', cursor: 'pointer', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}>
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: page === p ? '1px solid var(--color-primary)' : '1px solid var(--bg-border-light)', background: page === p ? 'rgba(99,102,241,0.15)' : 'transparent', color: page === p ? 'var(--color-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Role</label>
              <select defaultValue={editUser.role} id="edit-role" className="input-field">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Active</label>
              <input type="checkbox" defaultChecked={editUser.is_active} id="edit-active" style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button onClick={() => setEditUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleUpdate({
                role: document.getElementById('edit-role').value,
                is_active: document.getElementById('edit-active').checked,
              })} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
