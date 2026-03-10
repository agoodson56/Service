import { useRef, useState, useEffect, useCallback } from 'react';

export default function SignaturePad({ onSave, onCancel, customerName }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match display size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Style
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw signature line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.moveTo(20, rect.height - 40);
        ctx.lineTo(rect.width - 20, rect.height - 40);
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText('Sign above this line', 20, rect.height - 22);

        // Reset stroke style
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
    }, []);

    const getPos = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const startDrawing = useCallback((e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
        setHasDrawn(true);
    }, [getPos]);

    const draw = useCallback((e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }, [isDrawing, getPos]);

    const stopDrawing = useCallback((e) => {
        if (e) e.preventDefault();
        setIsDrawing(false);
    }, []);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.moveTo(20, rect.height - 40);
        ctx.lineTo(rect.width - 20, rect.height - 40);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText('Sign above this line', 20, rect.height - 22);

        setHasDrawn(false);
    };

    const handleSave = () => {
        if (!hasDrawn) return;
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="signature-pad-container">
            <div className="signature-pad-header">
                <div className="signature-pad-icon">✍️</div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Customer Signature Required</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {customerName ? `${customerName} — please sign below to confirm service completion` : 'Customer signature to confirm service completion'}
                    </p>
                </div>
            </div>

            <div className="signature-canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    className="signature-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div className="signature-pad-actions">
                <button className="btn btn-ghost" onClick={clearSignature}>
                    🗑️ Clear
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!hasDrawn}
                        style={{ opacity: hasDrawn ? 1 : 0.5, cursor: hasDrawn ? 'pointer' : 'not-allowed' }}>
                        ✅ Accept & Close Ticket
                    </button>
                </div>
            </div>

            <div className="signature-legal-text">
                By signing above, the customer acknowledges that the described service work has been completed to their satisfaction
                and authorizes billing for the services rendered. A copy of this service report will be emailed to the customer.
            </div>
        </div>
    );
}
