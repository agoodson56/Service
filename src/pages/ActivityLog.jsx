import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';

export default function ActivityLog({ onMenuClick }) {
    const { data } = useStore();
    const log = data.activityLog;

    const getIcon = (action) => {
        switch (action) {
            case 'Created': return '➕';
            case 'Updated': return '✏️';
            case 'Deleted': return '🗑️';
            default: return '📋';
        }
    };

    const getColor = (action) => {
        switch (action) {
            case 'Created': return 'var(--accent-success)';
            case 'Updated': return 'var(--accent-info)';
            case 'Deleted': return 'var(--accent-danger)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <>
            <PageHeader title="Activity Log" subtitle={`${log.length} events logged`} onMenuClick={onMenuClick} />

            <div className="page-body">
                {log.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No activity yet</h3>
                        <p>Events will appear here as you use the system.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr><th style={{ width: 40 }}></th><th>Action</th><th>Entity</th><th>Details</th><th>Timestamp</th></tr>
                            </thead>
                            <tbody>
                                {log.map(entry => (
                                    <tr key={entry.id}>
                                        <td style={{ fontSize: 18 }}>{getIcon(entry.action)}</td>
                                        <td><span className="badge" style={{ background: `${getColor(entry.action)}22`, color: getColor(entry.action) }}>{entry.action}</span></td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.entity}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{entry.details || '—'}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
