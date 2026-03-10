import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import Icon from '../components/Icon';

const DEMO_CUSTOMERS = {
    'apex': { id: 'apex', name: 'Apex Corporate Tower', contact: 'James Mitchell', email: 'jmitchell@apexcorp.com', phone: '(555) 234-5678', pin: '1234' },
    'henderson': { id: 'henderson', name: 'Henderson Family', contact: 'Mark Henderson', email: 'mark.h@email.com', phone: '(555) 678-9012', pin: '1234' },
    'metro': { id: 'metro', name: 'Metro Shopping Center', contact: 'Lisa Park', email: 'lpark@metroshop.com', phone: '(555) 345-6789', pin: '1234' },
};

export default function CustomerPortal() {
    const { data, addTicket, toast } = useStore();
    const [loggedIn, setLoggedIn] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [loginId, setLoginId] = useState('');
    const [loginPin, setLoginPin] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('tickets');
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'General', priority: 'Medium' });

    const handleLogin = (e) => {
        e.preventDefault();
        const found = DEMO_CUSTOMERS[loginId.toLowerCase()];
        if (found && loginPin === found.pin) {
            setCustomer(found);
            setLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Invalid account ID or PIN. Please try again.');
        }
    };

    const handleLogout = () => {
        setLoggedIn(false);
        setCustomer(null);
        setLoginId('');
        setLoginPin('');
        setActiveTab('tickets');
    };

    const customerTickets = useMemo(() => {
        if (!customer) return [];
        return data.tickets.filter(t =>
            t.customer?.toLowerCase().includes(customer.name.toLowerCase()) ||
            t.customerName?.toLowerCase().includes(customer.name.toLowerCase())
        );
    }, [data.tickets, customer]);

    const handleCreateTicket = (e) => {
        e.preventDefault();
        const ticket = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            title: newTicket.title,
            description: newTicket.description,
            category: newTicket.category,
            priority: newTicket.priority,
            status: 'Open',
            customer: customer.name,
            customerName: customer.name,
            customerContact: customer.contact,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'Customer Portal',
            notes: [],
            parts: [],
        };
        addTicket(ticket);
        toast?.('Service ticket created successfully!', 'success');
        setNewTicket({ title: '', description: '', category: 'General', priority: 'Medium' });
        setShowNewTicket(false);
        setActiveTab('tickets');
    };

    const getStatusColor = (status) => {
        const colors = {
            'Open': '#dc2626', 'In Progress': '#2563eb', 'Scheduled': '#0d9488',
            'Parts Ordered': '#d97706', 'On Hold': '#6b7280', 'Closed': '#059669',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Open': 'error', 'In Progress': 'sync', 'Scheduled': 'event',
            'Parts Ordered': 'local_shipping', 'On Hold': 'pause_circle', 'Closed': 'check_circle',
        };
        return icons[status] || 'help';
    };

    // ── LOGIN SCREEN ──
    if (!loggedIn) {
        return (
            <div className="customer-portal-login">
                <div className="cp-login-card">
                    <div className="cp-login-logo">
                        <img src="/logo.jpg" alt="3D Service" className="cp-logo-img" />
                    </div>
                    <h2>Customer Service Portal</h2>
                    <p className="cp-login-subtitle">Log in to create service requests and monitor your tickets</p>
                    <form onSubmit={handleLogin} className="cp-login-form">
                        {loginError && (
                            <div className="cp-login-error">
                                <Icon name="error" size={16} /> {loginError}
                            </div>
                        )}
                        <div className="cp-field">
                            <label>Account ID</label>
                            <div className="cp-input-wrap">
                                <Icon name="badge" size={18} className="cp-input-icon" />
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={e => setLoginId(e.target.value)}
                                    placeholder="Enter your account ID"
                                    required
                                />
                            </div>
                        </div>
                        <div className="cp-field">
                            <label>PIN</label>
                            <div className="cp-input-wrap">
                                <Icon name="lock" size={18} className="cp-input-icon" />
                                <input
                                    type="password"
                                    value={loginPin}
                                    onChange={e => setLoginPin(e.target.value)}
                                    placeholder="Enter your PIN"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary cp-login-btn">
                            <Icon name="login" size={18} /> Sign In
                        </button>
                    </form>
                    <div className="cp-login-demo">
                        <p>Demo accounts: <strong>apex</strong>, <strong>henderson</strong>, or <strong>metro</strong> — PIN: <strong>1234</strong></p>
                    </div>
                </div>
            </div>
        );
    }

    // ── PORTAL DASHBOARD ──
    return (
        <div className="customer-portal">
            {/* Header */}
            <header className="cp-header">
                <div className="cp-header-left">
                    <img src="/logo.jpg" alt="3D Service" className="cp-header-logo" />
                    <div>
                        <h1>Service Portal</h1>
                        <span className="cp-header-subtitle">Welcome, {customer.contact}</span>
                    </div>
                </div>
                <div className="cp-header-right">
                    <button className="btn btn-primary" onClick={() => setShowNewTicket(true)}>
                        <Icon name="add" size={18} /> New Service Request
                    </button>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        <Icon name="logout" size={16} /> Logout
                    </button>
                </div>
            </header>

            {/* Account Info */}
            <div className="cp-account-bar">
                <div className="cp-account-item">
                    <Icon name="domain" size={16} className="icon-gold" />
                    <span>{customer.name}</span>
                </div>
                <div className="cp-account-item">
                    <Icon name="person" size={16} className="icon-gold" />
                    <span>{customer.contact}</span>
                </div>
                <div className="cp-account-item">
                    <Icon name="phone" size={16} className="icon-gold" />
                    <span>{customer.phone}</span>
                </div>
                <div className="cp-account-item">
                    <Icon name="mail" size={16} className="icon-gold" />
                    <span>{customer.email}</span>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="cp-tabs">
                <button className={`cp-tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
                    <Icon name="confirmation_number" size={16} /> My Tickets ({customerTickets.length})
                </button>
                <button className={`cp-tab ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>
                    <Icon name="schedule" size={16} /> Active
                </button>
                <button className={`cp-tab ${activeTab === 'closed' ? 'active' : ''}`} onClick={() => setActiveTab('closed')}>
                    <Icon name="check_circle" size={16} /> Completed
                </button>
            </div>

            {/* Ticket List */}
            <div className="cp-content">
                {showNewTicket && (
                    <div className="card cp-new-ticket-card">
                        <div className="card-header">
                            <h3 className="card-title"><Icon name="add_circle" size={18} className="icon-gold" /> New Service Request</h3>
                            <button className="btn btn-secondary" onClick={() => setShowNewTicket(false)} style={{ fontSize: 12 }}>Cancel</button>
                        </div>
                        <form onSubmit={handleCreateTicket}>
                            <div className="cp-form-grid">
                                <div className="cp-field">
                                    <label>Issue Title *</label>
                                    <input type="text" value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} placeholder="Brief description of the issue" required />
                                </div>
                                <div className="cp-field">
                                    <label>Category</label>
                                    <select value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}>
                                        <option>General</option>
                                        <option>CCTV</option>
                                        <option>Access Control</option>
                                        <option>Fire Alarm</option>
                                        <option>Intrusion</option>
                                        <option>Structured Cabling</option>
                                        <option>Audio Visual</option>
                                        <option>DAS</option>
                                    </select>
                                </div>
                                <div className="cp-field" style={{ gridColumn: '1 / -1' }}>
                                    <label>Description *</label>
                                    <textarea value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} placeholder="Please describe the issue in detail — what system, what symptoms, when did it start?" rows={4} required />
                                </div>
                                <div className="cp-field">
                                    <label>Priority</label>
                                    <select value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary"><Icon name="send" size={16} /> Submit Request</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filtered tickets */}
                {(() => {
                    let filtered = customerTickets;
                    if (activeTab === 'open') filtered = customerTickets.filter(t => t.status !== 'Closed');
                    if (activeTab === 'closed') filtered = customerTickets.filter(t => t.status === 'Closed');

                    if (filtered.length === 0) {
                        return (
                            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                                <Icon name="inbox" size={40} className="icon-muted" />
                                <h3 style={{ marginTop: 12, color: 'var(--text-secondary)' }}>
                                    {activeTab === 'closed' ? 'No completed tickets' : 'No service tickets'}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                                    {activeTab === 'tickets' ? 'Click "New Service Request" to create your first ticket.' : ''}
                                </p>
                            </div>
                        );
                    }

                    return filtered.map(ticket => (
                        <div key={ticket.id} className="card cp-ticket-card">
                            <div className="cp-ticket-header">
                                <div className="cp-ticket-status" style={{ color: getStatusColor(ticket.status) }}>
                                    <Icon name={getStatusIcon(ticket.status)} size={18} />
                                    <span>{ticket.status}</span>
                                </div>
                                <span className="cp-ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="cp-ticket-title">{ticket.title}</h3>
                            <p className="cp-ticket-desc">{ticket.description}</p>
                            <div className="cp-ticket-meta">
                                <span className="cp-ticket-meta-item">
                                    <Icon name="category" size={14} /> {ticket.category}
                                </span>
                                <span className="cp-ticket-meta-item">
                                    <Icon name="flag" size={14} /> {ticket.priority}
                                </span>
                                {ticket.technician && (
                                    <span className="cp-ticket-meta-item">
                                        <Icon name="engineering" size={14} /> {ticket.technician}
                                    </span>
                                )}
                                {ticket.scheduledDate && (
                                    <span className="cp-ticket-meta-item">
                                        <Icon name="event" size={14} /> {ticket.scheduledDate}
                                    </span>
                                )}
                                {ticket.source === 'Customer Portal' && (
                                    <span className="cp-ticket-meta-item" style={{ color: 'var(--accent-primary)' }}>
                                        <Icon name="public" size={14} /> Portal Submission
                                    </span>
                                )}
                            </div>
                            {/* Progress tracker */}
                            <div className="cp-progress-track">
                                {['Open', 'Scheduled', 'In Progress', 'Closed'].map((step, i) => {
                                    const stepOrder = { 'Open': 0, 'Scheduled': 1, 'In Progress': 2, 'Parts Ordered': 2, 'On Hold': 2, 'Closed': 3 };
                                    const current = stepOrder[ticket.status] ?? 0;
                                    const isComplete = i <= current;
                                    const isCurrent = i === current;
                                    return (
                                        <div key={step} className={`cp-progress-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
                                            <div className="cp-progress-dot">
                                                {isComplete ? <Icon name="check" size={12} /> : <span>{i + 1}</span>}
                                            </div>
                                            <span className="cp-progress-label">{step}</span>
                                            {i < 3 && <div className={`cp-progress-line ${isComplete && i < current ? 'complete' : ''}`} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
}
