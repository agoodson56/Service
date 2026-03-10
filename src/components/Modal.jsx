export default function Modal({ isOpen, onClose, title, children, size, footer }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : ''}`}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
