import { useState } from 'react';
import { useCustomers } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

export default function Customers({ onMenuClick, toast }) {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '', type: 'Commercial', contractType: 'Standard', notes: '' });

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        if (editId) { updateCustomer(editId, form); toast('Customer updated'); }
        else { addCustomer(form); toast('Customer added'); }
        closeModal();
    };

    const openEdit = (c) => {
        setForm({ name: c.name, contact: c.contact, phone: c.phone, email: c.email, address: c.address, type: c.type, contractType: c.contractType, notes: c.notes });
        setEditId(c.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false); setEditId(null);
        setForm({ name: '', contact: '', phone: '', email: '', address: '', type: 'Commercial', contractType: 'Standard', notes: '' });
    };

    return (
        <>
            <PageHeader title="Customers" subtitle={`${customers.length} customers`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
            </PageHeader>

            <div className="page-body">
                <div className="filters-bar">
                    <div className="search-bar">
                        <span className="search-bar-icon">🔍</span>
                        <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {filtered.map(c => (
                        <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEdit(c)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.contact}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className="badge" style={{ background: c.type === 'Commercial' ? 'var(--accent-info-dim)' : 'var(--accent-success-dim)', color: c.type === 'Commercial' ? 'var(--accent-info)' : 'var(--accent-success)' }}>{c.type}</span>
                                    <span className="badge" style={{ background: 'var(--bg-elevated)' }}>{c.contractType}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div>📞 {c.phone}</div>
                                <div>✉️ {c.email}</div>
                                <div>📍 {c.address}</div>
                            </div>
                            {c.notes && <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>{c.notes}</div>}
                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete customer?')) { deleteCustomer(c.id); toast('Customer deleted'); } }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit Customer' : 'Add Customer'} size="lg"
                footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Save Changes' : 'Add Customer'}</button></>}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Company / Customer Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option>Commercial</option><option>Residential</option><option>Government</option><option>Education</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contract Type</label>
                        <select className="form-select" value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value })}>
                            <option>Basic</option><option>Standard</option><option>Premium</option><option>Enterprise</option>
                        </select>
                    </div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </Modal>
        </>
    );
}
