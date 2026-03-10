import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Icon from './Icon';

export default function AlertSystem() {
    const navigate = useNavigate();
    const { data } = useStore();
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('secureserv_dismissed_alerts') || '[]'); } catch { return []; }
    });
    const [showPanel, setShowPanel] = useState(false);

    const generateAlerts = useCallback(() => {
        const now = new Date();
        const newAlerts = [];

        // 1. ESCALATION: Tickets open > 24 hours without being dispatched (assigned)
        data.tickets.forEach(t => {
            if (t.status === 'Closed') return;
            const created = new Date(t.createdAt);
            const hoursOpen = (now - created) / (1000 * 60 * 60);

            if (hoursOpen > 24 && !t.assignedTo) {
                newAlerts.push({
                    id: `escalation-${t.id}`,
                    type: 'escalation',
                    severity: 'critical',
                    icon: 'error',
                    title: 'ESCALATION — Unassigned > 24 Hours',
                    message: `"${t.title}" has been open for ${Math.floor(hoursOpen)} hours without dispatch. Immediate action required.`,
                    ticketId: t.id,
                    timestamp: now.toISOString(),
                    actionLabel: 'Assign Now',
                });
            } else if (hoursOpen > 24 && t.status === 'Open') {
                newAlerts.push({
                    id: `escalation-open-${t.id}`,
                    type: 'escalation',
                    severity: 'warning',
                    icon: 'warning',
                    title: 'ESCALATION — Open > 24 Hours',
                    message: `"${t.title}" has been open for ${Math.floor(hoursOpen)} hours. Please review and update status.`,
                    ticketId: t.id,
                    timestamp: now.toISOString(),
                    actionLabel: 'Review Ticket',
                });
            }
        });

        // 2. RETURN CALL / PARTS ORDERED: Alert at 10 AM daily
        const hour = now.getHours();
        const isAlertWindow = hour >= 10 && hour < 11; // 10 AM window

        data.tickets.forEach(t => {
            if (t.status === 'Parts Ordered') {
                newAlerts.push({
                    id: `parts-check-${t.id}`,
                    type: 'return-call',
                    severity: isAlertWindow ? 'critical' : 'info',
                    icon: 'inventory_2',
                    title: isAlertWindow ? '10:00 AM PARTS CHECK' : 'Parts Ordered — Pending',
                    message: `Check if parts have arrived for "${t.title}". ${isAlertWindow ? 'Ready to redispatch?' : 'Materials on order.'}`,
                    ticketId: t.id,
                    timestamp: now.toISOString(),
                    actionLabel: 'Check & Redispatch',
                });
            }
            if (t.status === 'On Hold') {
                newAlerts.push({
                    id: `on-hold-${t.id}`,
                    type: 'return-call',
                    severity: 'warning',
                    icon: 'pause_circle',
                    title: 'Service Call On Hold',
                    message: `"${t.title}" is on hold. Review and determine if ready to redispatch.`,
                    ticketId: t.id,
                    timestamp: now.toISOString(),
                    actionLabel: 'Review Ticket',
                });
            }
        });

        // 3. CRITICAL tickets that are unassigned
        data.tickets.forEach(t => {
            if (t.priority === 'Critical' && !t.assignedTo && t.status !== 'Closed') {
                const existing = newAlerts.find(a => a.ticketId === t.id && a.type === 'escalation');
                if (!existing) {
                    newAlerts.push({
                        id: `critical-unassigned-${t.id}`,
                        type: 'critical',
                        severity: 'critical',
                        icon: 'circle',
                        title: 'CRITICAL — Unassigned',
                        message: `Critical ticket "${t.title}" has no technician assigned.`,
                        ticketId: t.id,
                        timestamp: now.toISOString(),
                        actionLabel: 'Dispatch Now',
                    });
                }
            }
        });

        // Filter out dismissed alerts
        const filtered = newAlerts.filter(a => !dismissed.includes(a.id));
        setAlerts(filtered);
    }, [data, dismissed]);

    useEffect(() => {
        generateAlerts();
        const interval = setInterval(generateAlerts, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [generateAlerts]);

    const dismissAlert = (alertId) => {
        const newDismissed = [...dismissed, alertId];
        setDismissed(newDismissed);
        sessionStorage.setItem('secureserv_dismissed_alerts', JSON.stringify(newDismissed));
    };

    const handleAction = (alert) => {
        if (alert.ticketId) {
            navigate(`/tickets/${alert.ticketId}`);
            setShowPanel(false);
        }
    };

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const totalCount = alerts.length;

    if (totalCount === 0) return null;

    return (
        <>
            {/* Alert Bell in Header */}
            <button className="alert-bell" onClick={() => setShowPanel(!showPanel)}>
                <span className="alert-bell-icon"><Icon name="notifications" size={20} /></span>
                {totalCount > 0 && (
                    <span className={`alert-bell-badge ${criticalCount > 0 ? 'critical' : ''}`}>
                        {totalCount}
                    </span>
                )}
            </button>

            {/* Alert Panel */}
            {showPanel && (
                <>
                    <div className="alert-panel-overlay" onClick={() => setShowPanel(false)} />
                    <div className="alert-panel">
                        <div className="alert-panel-header">
                            <div>
                                <h3>Alerts & Escalations</h3>
                                <span className="text-muted text-sm">{totalCount} active alerts</span>
                            </div>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowPanel(false)}>✕</button>
                        </div>
                        <div className="alert-panel-body">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`alert-card alert-${alert.severity}`}>
                                    <div className="alert-card-header">
                                        <span className="alert-card-icon"><Icon name={alert.icon} size={18} /></span>
                                        <div className="alert-card-info">
                                            <div className="alert-card-title">{alert.title}</div>
                                            <div className="alert-card-message">{alert.message}</div>
                                        </div>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => dismissAlert(alert.id)} title="Dismiss">✕</button>
                                    </div>
                                    <div className="alert-card-actions">
                                        <button className="btn btn-sm btn-primary" onClick={() => handleAction(alert)}>
                                            {alert.actionLabel}
                                        </button>
                                        <span className="alert-card-time">
                                            {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Floating Critical Alert Banner */}
            {criticalCount > 0 && !showPanel && (
                <div className="critical-alert-banner" onClick={() => setShowPanel(true)}>
                    <div className="critical-alert-pulse" />
                    <span className="critical-alert-icon"><Icon name="warning" size={18} /></span>
                    <span>{criticalCount} critical alert{criticalCount > 1 ? 's' : ''} requiring immediate attention</span>
                    <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginLeft: 'auto' }}>View</button>
                </div>
            )}
        </>
    );
}
