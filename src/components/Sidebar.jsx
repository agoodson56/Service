import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Icon from './Icon';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { data } = useStore();

    const openTickets = data.tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const criticalCount = data.tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;
    const lowStock = data.parts.filter(p => p.quantity <= p.reorderLevel).length;

    const navItems = [
        { section: 'OPERATIONS' },
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/tickets', icon: 'confirmation_number', label: 'Service Tickets', badge: openTickets > 0 ? openTickets : null },
        { path: '/dispatch', icon: 'cell_tower', label: 'Dispatch Board', badge: criticalCount > 0 ? criticalCount : null, badgeType: 'critical' },
        { path: '/scheduling', icon: 'calendar_month', label: 'Scheduling' },
        { section: 'MANAGEMENT' },
        { path: '/customers', icon: 'domain', label: 'Customers' },
        { path: '/technicians', icon: 'engineering', label: 'Technicians' },
        { path: '/parts', icon: 'build', label: 'Parts & Inventory', badge: lowStock > 0 ? lowStock : null, badgeType: 'warning' },
        { section: 'FINANCE' },
        { path: '/billing', icon: 'receipt_long', label: 'Billing & Invoices' },
        { path: '/reports', icon: 'bar_chart', label: 'Reports' },
        { section: 'AI INTELLIGENCE' },
        { path: '/ai-assistant', icon: 'psychology', label: 'AI Assistant' },
        { path: '/knowledge-library', icon: 'auto_stories', label: 'Knowledge Library' },
        { path: '/calculators', icon: 'calculate', label: 'System Calculators' },
        { section: 'SYSTEM' },
        { path: '/activity', icon: 'history', label: 'Activity Log' },
        { path: '/settings', icon: 'settings', label: 'Settings' },
    ];

    // Mobile bottom nav — tech-focused features only
    const mobileNavItems = [
        { path: '/tickets', icon: 'confirmation_number', label: 'Tickets' },
        { path: '/dispatch', icon: 'cell_tower', label: 'Dispatch' },
        { path: '/scheduling', icon: 'calendar_month', label: 'Schedule' },
        { path: '/parts', icon: 'build', label: 'Parts' },
        { path: '/ai-assistant', icon: 'psychology', label: 'AI' },
    ];

    const currentPath = location.pathname;

    return (
        <>
            {isOpen && <div className="modal-overlay" style={{ zIndex: 150 }} onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-img-wrap">
                        <img src="/logo.jpg" alt="3D Service" className="sidebar-logo-img" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, i) => {
                        if (item.section) {
                            return <div key={i} className="nav-section-label">{item.section}</div>;
                        }
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon name={item.icon} size={18} className="nav-item-icon" />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className={`nav-item-badge ${item.badgeType || ''}`}>{item.badge}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: 'white'
                        }}>A</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Admin User</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dispatcher</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Nav — Tech-focused features */}
            <nav className="mobile-nav">
                <div className="mobile-nav-inner">
                    {mobileNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon name={item.icon} size={22} fill={currentPath === item.path} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
}
