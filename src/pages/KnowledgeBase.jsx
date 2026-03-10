import { useState } from 'react';
import { useKnowledgeBase } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

const CATEGORIES = ['CCTV', 'Access Control', 'Fire Alarm', 'Alarm Systems', 'Intrusion Detection', 'Network', 'General'];

export default function KnowledgeBase({ onMenuClick, toast }) {
    const { articles, addArticle, updateArticle, deleteArticle } = useKnowledgeBase();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expanded, setExpanded] = useState(null);
    const [form, setForm] = useState({ title: '', category: 'General', content: '', tags: '', author: '' });

    const filtered = articles.filter(a => {
        if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !(a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    });

    const handleSubmit = () => {
        if (!form.title.trim()) return;
        const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
        if (editId) { updateArticle(editId, data); toast('Article updated'); }
        else { addArticle(data); toast('Article added'); }
        closeModal();
    };

    const openEdit = (a) => {
        setForm({ title: a.title, category: a.category, content: a.content, tags: (a.tags || []).join(', '), author: a.author || '' });
        setEditId(a.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false); setEditId(null);
        setForm({ title: '', category: 'General', content: '', tags: '', author: '' });
    };

    return (
        <>
            <PageHeader title="Knowledge Base" subtitle={`${articles.length} articles`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Article</button>
            </PageHeader>

            <div className="page-body">
                <div className="filters-bar">
                    <div className="search-bar" style={{ maxWidth: 400 }}>
                        <span className="search-bar-icon">🔍</span>
                        <input placeholder="Search articles or tags..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>All</button>
                        {CATEGORIES.map(c => (
                            <button key={c} className={`filter-chip ${selectedCategory === c ? 'active' : ''}`} onClick={() => setSelectedCategory(c)}>{c}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📚</div><h3>No articles found</h3><p>Create your first knowledge base article to help your team.</p></div>
                    ) : filtered.map(a => (
                        <div key={a.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <span className="badge" style={{ background: 'var(--accent-info-dim)', color: 'var(--accent-info)' }}>{a.category}</span>
                                        <span style={{ fontSize: 15, fontWeight: 700 }}>{a.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {(a.tags || []).map(t => (
                                            <span key={t} className="badge" style={{ background: 'var(--bg-elevated)', fontSize: 10 }}>#{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(a); }}>✏️</button>
                                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete article?')) { deleteArticle(a.id); toast('Article deleted'); } }}>🗑️</button>
                                </div>
                            </div>
                            {expanded === a.id && (
                                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                    {a.content}
                                    {a.author && <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>— {a.author}, {new Date(a.createdAt).toLocaleDateString()}</div>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit Article' : 'New Article'} size="lg"
                footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Save' : 'Create'}</button></>}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group"><label className="form-label">Author</label><input className="form-input" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" style={{ minHeight: 200 }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="alarm, wiring, programming" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
            </Modal>
        </>
    );
}
