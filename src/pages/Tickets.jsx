import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets, useCustomers } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

const CATEGORIES = ['CCTV', 'Access Control', 'Fire Alarm', 'Alarm Systems', 'Intrusion Detection', 'Intercom Systems', 'Network Cabling', 'Structured Cabling', 'Other'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Scheduled', 'Parts Ordered', 'On Hold', 'Closed'];

export default function Tickets({ onMenuClick, toast }) {
    const navigate = useNavigate();
    const { tickets, customers, technicians, addTicket, updateTicket, deleteTicket, getCustomer, getTechnician } = useTickets();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        title: '', customerId: '', priority: 'Medium', status: 'Open', category: 'CCTV',
        description: '', assignedTo: '', scheduledDate: '', scheduledTime: '', estimatedDuration: 2, laborRate: 95
    });

    const filtered = tickets.filter(t => {
        if (filter !== 'All' && t.status !== filter) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleSubmit = () => {
        if (!form.title.trim()) return;
        addTicket(form);
        setShowModal(false);
        setForm({ title: '', customerId: '', priority: 'Medium', status: 'Open', category: 'CCTV', description: '', assignedTo: '', scheduledDate: '', scheduledTime: '', estimatedDuration: 2, laborRate: 95 });
        toast('Service ticket created successfully');
    };

    const priorityClass = (p) => p?.toLowerCase().replace(' ', '-') || '';
    const statusClass = (s) => s?.toLowerCase().replace(' ', '-') || '';

    const statusCounts = {
        'All': tickets.length,
        'Open': tickets.filter(t => t.status === 'Open').length,
        'In Progress': tickets.filter(t => t.status === 'In Progress').length,
        'Scheduled': tickets.filter(t => t.status === 'Scheduled').length,
        'Parts Ordered': tickets.filter(t => t.status === 'Parts Ordered').length,
        'Closed': tickets.filter(t => t.status === 'Closed').length,
    };

    return (
        <>
            <PageHeader title="Service Tickets" subtitle={`${tickets.length} total tickets`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Service Call
                </button>
            </PageHeader>

            <div className="page-body">
                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-bar">
                        <span className="search-bar-icon">🔍</span>
                        <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {Object.entries(statusCounts).map(([s, count]) => (
                            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                {s} ({count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 30 }}></th>
                                <th>Title</th>
                                <th>Customer</th>
                                <th>Category</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Scheduled</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No tickets found</td></tr>
                            ) : filtered.map(t => {
                                const customer = getCustomer(t.customerId);
                                const tech = getTechnician(t.assignedTo);
                                return (
                                    <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="cursor-pointer">
                                        <td><span className={`priority-dot ${priorityClass(t.priority)}`} title={t.priority} /></td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 260 }}>
                                            <div className="truncate">{t.title}</div>
                                        </td>
                                        <td>{customer?.name || '—'}</td>
                                        <td><span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{t.category}</span></td>
                                        <td>{tech?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                                        <td><span className={`badge badge-${statusClass(t.status)}`}>{t.status}</span></td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t.scheduledDate || '—'}</td>
                                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this ticket?')) { deleteTicket(t.id); toast('Ticket deleted'); } }}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Ticket Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Service Call" size="lg"
                footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Create Ticket</button></>}>
                <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Title *</label>
                        <input className="form-input" placeholder="Brief description of the issue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Customer</label>
                        <select className="form-select" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                            <option value="">— Select Customer —</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assign Technician</label>
                        <select className="form-select" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                            <option value="">— Unassigned —</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Scheduled Date</label>
                        <input type="date" className="form-input" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Scheduled Time</label>
                        <input type="time" className="form-input" value={form.scheduledTime} onChange={e => setForm({ ...form, scheduledTime: e.target.value })} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Estimated Duration (hours)</label>
                        <input type="number" className="form-input" min="0.5" step="0.5" value={form.estimatedDuration} onChange={e => setForm({ ...form, estimatedDuration: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Labor Rate ($/hr)</label>
                        <input type="number" className="form-input" value={form.laborRate} onChange={e => setForm({ ...form, laborRate: parseFloat(e.target.value) })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Detailed description of the issue, affected systems, error codes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
                </div>
            </Modal>
        </>
    );
}
