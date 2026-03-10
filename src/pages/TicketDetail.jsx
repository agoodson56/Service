import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import CloseTicketModal from '../components/CloseTicketModal';
import PartScanner from '../components/PartScanner';
import Icon from '../components/Icon';

const STATUSES = ['Open', 'In Progress', 'Scheduled', 'Parts Ordered', 'On Hold', 'Closed'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export default function TicketDetail({ onMenuClick, toast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tickets, customers, technicians, getTicket, updateTicket, addTicketNote, getCustomer, getTechnician } = useTickets();
    const [newNote, setNewNote] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showPartScanner, setShowPartScanner] = useState(false);

    const ticket = getTicket(id);
    if (!ticket) return (
        <>
            <PageHeader title="Ticket Not Found" onMenuClick={onMenuClick} />
            <div className="page-body">
                <div className="empty-state">
                    <div className="empty-state-icon"><Icon name="confirmation_number" size={40} className="icon-muted" /></div>
                    <h3>Ticket not found</h3>
                    <p>This ticket may have been deleted.</p>
                    <button className="btn btn-primary mt-16" onClick={() => navigate('/tickets')}>Back to Tickets</button>
                </div>
            </div>
        </>
    );

    const customer = getCustomer(ticket.customerId);
    const tech = getTechnician(ticket.assignedTo);

    // Check if escalated (open > 24 hours)
    const hoursOpen = (new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60);
    const isEscalated = hoursOpen > 24 && ticket.status !== 'Closed' && (ticket.status === 'Open' || !ticket.assignedTo);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        addTicketNote(id, newNote);
        setNewNote('');
        toast('Note added');
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'Closed') {
            // Enforce: if ticket has parts ordered, must have part photos
            const hasParts = ticket.status === 'Parts Ordered' || ticket.partsUsed?.length > 0;
            const hasPartPhotos = ticket.partPhotos?.length > 0;
            if (hasParts && !hasPartPhotos) {
                toast('Parts tickets require part photos before closing. Use the Part Scanner to add photos.', 'error');
                return;
            }
            setShowCloseModal(true);
            return;
        }
        updateTicket(id, { status: newStatus });
        toast(`Ticket status updated to ${newStatus}`);
    };

    const handlePartIdentified = (partData) => {
        const existingPhotos = ticket.partPhotos || [];
        updateTicket(id, {
            partPhotos: [...existingPhotos, { ...partData, id: Date.now().toString(), addedAt: new Date().toISOString() }]
        });
        setShowPartScanner(false);
        toast('Part identified and added to ticket');
    };

    const removePartPhoto = (partId) => {
        updateTicket(id, {
            partPhotos: (ticket.partPhotos || []).filter(p => p.id !== partId)
        });
        toast('Part photo removed');
    };

    const handleCloseConfirm = (closeData) => {
        updateTicket(id, {
            status: 'Closed',
            closedAt: closeData.closedAt,
            signature: closeData.signature,
            serviceReport: closeData.serviceReport,
            emailSentToCustomer: true,
        });
        if (closeData.workNotes) {
            addTicketNote(id, `[CLOSE NOTE] ${closeData.workNotes}`);
        }
        addTicketNote(id, `✅ Ticket closed with customer signature. Service report emailed to ${customer?.email || 'customer'}.`);
        setShowCloseModal(false);
        toast('Ticket closed — report emailed to customer');
    };

    const priorityClass = (p) => p?.toLowerCase().replace(' ', '-') || '';
    const statusClass = (s) => s?.toLowerCase().replace(' ', '-') || '';

    return (
        <>
            <PageHeader title={ticket.title} subtitle={`${ticket.category} • ${ticket.status}`} onMenuClick={onMenuClick}>
                <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>← Back</button>
                {ticket.status !== 'Closed' && (
                    <button className="btn btn-success" onClick={() => setShowCloseModal(true)}>
                        <Icon name="draw" size={16} /> Close with Signature
                    </button>
                )}
            </PageHeader>

            <div className="page-body">
                {/* Escalation Banner */}
                {isEscalated && (
                    <div className="escalation-banner">
                        <div className="escalation-banner-pulse" />
                        <span className="escalation-banner-icon"><Icon name="warning" size={22} /></span>
                        <div>
                            <strong>ESCALATED</strong> — This ticket has been open for {Math.floor(hoursOpen)} hours
                            {!ticket.assignedTo ? ' and has no technician assigned' : ''}. Immediate action required.
                        </div>
                    </div>
                )}

                <div className="detail-grid">
                    {/* Left Column */}
                    <div>
                        {/* Description */}
                        <div className="card mb-24">
                            <div className="card-header">
                                <h3 className="card-title"><Icon name="description" size={18} className="icon-gold" /> Description</h3>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span className={`badge badge-${priorityClass(ticket.priority)}`}>{ticket.priority}</span>
                                    {isEscalated && <span className="badge badge-critical" style={{ animation: 'pulse 2s infinite' }}>⚠️ ESCALATED</span>}
                                </div>
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{ticket.description || 'No description provided.'}</p>
                        </div>

                        {/* Status Actions */}
                        <div className="card mb-24">
                            <div className="card-header">
                                <h3 className="card-title"><Icon name="sync" size={18} className="icon-gold" /> Update Status</h3>
                                <span className={`badge badge-${statusClass(ticket.status)}`}>{ticket.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {STATUSES.map(s => (
                                    <button key={s} className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleStatusChange(s)}>
                                        {s === 'Closed' ? 'Close with Signature' : s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="card mb-24">
                            <div className="card-header">
                                <h3 className="card-title"><Icon name="engineering" size={18} className="icon-gold" /> Assignment & Schedule</h3>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Assigned Technician</label>
                                    <select className="form-select" value={ticket.assignedTo || ''} onChange={e => { updateTicket(id, { assignedTo: e.target.value }); toast('Technician assigned'); }}>
                                        <option value="">— Unassigned —</option>
                                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" value={ticket.priority} onChange={e => { updateTicket(id, { priority: e.target.value }); toast('Priority updated'); }}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Scheduled Date</label>
                                    <input type="date" className="form-input" value={ticket.scheduledDate || ''} onChange={e => { updateTicket(id, { scheduledDate: e.target.value }); toast('Schedule updated'); }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Scheduled Time</label>
                                    <input type="time" className="form-input" value={ticket.scheduledTime || ''} onChange={e => { updateTicket(id, { scheduledTime: e.target.value }); toast('Time updated'); }} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Estimated Duration (hrs)</label>
                                    <input type="number" className="form-input" min="0.5" step="0.5" value={ticket.estimatedDuration || 0} onChange={e => updateTicket(id, { estimatedDuration: parseFloat(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Labor Hours Logged</label>
                                    <input type="number" className="form-input" min="0" step="0.25" value={ticket.laborHours || 0} onChange={e => updateTicket(id, { laborHours: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                        </div>

                        {/* Part Photos & Identification */}
                        <div className="card mb-24">
                            <div className="card-header">
                                <h3 className="card-title"><Icon name="photo_camera" size={18} className="icon-gold" /> Part Photos & Identification</h3>
                                {ticket.status !== 'Closed' && (
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowPartScanner(true)}>
                                        <Icon name="photo_camera" size={14} /> Scan Part
                                    </button>
                                )}
                            </div>
                            {(ticket.status === 'Parts Ordered' || ticket.partsUsed?.length > 0) && !(ticket.partPhotos?.length > 0) && (
                                <div style={{ padding: '12px 16px', background: 'var(--accent-warning-dim)', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: 12, color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    ⚠️ This ticket requires part photos with part number, model, and manufacturer to close.
                                </div>
                            )}
                            {(ticket.partPhotos || []).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
                                    No parts scanned yet. Use the scanner to photograph and identify parts.
                                </div>
                            ) : (
                                <div className="part-photos-grid">
                                    {(ticket.partPhotos || []).map(part => (
                                        <div key={part.id} className="part-photo-card">
                                            <div className="part-photo-img">
                                                <img src={part.photo} alt={part.model || 'Part'} />
                                            </div>
                                            <div className="part-photo-info">
                                                <div className="part-photo-field"><label>Part #</label><span>{part.partNumber}</span></div>
                                                <div className="part-photo-field"><label>Model</label><span>{part.model}</span></div>
                                                <div className="part-photo-field"><label>Mfr</label><span>{part.manufacturer}</span></div>
                                                <div className="part-photo-field"><label>Type</label><span>{part.category}</span></div>
                                                {part.confidence && (
                                                    <div className="part-photo-field">
                                                        <label>AI Confidence</label>
                                                        <span className={`confidence-badge confidence-${part.confidence}`}>
                                                            {part.confidence === 'high' ? '✅' : '⚠️'} {part.confidence}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {ticket.status !== 'Closed' && (
                                                <button className="btn btn-ghost btn-sm" onClick={() => removePartPhoto(part.id)} title="Remove">
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title"><Icon name="chat" size={18} className="icon-gold" /> Notes & Updates</h3>
                                <span className="text-muted text-sm">{(ticket.notes || []).length} notes</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <input className="form-input" placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                                <button className="btn btn-primary" onClick={handleAddNote}>Add</button>
                            </div>
                            {(ticket.notes || []).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No notes yet.</div>
                            ) : (
                                <div className="timeline">
                                    {[...(ticket.notes || [])].reverse().map(n => (
                                        <div key={n.id} className="timeline-item">
                                            <div className="timeline-item-time">{new Date(n.timestamp).toLocaleString()}</div>
                                            <div className="timeline-item-text">{n.text}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Info Card */}
                        <div className="card mb-24">
                            <h3 className="card-title" style={{ marginBottom: 16 }}><Icon name="info" size={18} className="icon-gold" /> Ticket Info</h3>
                            <div className="detail-row"><span className="detail-row-label">Status</span><span className={`badge badge-${statusClass(ticket.status)}`}>{ticket.status}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Priority</span><span className={`badge badge-${priorityClass(ticket.priority)}`}>{ticket.priority}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Category</span><span className="detail-row-value">{ticket.category}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Created</span><span className="detail-row-value" style={{ fontSize: 12 }}>{new Date(ticket.createdAt).toLocaleString()}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Updated</span><span className="detail-row-value" style={{ fontSize: 12 }}>{new Date(ticket.updatedAt).toLocaleString()}</span></div>
                            {ticket.closedAt && <div className="detail-row"><span className="detail-row-label">Closed</span><span className="detail-row-value" style={{ fontSize: 12 }}>{new Date(ticket.closedAt).toLocaleString()}</span></div>}
                            {isEscalated && <div className="detail-row"><span className="detail-row-label">⚠️ Escalated</span><span className="detail-row-value" style={{ color: 'var(--accent-danger)' }}>{Math.floor(hoursOpen)}h open</span></div>}
                        </div>

                        {/* Customer Info */}
                        <div className="card mb-24">
                            <h3 className="card-title" style={{ marginBottom: 16 }}><Icon name="domain" size={18} className="icon-gold" /> Customer</h3>
                            {customer ? (
                                <>
                                    <div className="detail-row"><span className="detail-row-label">Name</span><span className="detail-row-value">{customer.name}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Contact</span><span className="detail-row-value">{customer.contact}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Phone</span><span className="detail-row-value">{customer.phone}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Email</span><span className="detail-row-value" style={{ fontSize: 11 }}>{customer.email}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Type</span><span className="detail-row-value">{customer.contractType}</span></div>
                                </>
                            ) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No customer assigned</div>}
                        </div>

                        {/* Technician Info */}
                        <div className="card mb-24">
                            <h3 className="card-title" style={{ marginBottom: 16 }}><Icon name="engineering" size={18} className="icon-gold" /> Technician</h3>
                            {tech ? (
                                <>
                                    <div className="detail-row"><span className="detail-row-label">Name</span><span className="detail-row-value">{tech.name}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Phone</span><span className="detail-row-value">{tech.phone}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Status</span><span className={`badge badge-${tech.status.toLowerCase().replace(' ', '-')}`}>{tech.status}</span></div>
                                    <div className="detail-row"><span className="detail-row-label">Rating</span><span className="detail-row-value">⭐ {tech.rating}</span></div>
                                </>
                            ) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No technician assigned</div>}
                        </div>

                        {/* Billing */}
                        <div className="card mb-24">
                            <h3 className="card-title" style={{ marginBottom: 16 }}><Icon name="payments" size={18} className="icon-gold" /> Billing</h3>
                            <div className="detail-row"><span className="detail-row-label">Labor Rate</span><span className="detail-row-value">${ticket.laborRate}/hr</span></div>
                            <div className="detail-row"><span className="detail-row-label">Hours Logged</span><span className="detail-row-value">{ticket.laborHours || 0}h</span></div>
                            <div className="detail-row"><span className="detail-row-label">Labor Total</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>${((ticket.laborHours || 0) * ticket.laborRate).toFixed(2)}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Billing Status</span><span className={`badge ${ticket.billingStatus === 'Billed' ? 'badge-paid' : 'badge-draft'}`}>{ticket.billingStatus}</span></div>
                        </div>

                        {/* Signature (if closed) */}
                        {ticket.signature && (
                            <div className="card">
                                <h3 className="card-title" style={{ marginBottom: 16 }}><Icon name="draw" size={18} className="icon-gold" /> Customer Signature</h3>
                                <img src={ticket.signature} alt="Customer Signature" style={{
                                    width: '100%', maxHeight: 120, objectFit: 'contain',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)',
                                    padding: 12, background: 'var(--bg-input)'
                                }} />
                                {ticket.emailSentToCustomer && (
                                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--accent-success-dim)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        📧 Service report emailed to customer
                                    </div>
                                )}
                                {ticket.serviceReport && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                                        Closed by {ticket.serviceReport.technicianName} on {new Date(ticket.serviceReport.generatedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close Ticket Modal */}
            {showCloseModal && (
                <CloseTicketModal
                    ticket={ticket}
                    customer={customer}
                    technician={tech}
                    onClose={() => setShowCloseModal(false)}
                    onConfirm={handleCloseConfirm}
                />
            )}
            {showPartScanner && (
                <PartScanner
                    onPartIdentified={handlePartIdentified}
                    onClose={() => setShowPartScanner(false)}
                    toast={toast}
                />
            )}
        </>
    );
}
