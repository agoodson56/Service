import { useState } from 'react';
import SignaturePad from './SignaturePad';

export default function CloseTicketModal({ ticket, customer, technician, onClose, onConfirm }) {
    const [step, setStep] = useState('summary'); // summary -> signature -> sending -> done
    const [workNotes, setWorkNotes] = useState('');
    const [signature, setSignature] = useState(null);
    const [emailSent, setEmailSent] = useState(false);

    const handleSignature = (dataUrl) => {
        setSignature(dataUrl);
        setStep('sending');

        // Simulate sending email
        setTimeout(() => {
            setEmailSent(true);
            setStep('done');
        }, 2000);
    };

    const handleFinalClose = () => {
        onConfirm({
            signature,
            workNotes,
            closedAt: new Date().toISOString(),
            emailSentToCustomer: true,
            serviceReport: {
                generatedAt: new Date().toISOString(),
                technicianName: technician?.name || 'Unknown',
                customerName: customer?.name || 'Unknown',
                customerEmail: customer?.email || '',
            }
        });
    };

    const laborTotal = ((ticket.laborHours || 0) * (ticket.laborRate || 95)).toFixed(2);

    if (step === 'sending') {
        return (
            <div className="modal-overlay">
                <div className="modal" style={{ maxWidth: 480, textAlign: 'center' }}>
                    <div className="modal-body" style={{ padding: 48 }}>
                        <div className="sending-animation">
                            <div className="sending-icon">📨</div>
                            <div className="sending-pulse" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>
                            Closing Ticket & Sending Report...
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Generating service completion report and emailing to {customer?.email || 'customer'}
                        </p>
                        <div className="sending-steps">
                            <div className="sending-step done">✅ Customer signature captured</div>
                            <div className="sending-step done">✅ Service report generated</div>
                            <div className="sending-step active">📧 Emailing report to customer...</div>
                            <div className="sending-step pending">📋 Notifying dispatcher</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="modal-overlay">
                <div className="modal" style={{ maxWidth: 520, textAlign: 'center' }}>
                    <div className="modal-body" style={{ padding: 48 }}>
                        <div className="success-checkmark">
                            <div className="success-icon">✅</div>
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 20, marginBottom: 8, color: 'var(--accent-success)' }}>
                            Service Ticket Closed
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                            The service completion report has been emailed to <strong>{customer?.email || 'the customer'}</strong>
                            and the dispatcher has been notified.
                        </p>

                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'left', marginBottom: 24 }}>
                            <div className="detail-row"><span className="detail-row-label">Ticket</span><span className="detail-row-value">{ticket.title}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Technician</span><span className="detail-row-value">{technician?.name}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Customer</span><span className="detail-row-value">{customer?.name}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Labor</span><span className="detail-row-value">{ticket.laborHours || 0}h × ${ticket.laborRate}/hr = ${laborTotal}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Report Emailed</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>✅ Sent</span></div>
                            <div className="detail-row"><span className="detail-row-label">Dispatcher</span><span className="detail-row-value" style={{ color: 'var(--accent-success)' }}>✅ Notified</span></div>
                        </div>

                        {signature && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Customer Signature</div>
                                <img src={signature} alt="Customer Signature" style={{ maxWidth: 280, height: 80, objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)', padding: 8, background: 'var(--bg-input)' }} />
                            </div>
                        )}

                        <button className="btn btn-primary btn-lg" onClick={handleFinalClose}>Done</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'signature') {
        return (
            <div className="modal-overlay">
                <div className="modal modal-lg">
                    <div className="modal-header">
                        <h3>📝 Customer Signature — {ticket.title}</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => setStep('summary')}>←</button>
                    </div>
                    <div className="modal-body">
                        <SignaturePad
                            onSave={handleSignature}
                            onCancel={() => setStep('summary')}
                            customerName={customer?.contact || customer?.name}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Step: summary
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg">
                <div className="modal-header">
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Close Service Ticket</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ticket.title}</div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Service Summary */}
                    <div className="close-ticket-summary">
                        <div className="summary-section">
                            <div className="summary-section-title">Service Details</div>
                            <div className="detail-row"><span className="detail-row-label">Ticket</span><span className="detail-row-value">{ticket.title}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Category</span><span className="detail-row-value">{ticket.category}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Customer</span><span className="detail-row-value">{customer?.name || '—'}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Address</span><span className="detail-row-value" style={{ fontSize: 12 }}>{customer?.address || '—'}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Technician</span><span className="detail-row-value">{technician?.name || '—'}</span></div>
                        </div>

                        <div className="summary-section">
                            <div className="summary-section-title">Billing Summary</div>
                            <div className="detail-row"><span className="detail-row-label">Labor Rate</span><span className="detail-row-value">${ticket.laborRate}/hr</span></div>
                            <div className="detail-row"><span className="detail-row-label">Hours Worked</span><span className="detail-row-value">{ticket.laborHours || 0}h</span></div>
                            <div className="detail-row" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, marginTop: 4 }}>
                                <span className="detail-row-label" style={{ fontWeight: 700 }}>Labor Total</span>
                                <span className="detail-row-value" style={{ color: 'var(--accent-primary)', fontSize: 16 }}>${laborTotal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Work Notes */}
                    <div className="form-group mt-16">
                        <label className="form-label">Completion Notes</label>
                        <textarea className="form-textarea" rows={3}
                            placeholder="Describe work performed, parts used, any follow-up needed..."
                            value={workNotes} onChange={e => setWorkNotes(e.target.value)}
                        />
                    </div>

                    {/* What happens next */}
                    <div className="close-ticket-info">
                        <div className="close-ticket-info-title">📋 What happens when you close this ticket:</div>
                        <ul>
                            <li>Customer will be asked to sign on the device</li>
                            <li>A service completion report will be generated</li>
                            <li>The report will be emailed to <strong>{customer?.email || 'the customer'}</strong></li>
                            <li>The dispatcher will receive a notification</li>
                            <li>The ticket will be marked as Closed</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-success btn-lg" onClick={() => setStep('signature')}>
                        ✍️ Proceed to Customer Signature
                    </button>
                </div>
            </div>
        </div>
    );
}
