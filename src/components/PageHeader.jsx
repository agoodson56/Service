export default function PageHeader({ title, subtitle, children, onMenuClick }) {
    return (
        <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn-ghost btn-icon" onClick={onMenuClick} style={{ display: 'none' }}
                    ref={el => {
                        if (el && window.innerWidth <= 1024) el.style.display = 'flex';
                    }}>
                    ☰
                </button>
                <div>
                    <h2>{title}</h2>
                    {subtitle && <div className="page-header-sub">{subtitle}</div>}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {children}
            </div>
        </div>
    );
}
