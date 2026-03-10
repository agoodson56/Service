import { useState } from 'react';
import Icon from '../components/Icon';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await onLogin(email, password);
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <img src="/logo.jpg" alt="3D Service" className="login-logo-img" />
                </div>
                <h1 className="login-title">3D Service</h1>
                <p className="login-subtitle">Service Management Platform</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <Icon name="error" size={16} /> {error}
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="login-email">Email Address</label>
                        <div className="login-input-wrap">
                            <Icon name="mail" size={18} className="login-input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">Password</label>
                        <div className="login-input-wrap">
                            <Icon name="lock" size={18} className="login-input-icon" />
                            <input
                                id="login-password"
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="login-pw-toggle"
                                onClick={() => setShowPw(!showPw)}
                                tabIndex={-1}
                            >
                                <Icon name={showPw ? 'visibility_off' : 'visibility'} size={18} />
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? (
                            <><Icon name="sync" size={18} /> Signing in...</>
                        ) : (
                            <><Icon name="login" size={18} /> Sign In</>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <Icon name="shield" size={14} />
                    <span>Secured by 3D Technology Services</span>
                </div>
            </div>
        </div>
    );
}
