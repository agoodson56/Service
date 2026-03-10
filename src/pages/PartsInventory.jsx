import { useState } from 'react';
import { useParts } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

const CATEGORIES = ['CCTV', 'Access Control', 'Fire Alarm', 'Alarm Systems', 'Intrusion Detection', 'Cabling', 'Power', 'Other'];

export default function PartsInventory({ onMenuClick, toast }) {
    const { parts, partOrders, addPart, updatePart, deletePart, addPartOrder, updatePartOrder } = useParts();
    const [tab, setTab] = useState('inventory');
    const [showModal, setShowModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', sku: '', category: 'CCTV', price: 0, cost: 0, quantity: 0, reorderLevel: 5, vendor: '', location: '', description: '' });
    const [orderForm, setOrderForm] = useState({ partId: '', partName: '', sku: '', vendor: '', quantity: 1, unitCost: 0, totalCost: 0, expectedDate: '', notes: '' });

    const filtered = parts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        if (editId) { updatePart(editId, form); toast('Part updated'); }
        else { addPart(form); toast('Part added'); }
        closeModal();
    };

    const handleOrder = () => {
        if (!orderForm.partName.trim()) return;
        addPartOrder({ ...orderForm, totalCost: orderForm.quantity * orderForm.unitCost });
        setShowOrderModal(false);
        setOrderForm({ partId: '', partName: '', sku: '', vendor: '', quantity: 1, unitCost: 0, totalCost: 0, expectedDate: '', notes: '' });
        toast('Part order placed');
    };

    const openEdit = (p) => {
        setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, cost: p.cost, quantity: p.quantity, reorderLevel: p.reorderLevel, vendor: p.vendor, location: p.location, description: p.description });
        setEditId(p.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false); setEditId(null);
        setForm({ name: '', sku: '', category: 'CCTV', price: 0, cost: 0, quantity: 0, reorderLevel: 5, vendor: '', location: '', description: '' });
    };

    const openOrderForPart = (p) => {
        setOrderForm({ partId: p.id, partName: p.name, sku: p.sku, vendor: p.vendor, quantity: p.reorderLevel * 2, unitCost: p.cost, totalCost: 0, expectedDate: '', notes: '' });
        setShowOrderModal(true);
    };

    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    return (
        <>
            <PageHeader title="Parts & Inventory" subtitle={`${parts.length} items tracked`} onMenuClick={onMenuClick}>
                <button className="btn btn-secondary" onClick={() => setShowOrderModal(true)}>📦 Order Parts</button>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Part</button>
            </PageHeader>

            <div className="page-body">
                <div className="tabs">
                    <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>📦 Inventory ({parts.length})</button>
                    <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>🛒 Orders ({partOrders.length})</button>
                    <button className={`tab ${tab === 'low-stock' ? 'active' : ''}`} onClick={() => setTab('low-stock')}>⚠️ Low Stock ({parts.filter(p => p.quantity <= p.reorderLevel).length})</button>
                </div>

                {tab === 'inventory' && (
                    <>
                        <div className="filters-bar">
                            <div className="search-bar">
                                <span className="search-bar-icon">🔍</span>
                                <input placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Part</th><th>SKU</th><th>Category</th><th>In Stock</th><th>Reorder @</th><th>Cost</th><th>Price</th><th>Margin</th><th>Location</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <tr key={p.id} className="cursor-pointer" onClick={() => openEdit(p)}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{p.sku}</td>
                                            <td><span className="badge" style={{ background: 'var(--bg-elevated)' }}>{p.category}</span></td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: p.quantity <= p.reorderLevel ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                                                    {p.quantity} {p.quantity <= p.reorderLevel && '⚠️'}
                                                </span>
                                            </td>
                                            <td>{p.reorderLevel}</td>
                                            <td>{fmt(p.cost)}</td>
                                            <td>{fmt(p.price)}</td>
                                            <td style={{ color: 'var(--accent-success)' }}>{((1 - p.cost / p.price) * 100).toFixed(0)}%</td>
                                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.location}</td>
                                            <td>
                                                <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); openOrderForPart(p); }}>Order</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {tab === 'orders' && (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr><th>Part</th><th>SKU</th><th>Vendor</th><th>Qty</th><th>Total Cost</th><th>Status</th><th>Order Date</th><th>Expected</th><th>Tracking</th><th></th></tr>
                            </thead>
                            <tbody>
                                {partOrders.length === 0 ? (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders</td></tr>
                                ) : partOrders.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.partName}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{o.sku}</td>
                                        <td>{o.vendor}</td>
                                        <td>{o.quantity}</td>
                                        <td>{fmt(o.totalCost)}</td>
                                        <td><span className={`badge ${o.status === 'Received' ? 'badge-closed' : o.status === 'Shipped' ? 'badge-in-progress' : 'badge-scheduled'}`}>{o.status}</span></td>
                                        <td>{o.orderDate}</td>
                                        <td>{o.expectedDate || '—'}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{o.trackingNumber || '—'}</td>
                                        <td>
                                            {o.status === 'Ordered' && <button className="btn btn-sm btn-secondary" onClick={() => { updatePartOrder(o.id, { status: 'Shipped' }); toast('Marked as shipped'); }}>Ship</button>}
                                            {o.status === 'Shipped' && <button className="btn btn-sm btn-success" onClick={() => { updatePartOrder(o.id, { status: 'Received' }); toast('Marked as received'); }}>Receive</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'low-stock' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {parts.filter(p => p.quantity <= p.reorderLevel).map(p => (
                            <div key={p.id} className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                                    <span className="badge badge-critical">⚠️ Low Stock</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    <div>In Stock: <strong style={{ color: 'var(--accent-danger)' }}>{p.quantity}</strong> / Reorder at: {p.reorderLevel}</div>
                                    <div>Vendor: {p.vendor}</div>
                                </div>
                                <button className="btn btn-primary btn-sm mt-8 w-full" onClick={() => openOrderForPart(p)}>📦 Reorder Now</button>
                            </div>
                        ))}
                        {parts.filter(p => p.quantity <= p.reorderLevel).length === 0 && (
                            <div className="empty-state"><div className="empty-state-icon">✅</div><h3>All stock levels healthy</h3></div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Part Modal */}
            <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit Part' : 'Add Part'} size="lg"
                footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Save' : 'Add Part'}</button></>}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Part Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Cost ($)</label><input type="number" step="0.01" className="form-input" value={form.cost} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} /></div>
                    <div className="form-group"><label className="form-label">Sale Price ($)</label><input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Quantity in Stock</label><input type="number" className="form-input" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} /></div>
                    <div className="form-group"><label className="form-label">Reorder Level</label><input type="number" className="form-input" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Warehouse Location</label><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </Modal>

            {/* Order Part Modal */}
            <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Order Parts" size="lg"
                footer={<><button className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleOrder}>Place Order</button></>}>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Part Name *</label><input className="form-input" value={orderForm.partName} onChange={e => setOrderForm({ ...orderForm, partName: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={orderForm.sku} onChange={e => setOrderForm({ ...orderForm, sku: e.target.value })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" value={orderForm.vendor} onChange={e => setOrderForm({ ...orderForm, vendor: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-input" value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Unit Cost ($)</label><input type="number" step="0.01" className="form-input" value={orderForm.unitCost} onChange={e => setOrderForm({ ...orderForm, unitCost: parseFloat(e.target.value) || 0 })} /></div>
                    <div className="form-group"><label className="form-label">Expected Delivery</label><input type="date" className="form-input" value={orderForm.expectedDate} onChange={e => setOrderForm({ ...orderForm, expectedDate: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} /></div>
            </Modal>
        </>
    );
}
