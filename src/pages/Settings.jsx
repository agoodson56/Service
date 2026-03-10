import { useState } from 'react';
import { useSettings } from '../store/useStore';
import store from '../store/dataStore';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { getApiKey, setApiKey, AI_BRAINS } from '../services/aiService';
import UserManagement from '../components/UserManagement';

export default function Settings({ onMenuClick, toast, user }) {
    const { settings, updateSettings } = useSettings();
    const [form, setForm] = useState({ ...settings });
    const [tab, setTab] = useState('company');
    const [apiKey, setApiKeyState] = useState(getApiKey());
    const [showKey, setShowKey] = useState(false);

    const handleSave = () => {
        updateSettings(form);
        toast('Settings saved');
    };

    const handleReset = () => {
        if (confirm('This will reset ALL data to defaults. Are you sure?')) {
            store.resetData();
            setForm({ ...store.getSettings() });
            toast('All data reset to defaults', 'warning');
        }
    };

    return (
        <>
            <PageHeader title="Settings" subtitle="System configuration" onMenuClick={onMenuClick}>
                <button className="btn btn-primary" onClick={handleSave}>💾 Save Settings</button>
            </PageHeader>

            <div className="page-body">
                <div className="tabs">
                    <button className={`tab ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>🏢 Company</button>
                    <button className={`tab ${tab === 'rates' ? 'active' : ''}`} onClick={() => setTab('rates')}>💰 Rates</button>
                    <button className={`tab ${tab === 'sla' ? 'active' : ''}`} onClick={() => setTab('sla')}>⏱️ SLA</button>
                    <button className={`tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>🤖 AI Brains</button>
                    {user?.role === 'Admin' && (
                        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}><Icon name="group" size={16} /> Users</button>
                    )}
                    <button className={`tab ${tab === 'system' ? 'active' : ''}`} onClick={() => setTab('system')}>⚙️ System</button>
                </div>

                {tab === 'users' && user?.role === 'Admin' && (
                    <div className="card" style={{ maxWidth: 900 }}>
                        <UserManagement currentUser={user} toast={toast} />
                    </div>
                )}

                {tab === 'company' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card-title mb-16">Company Information</h3>
                        <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.companyPhone} onChange={e => setForm({ ...form, companyPhone: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.companyEmail} onChange={e => setForm({ ...form, companyEmail: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.companyAddress} onChange={e => setForm({ ...form, companyAddress: e.target.value })} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Business Hours Start</label><input type="time" className="form-input" value={form.businessHours?.start || '07:00'} onChange={e => setForm({ ...form, businessHours: { ...form.businessHours, start: e.target.value } })} /></div>
                            <div className="form-group"><label className="form-label">Business Hours End</label><input type="time" className="form-input" value={form.businessHours?.end || '18:00'} onChange={e => setForm({ ...form, businessHours: { ...form.businessHours, end: e.target.value } })} /></div>
                        </div>
                    </div>
                )}

                {tab === 'rates' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card-title mb-16">Rate Configuration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Default Labor Rate ($/hr)</label>
                                <input type="number" step="0.01" className="form-input" value={form.defaultLaborRate} onChange={e => setForm({ ...form, defaultLaborRate: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Emergency Rate ($/hr)</label>
                                <input type="number" step="0.01" className="form-input" value={form.emergencyRate} onChange={e => setForm({ ...form, emergencyRate: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tax Rate (%)</label>
                            <input type="number" step="0.01" className="form-input" style={{ maxWidth: 200 }} value={form.taxRate} onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Rate Preview</div>
                            <div className="detail-row"><span className="detail-row-label">Standard (8hr day)</span><span className="detail-row-value">${((form.defaultLaborRate || 0) * 8).toFixed(2)}</span></div>
                            <div className="detail-row"><span className="detail-row-label">Emergency (8hr day)</span><span className="detail-row-value" style={{ color: 'var(--accent-warning)' }}>${((form.emergencyRate || 0) * 8).toFixed(2)}</span></div>
                        </div>
                    </div>
                )}

                {tab === 'sla' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card-title mb-16">SLA Response Targets (hours)</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Set the maximum response time targets for each priority level.</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="priority-dot critical" /> Critical (hours)</label>
                                <input type="number" className="form-input" value={form.slaTargets?.critical || 2} onChange={e => setForm({ ...form, slaTargets: { ...form.slaTargets, critical: parseInt(e.target.value) || 0 } })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="priority-dot high" /> High (hours)</label>
                                <input type="number" className="form-input" value={form.slaTargets?.high || 4} onChange={e => setForm({ ...form, slaTargets: { ...form.slaTargets, high: parseInt(e.target.value) || 0 } })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="priority-dot medium" /> Medium (hours)</label>
                                <input type="number" className="form-input" value={form.slaTargets?.medium || 8} onChange={e => setForm({ ...form, slaTargets: { ...form.slaTargets, medium: parseInt(e.target.value) || 0 } })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="priority-dot low" /> Low (hours)</label>
                                <input type="number" className="form-input" value={form.slaTargets?.low || 24} onChange={e => setForm({ ...form, slaTargets: { ...form.slaTargets, low: parseInt(e.target.value) || 0 } })} />
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'ai' && (
                    <div style={{ maxWidth: 700 }}>
                        <div className="card mb-24">
                            <h3 className="card-title mb-16">🔑 Gemini API Configuration</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                                Enter your Google Gemini API key to enable the 3 AI brains. Get your key from
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener"> Google AI Studio</a>.
                            </p>
                            <div className="form-group">
                                <label className="form-label">Gemini API Key</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        className="form-input"
                                        type={showKey ? 'text' : 'password'}
                                        placeholder="AIza..."
                                        value={apiKey}
                                        onChange={e => setApiKeyState(e.target.value)}
                                    />
                                    <button className="btn btn-secondary" onClick={() => setShowKey(!showKey)}>{showKey ? '🙈' : '👁️'}</button>
                                    <button className="btn btn-primary" onClick={() => { setApiKey(apiKey); toast('API key saved'); }}>Save</button>
                                </div>
                            </div>
                            <div className="detail-row mt-16">
                                <span className="detail-row-label">Status</span>
                                <span className="detail-row-value" style={{ color: apiKey ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                    {apiKey ? '✅ Connected' : '❌ Not configured'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-row-label">Model</span>
                                <span className="detail-row-value">Gemini 3.1 Pro</span>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="card-title mb-16">🧠 Active AI Brains</h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                {Object.values(AI_BRAINS).map(brain => (
                                    <div key={brain.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                                        <div style={{ fontSize: 32 }}><Icon name={brain.icon} size={32} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: brain.color }}>{brain.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{brain.description}</div>
                                        </div>
                                        <span className="badge" style={{ background: apiKey ? 'var(--accent-success-dim)' : 'rgba(100,116,139,0.2)', color: apiKey ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                                            {apiKey ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'system' && (
                    <div style={{ maxWidth: 600 }}>
                        <div className="card mb-24">
                            <h3 className="card-title mb-16">System Info</h3>
                            <div className="detail-row"><span className="detail-row-label">App Version</span><span className="detail-row-value">1.0.0</span></div>
                            <div className="detail-row"><span className="detail-row-label">Data Storage</span><span className="detail-row-value">Local Browser Storage</span></div>
                            <div className="detail-row"><span className="detail-row-label">Last Modified</span><span className="detail-row-value">{new Date().toLocaleString()}</span></div>
                        </div>

                        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <h3 className="card-title mb-8" style={{ color: 'var(--accent-danger)' }}>⚠️ Danger Zone</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                Resetting will delete all tickets, customers, technicians, invoices, and other data. This cannot be undone.
                            </p>
                            <button className="btn btn-danger" onClick={handleReset}>🗑️ Reset All Data</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
