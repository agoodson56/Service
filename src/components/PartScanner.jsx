import { useState, useRef, useCallback } from 'react';
import { hasApiKey, getApiKey } from '../services/aiService';
import Icon from './Icon';

export default function PartScanner({ onPartIdentified, onClose, toast }) {
    const [mode, setMode] = useState('choose'); // choose, camera, preview, analyzing, result
    const [photo, setPhoto] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setMode('camera');
        } catch (err) {
            setError('Camera access denied. Please use file upload instead.');
            toast?.('Camera access denied', 'error');
        }
    }, [toast]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
        stopCamera();
        setMode('preview');
    }, [stopCamera]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPhoto(ev.target.result);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    }, []);

    const analyzePhoto = useCallback(async () => {
        if (!photo) return;
        if (!hasApiKey()) { setError('Gemini API key not configured. Go to Settings > AI Brains.'); return; }

        setMode('analyzing');
        setError('');

        try {
            const base64Data = photo.split(',')[1];
            const mimeType = photo.split(';')[0].split(':')[1];

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent?key=${getApiKey()}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: 'user',
                            parts: [
                                {
                                    inlineData: { mimeType, data: base64Data }
                                },
                                {
                                    text: `Analyze this image of a security/low-voltage system component or part. Identify:

1. **Part Number** — The exact part number, model number, or SKU visible on the device or label
2. **Model** — The full model name
3. **Manufacturer** — The brand/manufacturer name
4. **Category** — What type of device this is (e.g., IP Camera, Access Control Reader, Fire Alarm Pull Station, Smoke Detector, Network Switch, Cable, etc.)
5. **Description** — A brief technical description of the part and its typical use

If you cannot read text clearly from the image, use visual recognition to identify the device type, likely manufacturer based on design cues, and provide your best assessment.

Respond in this exact JSON format:
{
  "partNumber": "detected part number or 'Not visible'",
  "model": "model name",
  "manufacturer": "brand name",
  "category": "device category",
  "description": "brief technical description",
  "confidence": "high/medium/low"
}`
                                }
                            ]
                        }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
                    })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setAnalysis(parsed);
                setMode('result');
            } else {
                throw new Error('Could not parse AI response');
            }
        } catch (err) {
            setError(err.message);
            setMode('preview');
            toast?.('Analysis failed: ' + err.message, 'error');
        }
    }, [photo, toast]);

    const handleAccept = () => {
        if (analysis && photo) {
            onPartIdentified({ ...analysis, photo });
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        setAnalysis(null);
        setError('');
        setMode('choose');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal part-scanner-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><Icon name="photo_camera" size={18} className="icon-gold" /> Part Scanner</h3>
                    <button className="modal-close" onClick={() => { stopCamera(); onClose(); }}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Choose Mode */}
                    {mode === 'choose' && (
                        <div className="part-scanner-choose">
                            <div className="part-scanner-icon"><Icon name="photo_camera" size={40} className="icon-teal" /></div>
                            <h3>Capture Part Photo</h3>
                            <p>Take a photo or upload an image of the part. AI will identify the part number, model, and manufacturer.</p>
                            {error && <div className="part-scanner-error">{error}</div>}
                            <div className="part-scanner-actions">
                                <button className="btn btn-primary" onClick={startCamera}>
                                    <Icon name="photo_camera" size={16} /> Open Camera
                                </button>
                                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                    <Icon name="upload_file" size={16} /> Upload Photo
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Camera View */}
                    {mode === 'camera' && (
                        <div className="part-scanner-camera">
                            <video ref={videoRef} autoPlay playsInline className="part-scanner-video" />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="part-scanner-camera-controls">
                                <button className="btn btn-secondary" onClick={() => { stopCamera(); setMode('choose'); }}>Cancel</button>
                                <button className="part-scanner-capture-btn" onClick={capturePhoto} title="Capture">
                                    <div className="capture-ring" />
                                </button>
                                <div style={{ width: 80 }} />
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {mode === 'preview' && (
                        <div className="part-scanner-preview">
                            <img src={photo} alt="Captured part" className="part-scanner-image" />
                            {error && <div className="part-scanner-error">{error}</div>}
                            <div className="part-scanner-actions">
                                <button className="btn btn-secondary" onClick={handleRetake}><Icon name="refresh" size={14} /> Retake</button>
                                <button className="btn btn-primary" onClick={analyzePhoto}><Icon name="psychology" size={14} /> Analyze with AI</button>
                            </div>
                        </div>
                    )}

                    {/* Analyzing */}
                    {mode === 'analyzing' && (
                        <div className="part-scanner-analyzing">
                            <img src={photo} alt="Analyzing" className="part-scanner-image" style={{ opacity: 0.5 }} />
                            <div className="part-scanner-loading">
                                <div className="part-scanner-spinner" />
                                <h3>Analyzing Part...</h3>
                                <p>Gemini 3.1 Pro is identifying the part number, model, and manufacturer</p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {mode === 'result' && analysis && (
                        <div className="part-scanner-result">
                            <div className="part-scanner-result-grid">
                                <div className="part-scanner-result-photo">
                                    <img src={photo} alt="Identified part" className="part-scanner-image" />
                                </div>
                                <div className="part-scanner-result-info">
                                    <div className="part-scanner-confidence">
                                        <span className={`confidence-badge confidence-${analysis.confidence}`}>
                                            <Icon name={analysis.confidence === 'high' ? 'check_circle' : analysis.confidence === 'medium' ? 'warning' : 'help'} size={14} /> {analysis.confidence} confidence
                                        </span>
                                    </div>
                                    <div className="part-result-field">
                                        <label>Part Number</label>
                                        <div className="part-result-value">{analysis.partNumber}</div>
                                    </div>
                                    <div className="part-result-field">
                                        <label>Model</label>
                                        <div className="part-result-value">{analysis.model}</div>
                                    </div>
                                    <div className="part-result-field">
                                        <label>Manufacturer</label>
                                        <div className="part-result-value">{analysis.manufacturer}</div>
                                    </div>
                                    <div className="part-result-field">
                                        <label>Category</label>
                                        <div className="part-result-value">{analysis.category}</div>
                                    </div>
                                    <div className="part-result-field">
                                        <label>Description</label>
                                        <div className="part-result-value" style={{ fontSize: 12 }}>{analysis.description}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="part-scanner-actions" style={{ marginTop: 16 }}>
                                <button className="btn btn-secondary" onClick={handleRetake}><Icon name="refresh" size={14} /> Scan Another</button>
                                <button className="btn btn-primary" onClick={handleAccept}><Icon name="check_circle" size={14} /> Accept & Add to Ticket</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
