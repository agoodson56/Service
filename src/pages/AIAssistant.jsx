import { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { AI_BRAINS, BRAIN_PROMPTS, queryBrain, getChatHistory, clearChatHistory, hasApiKey } from '../services/aiService';

export default function AIAssistant({ onMenuClick, toast }) {
    const [activeBrain, setActiveBrain] = useState('field');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        setMessages(getChatHistory(activeBrain));
    }, [activeBrain]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        if (!hasApiKey()) { toast('Please add your Gemini API key in Settings', 'error'); return; }

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date().toISOString() }]);
        setLoading(true);

        try {
            const reply = await queryBrain(activeBrain, userMsg);
            setMessages(getChatHistory(activeBrain));
            toast('Response received');
        } catch (err) {
            setMessages(prev => [...prev, { role: 'error', text: err.message, timestamp: new Date().toISOString() }]);
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestion = (prompt) => { setInput(prompt); };

    const handleClear = () => {
        clearChatHistory(activeBrain);
        setMessages([]);
        toast('Chat history cleared');
    };

    const brain = AI_BRAINS[activeBrain];
    const prompts = BRAIN_PROMPTS[activeBrain] || [];

    const renderMarkdown = (text) => {
        let html = text
            .replace(/### (.*)/g, '<h4>$1</h4>')
            .replace(/## (.*)/g, '<h3>$1</h3>')
            .replace(/# (.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n- /g, '\n• ')
            .replace(/\n\d+\. /g, (match) => '\n' + match.trim() + ' ');

        return html.split('\n').map((line, i) => {
            if (line.startsWith('|')) {
                return <div key={i} className="ai-table-row">{line}</div>;
            }
            if (line.startsWith('• ')) {
                return <div key={i} className="ai-list-item" dangerouslySetInnerHTML={{ __html: '• ' + line.slice(2) }} />;
            }
            return <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
        });
    };

    return (
        <>
            <PageHeader title="AI Assistant" subtitle="3 Specialized Gemini Brains" onMenuClick={onMenuClick}>
                <button className="btn btn-secondary btn-sm" onClick={handleClear}><Icon name="delete" size={14} /> Clear</button>
            </PageHeader>

            <div className="page-body" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Brain Selector */}
                <div className="brain-selector">
                    {Object.values(AI_BRAINS).map(b => (
                        <button key={b.id}
                            className={`brain-chip ${activeBrain === b.id ? 'active' : ''}`}
                            onClick={() => setActiveBrain(b.id)}
                            style={{ '--brain-color': b.color }}>
                            <span className="brain-chip-icon"><Icon name={b.icon} size={20} /></span>
                            <div>
                                <div className="brain-chip-name">{b.name}</div>
                                <div className="brain-chip-desc">{b.description}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="ai-chat-area">
                    {messages.length === 0 ? (
                        <div className="ai-welcome">
                            <div className="ai-welcome-icon" style={{ color: brain.color }}><Icon name={brain.icon} size={48} /></div>
                            <h2>{brain.name} Brain</h2>
                            <p>{brain.description}</p>
                            <div className="ai-welcome-subtitle">Powered by Gemini 3.1 Pro</div>
                            <div className="ai-suggestions">
                                <div className="ai-suggestions-title">Try asking:</div>
                                <div className="ai-suggestion-grid">
                                    {prompts.slice(0, 6).map((p, i) => (
                                        <button key={i} className="ai-suggestion-chip" onClick={() => handleSuggestion(p)}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ai-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className={`ai-message ai-message-${msg.role}`}>
                                    <div className="ai-message-avatar">
                                        {msg.role === 'user' ? <Icon name="person" size={18} /> : msg.role === 'error' ? <Icon name="error" size={18} /> : <Icon name={brain.icon} size={18} />}
                                    </div>
                                    <div className="ai-message-content">
                                        <div className="ai-message-header">
                                            <span className="ai-message-name">
                                                {msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : brain.name}
                                            </span>
                                            <span className="ai-message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="ai-message-text">{renderMarkdown(msg.text)}</div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="ai-message ai-message-assistant">
                                    <div className="ai-message-avatar"><Icon name={brain.icon} size={18} /></div>
                                    <div className="ai-message-content">
                                        <div className="ai-typing">
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className="ai-input-bar">
                    <div className="ai-input-wrapper">
                        <span className="ai-input-brain" style={{ color: brain.color }}><Icon name={brain.icon} size={18} /></span>
                        <input
                            className="ai-input"
                            placeholder={`Ask the ${brain.name} brain...`}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <button className="btn btn-primary ai-send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
                            {loading ? <Icon name="hourglass_top" size={16} /> : <Icon name="send" size={16} />}
                        </button>
                    </div>
                    {!hasApiKey() && (
                        <div className="ai-key-warning">
                            <Icon name="warning" size={14} /> Gemini API key not configured. <a href="#/settings">Add your key in Settings</a> to enable AI features.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
