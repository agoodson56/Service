import { useNavigate } from 'react-router-dom';
import { useTickets } from '../store/useStore';
import PageHeader from '../components/PageHeader';

export default function DispatchBoard({ onMenuClick, toast }) {
    const navigate = useNavigate();
    const { tickets, technicians, getCustomer, getTechnician, updateTicket } = useTickets();

    const columns = [
        { status: 'Open', icon: '🔴', color: 'var(--accent-danger)' },
        { status: 'In Progress', icon: '🟡', color: 'var(--accent-warning)' },
        { status: 'Scheduled', icon: '🔵', color: 'var(--accent-info)' },
        { status: 'Parts Ordered', icon: '🟣', color: 'var(--accent-secondary)' },
    ];

    const handleAssign = (ticketId, techId) => {
        updateTicket(ticketId, { assignedTo: techId, status: 'In Progress' });
        toast('Technician dispatched');
    };

    const priorityClass = (p) => p?.toLowerCase() || '';

    return (
        <>
            <PageHeader title="Dispatch Board" subtitle="Assign technicians and manage active service calls" onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={() => navigate('/tickets')}>+ New Call</button>
            </PageHeader>

            <div className="page-body">
                {/* Available Technicians */}
                <div className="card mb-24">
                    <div className="card-header">
                        <h3 className="card-title">👷 Available Technicians</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {technicians.map(t => (
                            <div key={t.id} style={{
                                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                                background: t.status === 'Available' ? 'var(--accent-success-dim)' : t.status === 'On Job' ? 'var(--accent-warning-dim)' : 'var(--bg-elevated)',
                                border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.status === 'Available' ? 'var(--accent-success)' : t.status === 'On Job' ? 'var(--accent-warning)' : 'var(--text-muted)' }} />
                                <span style={{ fontWeight: 600 }}>{t.name}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dispatch Columns */}
                <div className="dispatch-board">
                    {columns.map(col => {
                        const colTickets = tickets.filter(t => t.status === col.status);
                        return (
                            <div key={col.status} className="dispatch-column">
                                <div className="dispatch-column-header">
                                    <div className="dispatch-column-title">
                                        <span>{col.icon}</span>
                                        <span>{col.status}</span>
                                    </div>
                                    <span className="dispatch-column-count">{colTickets.length}</span>
                                </div>
                                <div className="dispatch-column-body">
                                    {colTickets.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 12 }}>No tickets</div>
                                    ) : colTickets.map(t => {
                                        const customer = getCustomer(t.customerId);
                                        const tech = getTechnician(t.assignedTo);
                                        return (
                                            <div key={t.id} className="dispatch-card" onClick={() => navigate(`/tickets/${t.id}`)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span className={`priority-dot ${priorityClass(t.priority)}`} />
                                                    <span className={`badge badge-${priorityClass(t.priority)}`}>{t.priority}</span>
                                                </div>
                                                <div className="dispatch-card-title">{t.title}</div>
                                                <div className="dispatch-card-meta">
                                                    <span>🏢 {customer?.name || 'No customer'}</span>
                                                    <span>⏱️ {t.estimatedDuration}h</span>
                                                </div>
                                                {t.scheduledTime && (
                                                    <div className="dispatch-card-meta">
                                                        <span>📅 {t.scheduledDate} @ {t.scheduledTime}</span>
                                                    </div>
                                                )}
                                                <div className="dispatch-card-footer">
                                                    <span style={{ fontSize: 12 }}>{tech ? `👷 ${tech.name}` : <span style={{ color: 'var(--accent-danger)' }}>⚠️ Unassigned</span>}</span>
                                                    {!t.assignedTo && (
                                                        <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: 11 }}
                                                            value="" onClick={e => e.stopPropagation()}
                                                            onChange={e => { e.stopPropagation(); handleAssign(t.id, e.target.value); }}>
                                                            <option value="">Assign →</option>
                                                            {technicians.filter(te => te.status === 'Available').map(te => (
                                                                <option key={te.id} value={te.id}>{te.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
