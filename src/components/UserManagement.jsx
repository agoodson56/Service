import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { listUsers, addUser, changePassword, updateUser, deleteUser } from '../store/authStore';

export default function UserManagement({ currentUser, toast }) {
    const [users, setUsers] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editingPw, setEditingPw] = useState(null);
    const [newPw, setNewPw] = useState('');
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Technician', password: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        setUsers(listUsers());
    }, []);

    const refresh = () => setUsers(listUsers());

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError('All fields are required');
            return;
        }
        if (newUser.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        const result = await addUser(newUser);
        if (result.success) {
            toast?.('User added successfully', 'success');
            setNewUser({ name: '', email: '', role: 'Technician', password: '' });
            setShowAdd(false);
            refresh();
        } else {
            setError(result.error);
        }
    };

    const handleChangePw = async (userId) => {
        if (!newPw || newPw.length < 6) {
            toast?.('Password must be at least 6 characters', 'error');
            return;
        }
        const result = await changePassword(userId, newPw);
        if (result.success) {
            toast?.('Password changed successfully', 'success');
            setEditingPw(null);
            setNewPw('');
        }
    };

    const handleDelete = async (user) => {
        if (user.id === currentUser?.id) {
            toast?.('You cannot delete your own account', 'error');
            return;
        }
        if (!confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
        const result = deleteUser(user.id);
        if (result.success) {
            toast?.('User deleted', 'success');
            refresh();
        }
    };

    const handleRoleChange = (userId, newRole) => {
        updateUser(userId, { role: newRole });
        refresh();
        toast?.('Role updated', 'success');
    };

    const roles = ['Admin', 'Service Manager', 'Dispatcher', 'Technician', 'Viewer'];

    return (
        <div className="user-mgmt">
            <div className="card-header">
                <h3 className="card-title">
                    <Icon name="group" size={18} className="icon-gold" /> User Management
                </h3>
                <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ fontSize: 12 }}>
                    <Icon name="person_add" size={16} /> Add User
                </button>
            </div>

            {/* Add User Form */}
            {showAdd && (
                <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-primary)', marginBottom: 16 }}>
                    <form onSubmit={handleAdd}>
                        {error && (
                            <div className="login-error" style={{ marginBottom: 12 }}>
                                <Icon name="error" size={14} /> {error}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="cp-field">
                                <label>Full Name *</label>
                                <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Smith" />
                            </div>
                            <div className="cp-field">
                                <label>Email *</label>
                                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@3dtsi.com" />
                            </div>
                            <div className="cp-field">
                                <label>Role</label>
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    {roles.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="cp-field">
                                <label>Password *</label>
                                <input type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Min 6 characters" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>
                                <Icon name="check" size={14} /> Create User
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowAdd(false); setError(''); }} style={{ fontSize: 12 }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* User List */}
            <table className="user-mgmt-table">
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>ROLE</th>
                        <th>CREATED</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: user.role === 'Admin' ? 'var(--accent-gold)' : 'var(--accent-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 12, fontWeight: 700,
                                    }}>
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                                        {user.id === currentUser?.id && (
                                            <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600 }}>You</span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={e => handleRoleChange(user.id, e.target.value)}
                                    style={{
                                        fontSize: 12, padding: '4px 8px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--bg-input)',
                                        fontFamily: 'var(--font-family)',
                                    }}
                                    disabled={user.id === currentUser?.id}
                                >
                                    {roles.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    {editingPw === user.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={newPw}
                                                onChange={e => setNewPw(e.target.value)}
                                                placeholder="New password"
                                                style={{
                                                    width: 140, fontSize: 12, padding: '4px 8px',
                                                    border: '1px solid var(--border-primary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                }}
                                            />
                                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleChangePw(user.id)}>
                                                Save
                                            </button>
                                            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { setEditingPw(null); setNewPw(''); }}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: 11, padding: '4px 10px' }}
                                                onClick={() => { setEditingPw(user.id); setNewPw(''); }}
                                                title="Change password"
                                            >
                                                <Icon name="key" size={14} />
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: 11, padding: '4px 10px', color: 'var(--accent-danger)' }}
                                                    onClick={() => handleDelete(user)}
                                                    title="Delete user"
                                                >
                                                    <Icon name="delete" size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
