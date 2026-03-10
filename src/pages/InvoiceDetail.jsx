import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../store/useStore';
import PageHeader from '../components/PageHeader';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function InvoiceDetail({ onMenuClick, toast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getInvoice, getCustomer, updateInvoice } = useInvoices();

    const invoice = getInvoice(id);
    if (!invoice) return (
        <>
            <PageHeader title="Invoice Not Found" onMenuClick={onMenuClick} />
            <div className="page-body">
                <div className="empty-state"><div className="empty-state-icon">📄</div><h3>Invoice not found</h3>
                    <button className="btn btn-primary mt-16" onClick={() => navigate('/billing')}>Back to Billing</button>
                </div>
            </div>
        </>
    );

    const customer = getCustomer(invoice.customerId);
    const balance = invoice.total - (invoice.paidAmount || 0);

    const handleMarkPaid = () => {
        updateInvoice(id, { status: 'Paid', paidAmount: invoice.total });
        toast('Invoice marked as paid');
    };

    const handleSend = () => {
        updateInvoice(id, { status: 'Sent' });
        toast('Invoice marked as sent');
    };

    return (
        <>
            <PageHeader title={invoice.invoiceNumber} subtitle="Invoice Detail" onMenuClick={onMenuClick}>
                <button className="btn btn-secondary" onClick={() => navigate('/billing')}>← Back</button>
                {invoice.status === 'Draft' && <button className="btn btn-info" onClick={handleSend} style={{ background: 'var(--accent-info-dim)', color: 'var(--accent-info)', borderColor: 'rgba(59,130,246,0.3)' }}>📧 Send Invoice</button>}
                {invoice.status !== 'Paid' && <button className="btn btn-success" onClick={handleMarkPaid}>💰 Mark Paid</button>}
                <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print</button>
            </PageHeader>

            <div className="page-body">
                <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SecureServ Pro</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>5500 Security Way, Dallas, TX 75201</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>(555) 100-2000 • dispatch@secureservpro.com</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>INVOICE</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent-primary)', fontWeight: 600 }}>{invoice.invoiceNumber}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Date: {invoice.date}</div>
                            {invoice.dueDate && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: {invoice.dueDate}</div>}
                            <span className={`badge badge-${invoice.status.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-flex' }}>{invoice.status}</span>
                        </div>
                    </div>

                    {/* Bill To */}
                    {customer && (
                        <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Bill To</div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{customer.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer.contact}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer.address}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer.email}</div>
                        </div>
                    )}

                    {/* Line Items */}
                    <div className="table-wrapper" style={{ marginBottom: 24 }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
                            </thead>
                            <tbody>
                                {(invoice.items || []).map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.description}</td>
                                        <td style={{ textAlign: 'right' }}>{item.qty}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(item.unitPrice)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.qty * item.unitPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 280, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <div className="detail-row"><span className="detail-row-label">Subtotal</span><span className="detail-row-value">{fmt(invoice.subtotal)}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Tax</span><span className="detail-row-value">{fmt(invoice.tax)}</span></div>
                            <div className="detail-row" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, marginTop: 8 }}>
                                <span className="detail-row-label" style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
                                <span className="detail-row-value" style={{ fontSize: 18, color: 'var(--accent-primary)' }}>{fmt(invoice.total)}</span>
                            </div>
                            {invoice.paidAmount > 0 && (
                                <div className="detail-row"><span className="detail-row-label">Paid</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>-{fmt(invoice.paidAmount)}</span></div>
                            )}
                            {balance > 0 && (
                                <div className="detail-row"><span className="detail-row-label" style={{ fontWeight: 700 }}>Balance Due</span><span className="detail-row-value" style={{ color: 'var(--accent-warning)', fontSize: 16, fontWeight: 700 }}>{fmt(balance)}</span></div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
                            <strong>Notes:</strong> {invoice.notes}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
