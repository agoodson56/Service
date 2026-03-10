import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function Dashboard({ onMenuClick }) {
    const navigate = useNavigate();
    const {
        openTickets, inProgressTickets, scheduledTickets, closedTickets,
        criticalTickets, availableTechs, onJobTechs,
        totalRevenue, outstandingRevenue, lowStockParts,
        todayTickets, totalTechnicians, activityLog, recentTickets
    } = useDashboard();

    const stats = [
        { label: 'Open Tickets', value: openTickets, icon: 'confirmation_number', color: 'var(--accent-danger)', bg: 'var(--accent-danger-dim)' },
        { label: 'In Progress', value: inProgressTickets, icon: 'sync', color: 'var(--accent-warning)', bg: 'var(--accent-warning-dim)' },
        { label: 'Critical Alerts', value: criticalTickets, icon: 'warning', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
        { label: 'Scheduled', value: scheduledTickets, icon: 'event', color: 'var(--accent-info)', bg: 'var(--accent-info-dim)' },
        { label: 'Techs Available', value: `${availableTechs}/${totalTechnicians}`, icon: 'engineering', color: 'var(--accent-success)', bg: 'var(--accent-success-dim)' },
        { label: 'On Job', value: onJobTechs, icon: 'local_shipping', color: 'var(--accent-warning)', bg: 'var(--accent-warning-dim)' },
        { label: 'Revenue Collected', value: fmt(totalRevenue), icon: 'payments', color: 'var(--accent-success)', bg: 'var(--accent-success-dim)' },
        { label: 'Outstanding', value: fmt(outstandingRevenue), icon: 'request_quote', color: 'var(--accent-warning)', bg: 'var(--accent-warning-dim)' },
        { label: 'Low Stock Parts', value: lowStockParts, icon: 'inventory_2', color: 'var(--accent-warning)', bg: 'var(--accent-warning-dim)' },
        { label: 'Closed Tickets', value: closedTickets, icon: 'task_alt', color: 'var(--accent-success)', bg: 'var(--accent-success-dim)' },
    ];

    const priorityClass = (p) => p?.toLowerCase().replace(' ', '-') || '';
    const statusClass = (s) => s?.toLowerCase().replace(' ', '-') || '';

    return (
        <>
            <PageHeader title="Dashboard" subtitle={`Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
                    + New Service Call
                </button>
            </PageHeader>

            <div className="page-body">
                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-card" style={{ '--stat-color': s.color }}>
                            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                                <Icon name={s.icon} size={22} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value" style={{ color: s.color, fontSize: typeof s.value === 'string' && s.value.includes('$') ? 20 : 26 }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Today's Schedule */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title"><Icon name="event_note" size={18} className="icon-gold" /> Today's Schedule</h3>
                                <div className="card-subtitle">{todayTickets.length} service calls scheduled</div>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/scheduling')}>View Calendar</button>
                        </div>
                        {todayTickets.length === 0 ? (
                            <div className="empty-state" style={{ padding: '30px 20px' }}>
                                <div className="empty-state-icon"><Icon name="event_available" size={40} className="icon-muted" /></div>
                                <h3>No calls scheduled today</h3>
                                <p>All clear! Schedule new service calls to see them here.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Ticket</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayTickets.sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || '')).map(t => (
                                            <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="cursor-pointer">
                                                <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{t.scheduledTime || '—'}</td>
                                                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</td>
                                                <td><span className={`badge badge-${priorityClass(t.priority)}`}>{t.priority}</span></td>
                                                <td><span className={`badge badge-${statusClass(t.status)}`}>{t.status}</span></td>
                                                <td>{t.estimatedDuration}h</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Activity Feed */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title"><Icon name="bolt" size={18} className="icon-gold" /> Recent Activity</h3>
                                <div className="card-subtitle">Latest system events</div>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/activity')}>View All</button>
                        </div>
                        {activityLog.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                No activity yet
                            </div>
                        ) : (
                            <div className="timeline" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {activityLog.slice(0, 15).map(a => (
                                    <div key={a.id} className="timeline-item">
                                        <div className="timeline-item-time">
                                            {new Date(a.timestamp).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </div>
                                        <div className="timeline-item-text">
                                            <strong>{a.action}</strong> {a.entity} {a.details && `— ${a.details}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="card mt-24">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title"><Icon name="confirmation_number" size={18} className="icon-gold" /> Recent Service Tickets</h3>
                            <div className="card-subtitle">Latest tickets across all statuses</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>View All Tickets</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Priority</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTickets.map(t => (
                                    <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="cursor-pointer">
                                        <td><span className={`priority-dot ${priorityClass(t.priority)}`} /></td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</td>
                                        <td>{t.category}</td>
                                        <td><span className={`badge badge-${statusClass(t.status)}`}>{t.status}</span></td>
                                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
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
