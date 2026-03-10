import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function Billing({ onMenuClick, toast }) {
    const navigate = useNavigate();
    const { invoices, customers, addInvoice, updateInvoice, deleteInvoice, getCustomer } = useInvoices();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [form, setForm] = useState({
        customerId: '', dueDate: '', items: [{ description: '', qty: 1, unitPrice: 0 }], notes: '', taxRate: 8.25
    });

    const handleAddItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, unitPrice: 0 }] }));
    const handleRemoveItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
    const handleItemChange = (i, field, value) => {
        setForm(f => {
            const items = [...f.items];
            items[i] = { ...items[i], [field]: value };
            return { ...f, items };
        });
    };

    const subtotal = form.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const tax = subtotal * (form.taxRate / 100);
    const total = subtotal + tax;

    const handleSubmit = () => {
        if (form.items.length === 0 || !form.items[0].description) return;
        addInvoice({ ...form, subtotal, tax, total });
        setShowModal(false);
        setForm({ customerId: '', dueDate: '', items: [{ description: '', qty: 1, unitPrice: 0 }], notes: '', taxRate: 8.25 });
        toast('Invoice created');
    };

    const filtered = invoices.filter(i => filter === 'All' || i.status === filter);

    const totalOutstanding = invoices.reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);

    return (
        <>
            <PageHeader title="Billing & Invoices" subtitle={`${invoices.length} invoices`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Invoice</button>
            </PageHeader>

            <div className="page-body">
                {/* Summary Cards */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card" style={{ '--stat-color': 'var(--accent-info)' }}>
                        <div className="stat-icon" style={{ background: 'var(--accent-info-dim)', color: 'var(--accent-info)' }}>📄</div>
                        <div className="stat-info"><div className="stat-label">Total Invoiced</div><div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalInvoiced)}</div></div>
                    </div>
                    <div className="stat-card" style={{ '--stat-color': 'var(--accent-success)' }}>
                        <div className="stat-icon" style={{ background: 'var(--accent-success-dim)', color: 'var(--accent-success)' }}>💰</div>
                        <div className="stat-info"><div className="stat-label">Total Paid</div><div className="stat-value" style={{ fontSize: 22, color: 'var(--accent-success)' }}>{fmt(totalPaid)}</div></div>
                    </div>
                    <div className="stat-card" style={{ '--stat-color': 'var(--accent-warning)' }}>
                        <div className="stat-icon" style={{ background: 'var(--accent-warning-dim)', color: 'var(--accent-warning)' }}>⏳</div>
                        <div className="stat-info"><div className="stat-label">Outstanding</div><div className="stat-value" style={{ fontSize: 22, color: 'var(--accent-warning)' }}>{fmt(totalOutstanding)}</div></div>
                    </div>
                </div>

                {/* Filter */}
                <div className="filters-bar">
                    {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map(s => (
                        <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
                    ))}
                </div>

                {/* Invoices Table */}
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No invoices found</td></tr>
                            ) : filtered.map(inv => {
                                const customer = getCustomer(inv.customerId);
                                const balance = inv.total - (inv.paidAmount || 0);
                                return (
                                    <tr key={inv.id} className="cursor-pointer" onClick={() => navigate(`/billing/${inv.id}`)}>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{customer?.name || '—'}</td>
                                        <td>{inv.date}</td>
                                        <td>{inv.dueDate || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{fmt(inv.total)}</td>
                                        <td style={{ color: 'var(--accent-success)' }}>{fmt(inv.paidAmount || 0)}</td>
                                        <td style={{ color: balance > 0 ? 'var(--accent-warning)' : 'var(--accent-success)', fontWeight: 600 }}>{fmt(balance)}</td>
                                        <td><span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete invoice?')) { deleteInvoice(inv.id); toast('Invoice deleted'); } }}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Invoice" size="xl"
                footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Create Invoice</button></>}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Customer</label>
                        <select className="form-select" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                            <option value="">— Select —</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                </div>

                <div className="detail-section-title mt-16">Line Items</div>
                {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                        <input className="form-input" placeholder="Description" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} />
                        <input className="form-input" type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => handleItemChange(i, 'qty', parseInt(e.target.value) || 0)} />
                        <input className="form-input" type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => handleItemChange(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveItem(i)}>✕</button>
                    </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={handleAddItem}>+ Add Line Item</button>

                <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="detail-row"><span className="detail-row-label">Subtotal</span><span className="detail-row-value">{fmt(subtotal)}</span></div>
                    <div className="detail-row">
                        <span className="detail-row-label">Tax Rate (%)</span>
                        <input type="number" step="0.01" className="form-input" style={{ width: 80, padding: '4px 8px', textAlign: 'right' }} value={form.taxRate} onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="detail-row"><span className="detail-row-label">Tax</span><span className="detail-row-value">{fmt(tax)}</span></div>
                    <div className="detail-row" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, marginTop: 8 }}>
                        <span className="detail-row-label" style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
                        <span className="detail-row-value" style={{ fontSize: 20, color: 'var(--accent-primary)' }}>{fmt(total)}</span>
                    </div>
                </div>

                <div className="form-group mt-16"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </Modal>
        </>
    );
}
