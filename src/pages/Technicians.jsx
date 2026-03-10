import { useState } from 'react';
import { useTechnicians } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

const SKILLS = ['CCTV', 'Access Control', 'Fire Alarm', 'Alarm Systems', 'Intrusion Detection', 'Intercom Systems', 'Network Cabling', 'Structured Cabling'];
const STATUSES = ['Available', 'On Job', 'Off Duty', 'On Leave'];

export default function Technicians({ onMenuClick, toast }) {
    const { technicians, addTechnician, updateTechnician, deleteTechnician } = useTechnicians();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', email: '', skills: [], certifications: [], status: 'Available', hireDate: '' });
    const [newCert, setNewCert] = useState('');

    const filtered = technicians.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        if (editId) { updateTechnician(editId, form); toast('Technician updated'); }
        else { addTechnician(form); toast('Technician added'); }
        closeModal();
    };

    const openEdit = (t) => {
        setForm({ name: t.name, phone: t.phone, email: t.email, skills: [...t.skills], certifications: [...t.certifications], status: t.status, hireDate: t.hireDate || '' });
        setEditId(t.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false); setEditId(null);
        setForm({ name: '', phone: '', email: '', skills: [], certifications: [], status: 'Available', hireDate: '' });
    };

    const toggleSkill = (skill) => {
        setForm(f => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill] }));
    };

    const addCert = () => {
        if (newCert.trim() && !form.certifications.includes(newCert.trim())) {
            setForm(f => ({ ...f, certifications: [...f.certifications, newCert.trim()] }));
            setNewCert('');
        }
    };

    return (
        <>
            <PageHeader title="Technicians" subtitle={`${technicians.length} technicians`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Technician</button>
            </PageHeader>

            <div className="page-body">
                <div className="filters-bar">
                    <div className="search-bar">
                        <span className="search-bar-icon">🔍</span>
                        <input placeholder="Search technicians..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {filtered.map(t => (
                        <div key={t.id} className="card" onClick={() => openEdit(t)} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0
                                    }}>{t.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {t.rating} • {t.completedJobs} jobs</div>
                                    </div>
                                </div>
                                <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                                <div>📞 {t.phone}</div>
                                <div>✉️ {t.email}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                                {t.skills.map(s => (
                                    <span key={s} className="badge" style={{ background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', fontSize: 10 }}>{s}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {t.certifications.map(c => (
                                    <span key={c} className="badge" style={{ background: 'var(--accent-warning-dim)', color: 'var(--accent-warning)', fontSize: 10 }}>🏅 {c}</span>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                {STATUSES.filter(s => s !== t.status).slice(0, 2).map(s => (
                                    <button key={s} className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); updateTechnician(t.id, { status: s }); toast(`${t.name} set to ${s}`); }}>→ {s}</button>
                                ))}
                                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete technician?')) { deleteTechnician(t.id); toast('Technician deleted'); } }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit Technician' : 'Add Technician'} size="lg"
                footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Save' : 'Add'}</button></>}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Hire Date</label><input type="date" className="form-input" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></div>
                <div className="form-group">
                    <label className="form-label">Skills</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {SKILLS.map(s => (
                            <button key={s} type="button" className={`filter-chip ${form.skills.includes(s) ? 'active' : ''}`} onClick={() => toggleSkill(s)}>{s}</button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Certifications</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input className="form-input" placeholder="Add certification..." value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCert()} />
                        <button className="btn btn-secondary" onClick={addCert}>Add</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {form.certifications.map(c => (
                            <span key={c} className="badge" style={{ background: 'var(--accent-warning-dim)', color: 'var(--accent-warning)', cursor: 'pointer' }}
                                onClick={() => setForm(f => ({ ...f, certifications: f.certifications.filter(x => x !== c) }))}>
                                🏅 {c} ✕
                            </span>
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
}
