import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function Reports({ onMenuClick }) {
    const { data } = useStore();
    const { tickets, technicians, invoices, parts, customers } = data;

    // Ticket stats
    const totalTickets = tickets.length;
    const closedTickets = tickets.filter(t => t.status === 'Closed').length;
    const avgResolution = closedTickets > 0
        ? tickets.filter(t => t.closedAt).reduce((sum, t) => {
            const created = new Date(t.createdAt);
            const closed = new Date(t.closedAt);
            return sum + (closed - created) / (1000 * 60 * 60);
        }, 0) / closedTickets
        : 0;

    // By category
    const categories = {};
    tickets.forEach(t => { categories[t.category] = (categories[t.category] || 0) + 1; });

    // By priority
    const priorities = {};
    tickets.forEach(t => { priorities[t.priority] = (priorities[t.priority] || 0) + 1; });

    // Technician performance
    const techPerformance = technicians.map(t => ({
        ...t,
        activeTickets: tickets.filter(ti => ti.assignedTo === t.id && ti.status !== 'Closed').length,
        closedByTech: tickets.filter(ti => ti.assignedTo === t.id && ti.status === 'Closed').length,
        totalHours: tickets.filter(ti => ti.assignedTo === t.id).reduce((sum, ti) => sum + (ti.laborHours || 0), 0),
    }));

    // Revenue
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalLabor = tickets.reduce((sum, t) => sum + ((t.laborHours || 0) * (t.laborRate || 0)), 0);

    // Inventory value
    const inventoryValue = parts.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
    const inventoryRetail = parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    // Customer types
    const customerTypes = {};
    customers.forEach(c => { customerTypes[c.type] = (customerTypes[c.type] || 0) + 1; });

    const maxCat = Math.max(...Object.values(categories), 1);
    const maxPri = Math.max(...Object.values(priorities), 1);

    return (
        <>
            <PageHeader title="Reports & Analytics" subtitle="Performance metrics and insights" onMenuClick={onMenuClick} />

            <div className="page-body">
                {/* Revenue Overview */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-info-dim)', color: 'var(--accent-info)', fontSize: 22 }}>📊</div><div className="stat-info"><div className="stat-label">Total Tickets</div><div className="stat-value">{totalTickets}</div></div></div>
                    <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-success-dim)', color: 'var(--accent-success)', fontSize: 22 }}>✅</div><div className="stat-info"><div className="stat-label">Closed</div><div className="stat-value">{closedTickets}</div></div></div>
                    <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', fontSize: 22 }}>⏱️</div><div className="stat-info"><div className="stat-label">Avg Resolution</div><div className="stat-value" style={{ fontSize: 20 }}>{avgResolution.toFixed(1)}h</div></div></div>
                    <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-success-dim)', color: 'var(--accent-success)', fontSize: 22 }}>💰</div><div className="stat-info"><div className="stat-label">Total Revenue</div><div className="stat-value" style={{ fontSize: 20 }}>{fmt(totalPaid)}</div></div></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    {/* Tickets by Category */}
                    <div className="card">
                        <h3 className="card-title mb-16">📊 Tickets by Category</h3>
                        {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                            <div key={cat} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span>{cat}</span><span style={{ fontWeight: 600 }}>{count}</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(count / maxCat) * 100}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 4, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tickets by Priority */}
                    <div className="card">
                        <h3 className="card-title mb-16">🎯 Tickets by Priority</h3>
                        {[['Critical', 'var(--accent-danger)'], ['High', 'var(--accent-warning)'], ['Medium', 'var(--accent-info)'], ['Low', 'var(--accent-success)']].map(([pri, color]) => (
                            <div key={pri} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className={`priority-dot ${pri.toLowerCase()}`} />{pri}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{priorities[pri] || 0}</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${((priorities[pri] || 0) / maxPri) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    {/* Financial Summary */}
                    <div className="card">
                        <h3 className="card-title mb-16">💰 Financial Summary</h3>
                        <div className="detail-row"><span className="detail-row-label">Total Invoiced</span><span className="detail-row-value">{fmt(totalInvoiced)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Total Collected</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>{fmt(totalPaid)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Outstanding</span><span className="detail-row-value" style={{ color: 'var(--accent-warning)' }}>{fmt(totalInvoiced - totalPaid)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Total Labor Revenue</span><span className="detail-row-value">{fmt(totalLabor)}</span></div>
                        <div className="detail-row" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, marginTop: 8 }}>
                            <span className="detail-row-label">Collection Rate</span>
                            <span className="detail-row-value" style={{ color: totalInvoiced > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                {totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>

                    {/* Inventory Value */}
                    <div className="card">
                        <h3 className="card-title mb-16">📦 Inventory Overview</h3>
                        <div className="detail-row"><span className="detail-row-label">Total Items</span><span className="detail-row-value">{parts.length}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Total Units</span><span className="detail-row-value">{parts.reduce((s, p) => s + p.quantity, 0)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Inventory Cost</span><span className="detail-row-value">{fmt(inventoryValue)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Retail Value</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>{fmt(inventoryRetail)}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Low Stock Items</span><span className="detail-row-value" style={{ color: 'var(--accent-danger)' }}>{parts.filter(p => p.quantity <= p.reorderLevel).length}</span></div>
                        <div className="detail-row"><span className="detail-row-label">Total Customers</span><span className="detail-row-value">{customers.length}</span></div>
                    </div>
                </div>

                {/* Technician Performance */}
                <div className="card">
                    <h3 className="card-title mb-16">👷 Technician Performance</h3>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr><th>Technician</th><th>Status</th><th>Active Tickets</th><th>Closed Tickets</th><th>Total Jobs</th><th>Hours Logged</th><th>Rating</th></tr>
                            </thead>
                            <tbody>
                                {techPerformance.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                                        <td><span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span></td>
                                        <td>{t.activeTickets}</td>
                                        <td>{t.closedByTech}</td>
                                        <td>{t.completedJobs}</td>
                                        <td>{t.totalHours}h</td>
                                        <td><span style={{ color: 'var(--accent-warning)' }}>⭐ {t.rating}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
