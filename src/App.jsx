import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import DispatchBoard from './pages/DispatchBoard';
import Customers from './pages/Customers';
import Technicians from './pages/Technicians';
import PartsInventory from './pages/PartsInventory';
import Scheduling from './pages/Scheduling';
import Billing from './pages/Billing';
import InvoiceDetail from './pages/InvoiceDetail';
import KnowledgeBase from './pages/KnowledgeBase';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import ToastContainer from './components/ToastContainer';
import AlertSystem from './components/AlertSystem';
import AIAssistant from './pages/AIAssistant';
import KnowledgeLibrary from './pages/KnowledgeLibrary';
import SystemCalculators from './pages/SystemCalculators';
import CustomerPortal from './pages/CustomerPortal';
import LoginPage from './pages/LoginPage';
import { initializeUsers, getSession, login, logout } from './store/authStore';

function AppContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = not logged in
    const location = useLocation();

    // Check session on mount
    useEffect(() => {
        async function checkAuth() {
            await initializeUsers();
            const session = getSession();
            setAuthUser(session);
        }
        checkAuth();
    }, []);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const handleLogin = async (email, password) => {
        const result = await login(email, password);
        if (result.success) {
            setAuthUser(result.user);
        }
        return result;
    };

    const handleLogout = () => {
        logout();
        setAuthUser(null);
    };

    // Customer portal renders outside auth
    if (location.pathname === '/portal') {
        return <CustomerPortal />;
    }

    // Loading state
    if (authUser === undefined) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/logo.jpg" alt="3D Service" style={{ width: 100, marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in — show login
    if (!authUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={authUser} onLogout={handleLogout} />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/tickets" element={<Tickets onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/tickets/:id" element={<TicketDetail onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/dispatch" element={<DispatchBoard onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/customers" element={<Customers onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/technicians" element={<Technicians onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/parts" element={<PartsInventory onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/scheduling" element={<Scheduling onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/billing" element={<Billing onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/billing/:id" element={<InvoiceDetail onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/knowledge-base" element={<KnowledgeLibrary onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/knowledge-library" element={<KnowledgeLibrary onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/ai-assistant" element={<AIAssistant onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/calculators" element={<SystemCalculators onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/reports" element={<Reports onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                    <Route path="/settings" element={<Settings onMenuClick={() => setSidebarOpen(true)} toast={addToast} user={authUser} />} />
                    <Route path="/activity" element={<ActivityLog onMenuClick={() => setSidebarOpen(true)} toast={addToast} />} />
                </Routes>
            </div>
            <AlertSystem />
            <ToastContainer toasts={toasts} />
        </div>
    );
}

export default function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}
