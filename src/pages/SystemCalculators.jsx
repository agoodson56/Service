import { useState } from 'react';
import PageHeader from '../components/PageHeader';

const CALCULATORS = [
    { id: 'storage', name: 'CCTV Storage', icon: '💾', desc: 'Calculate NVR storage requirements' },
    { id: 'voltage', name: 'Voltage Drop', icon: '⚡', desc: 'NAC circuit & cable voltage drop' },
    { id: 'battery', name: 'Battery Sizing', icon: '🔋', desc: 'Fire alarm battery calculations' },
    { id: 'bandwidth', name: 'Network Bandwidth', icon: '🌐', desc: 'Camera bandwidth requirements' },
    { id: 'poe', name: 'PoE Budget', icon: '🔌', desc: 'PoE switch power budget' },
    { id: 'cable', name: 'Cable Quantity', icon: '📏', desc: 'Estimate cable quantities' },
];

export default function SystemCalculators({ onMenuClick }) {
    const [activeCalc, setActiveCalc] = useState('storage');

    return (
        <>
            <PageHeader title="System Calculators" subtitle="Engineering tools for system design" onMenuClick={onMenuClick} />
            <div className="page-body">
                <div className="calc-selector">
                    {CALCULATORS.map(c => (
                        <button key={c.id} className={`calc-chip ${activeCalc === c.id ? 'active' : ''}`} onClick={() => setActiveCalc(c.id)}>
                            <span>{c.icon}</span> {c.name}
                        </button>
                    ))}
                </div>
                <div className="card mt-24" style={{ maxWidth: 800 }}>
                    {activeCalc === 'storage' && <StorageCalc />}
                    {activeCalc === 'voltage' && <VoltageDropCalc />}
                    {activeCalc === 'battery' && <BatteryCalc />}
                    {activeCalc === 'bandwidth' && <BandwidthCalc />}
                    {activeCalc === 'poe' && <PoECalc />}
                    {activeCalc === 'cable' && <CableCalc />}
                </div>
            </div>
        </>
    );
}

function StorageCalc() {
    const [cameras, setCameras] = useState(16);
    const [resolution, setResolution] = useState('1080p');
    const [fps, setFps] = useState(15);
    const [codec, setCodec] = useState('H.265');
    const [days, setDays] = useState(30);

    const bitrates = { '720p': { 'H.264': 3, 'H.265': 1.5 }, '1080p': { 'H.264': 5, 'H.265': 2.5 }, '4MP': { 'H.264': 7, 'H.265': 3.5 }, '4K': { 'H.264': 14, 'H.265': 7 } };
    const baseBitrate = bitrates[resolution]?.[codec] || 3;
    const adjustedBitrate = baseBitrate * (fps / 15);
    const storagePerCamGB = (adjustedBitrate * 1000000 * 86400 * days) / 8 / 1024 / 1024 / 1024;
    const totalTB = (storagePerCamGB * cameras / 1024).toFixed(2);
    const recommended = Math.ceil(totalTB / 2) * 2; // Round to nearest even TB

    return (
        <div>
            <h3 className="card-title mb-16">💾 CCTV Storage Calculator</h3>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Cameras</label><input type="number" className="form-input" value={cameras} onChange={e => setCameras(+e.target.value)} min={1} /></div>
                <div className="form-group"><label className="form-label">Resolution</label><select className="form-select" value={resolution} onChange={e => setResolution(e.target.value)}><option>720p</option><option>1080p</option><option>4MP</option><option>4K</option></select></div>
            </div>
            <div className="form-row">
                <div className="form-group"><label className="form-label">FPS</label><select className="form-select" value={fps} onChange={e => setFps(+e.target.value)}><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={30}>30</option></select></div>
                <div className="form-group"><label className="form-label">Codec</label><select className="form-select" value={codec} onChange={e => setCodec(e.target.value)}><option>H.264</option><option>H.265</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Retention (days)</label><input type="number" className="form-input" value={days} onChange={e => setDays(+e.target.value)} min={1} /></div>
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Bitrate per camera</span><strong>{adjustedBitrate.toFixed(1)} Mbps</strong></div>
                <div className="calc-result-row"><span>Storage per camera</span><strong>{storagePerCamGB.toFixed(0)} GB</strong></div>
                <div className="calc-result-row highlight"><span>Total Storage Required</span><strong>{totalTB} TB</strong></div>
                <div className="calc-result-row"><span>Recommended (with headroom)</span><strong>{recommended} TB</strong></div>
            </div>
        </div>
    );
}

function VoltageDropCalc() {
    const [voltage, setVoltage] = useState(24);
    const [current, setCurrent] = useState(2.5);
    const [distance, setDistance] = useState(500);
    const [gauge, setGauge] = useState('14');
    const resistance = { '18': 6.51, '16': 4.09, '14': 2.57, '12': 1.62 };
    const vDrop = (2 * distance * current * resistance[gauge]) / 1000;
    const endVoltage = voltage - vDrop;
    const vDropPct = (vDrop / voltage * 100).toFixed(1);
    const pass = endVoltage >= (voltage === 24 ? 16 : 10);

    return (
        <div>
            <h3 className="card-title mb-16">⚡ Voltage Drop Calculator</h3>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Supply Voltage (VDC)</label><select className="form-select" value={voltage} onChange={e => setVoltage(+e.target.value)}><option value={12}>12V</option><option value={24}>24V</option></select></div>
                <div className="form-group"><label className="form-label">Total Current (Amps)</label><input type="number" className="form-input" step={0.1} value={current} onChange={e => setCurrent(+e.target.value)} /></div>
            </div>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Distance (feet)</label><input type="number" className="form-input" value={distance} onChange={e => setDistance(+e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Wire Gauge (AWG)</label><select className="form-select" value={gauge} onChange={e => setGauge(e.target.value)}><option value="18">18 AWG</option><option value="16">16 AWG</option><option value="14">14 AWG</option><option value="12">12 AWG</option></select></div>
            </div>
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Voltage Drop</span><strong>{vDrop.toFixed(2)}V ({vDropPct}%)</strong></div>
                <div className="calc-result-row highlight"><span>Voltage at End of Run</span><strong style={{ color: pass ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{endVoltage.toFixed(2)}V {pass ? '✅ PASS' : '❌ FAIL'}</strong></div>
                <div className="calc-result-row"><span>Minimum Required</span><strong>{voltage === 24 ? '16.0V' : '10.0V'}</strong></div>
            </div>
        </div>
    );
}

function BatteryCalc() {
    const [standbyHrs, setStandbyHrs] = useState(24);
    const [standbyCurrent, setStandbyCurrent] = useState(0.5);
    const [alarmMin, setAlarmMin] = useState(5);
    const [alarmCurrent, setAlarmCurrent] = useState(4);
    const standbyAH = standbyHrs * standbyCurrent;
    const alarmAH = (alarmMin / 60) * alarmCurrent;
    const totalAH = (standbyAH + alarmAH) * 1.2;

    return (
        <div>
            <h3 className="card-title mb-16">🔋 Fire Alarm Battery Calculator</h3>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Standby Hours</label><input type="number" className="form-input" value={standbyHrs} onChange={e => setStandbyHrs(+e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Standby Current (Amps)</label><input type="number" className="form-input" step={0.1} value={standbyCurrent} onChange={e => setStandbyCurrent(+e.target.value)} /></div>
            </div>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Alarm Duration (minutes)</label><input type="number" className="form-input" value={alarmMin} onChange={e => setAlarmMin(+e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Alarm Current (Amps)</label><input type="number" className="form-input" step={0.1} value={alarmCurrent} onChange={e => setAlarmCurrent(+e.target.value)} /></div>
            </div>
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Standby Capacity</span><strong>{standbyAH.toFixed(1)} AH</strong></div>
                <div className="calc-result-row"><span>Alarm Capacity</span><strong>{alarmAH.toFixed(2)} AH</strong></div>
                <div className="calc-result-row"><span>Subtotal</span><strong>{(standbyAH + alarmAH).toFixed(2)} AH</strong></div>
                <div className="calc-result-row highlight"><span>Required (120% safety)</span><strong>{totalAH.toFixed(1)} AH</strong></div>
            </div>
        </div>
    );
}

function BandwidthCalc() {
    const [cameras, setCameras] = useState(32);
    const [bitrate, setBitrate] = useState(4);
    const total = cameras * bitrate;
    const withOverhead = total * 1.2;

    return (
        <div>
            <h3 className="card-title mb-16">🌐 Network Bandwidth Calculator</h3>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Number of Cameras</label><input type="number" className="form-input" value={cameras} onChange={e => setCameras(+e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Avg Bitrate per Camera (Mbps)</label><input type="number" className="form-input" step={0.5} value={bitrate} onChange={e => setBitrate(+e.target.value)} /></div>
            </div>
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Raw Bandwidth</span><strong>{total} Mbps</strong></div>
                <div className="calc-result-row highlight"><span>With 20% Overhead</span><strong>{withOverhead.toFixed(0)} Mbps</strong></div>
                <div className="calc-result-row"><span>Uplink Required</span><strong>{withOverhead <= 1000 ? '1 Gbps' : withOverhead <= 10000 ? '10 Gbps' : '10+ Gbps'}</strong></div>
            </div>
        </div>
    );
}

function PoECalc() {
    const [devices, setDevices] = useState([
        { name: 'IP Cameras (PoE)', count: 16, watts: 12 },
        { name: 'PTZ Cameras (PoE+)', count: 4, watts: 25 },
        { name: 'Access Points', count: 8, watts: 15 },
        { name: 'Card Readers', count: 6, watts: 5 },
    ]);
    const total = devices.reduce((s, d) => s + d.count * d.watts, 0);
    const withMargin = total * 1.2;

    const updateDevice = (i, field, val) => setDevices(prev => prev.map((d, j) => j === i ? { ...d, [field]: val } : d));

    return (
        <div>
            <h3 className="card-title mb-16">🔌 PoE Power Budget Calculator</h3>
            {devices.map((d, i) => (
                <div key={i} className="form-row mb-8">
                    <div className="form-group" style={{ flex: 2 }}><label className="form-label">{i === 0 ? 'Device' : ''}</label><input className="form-input" value={d.name} onChange={e => updateDevice(i, 'name', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">{i === 0 ? 'Qty' : ''}</label><input type="number" className="form-input" value={d.count} onChange={e => updateDevice(i, 'count', +e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">{i === 0 ? 'Watts' : ''}</label><input type="number" className="form-input" value={d.watts} onChange={e => updateDevice(i, 'watts', +e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">{i === 0 ? 'Total' : ''}</label><div className="form-input" style={{ background: 'transparent', border: 'none', fontWeight: 700 }}>{d.count * d.watts}W</div></div>
                </div>
            ))}
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Total PoE Load</span><strong>{total}W</strong></div>
                <div className="calc-result-row highlight"><span>With 20% Margin</span><strong>{withMargin.toFixed(0)}W</strong></div>
                <div className="calc-result-row"><span>Recommended Switch</span><strong>{withMargin <= 370 ? '370W (24-port PoE+)' : withMargin <= 740 ? '740W (48-port PoE+)' : '1440W+ (PoE++ Switch)'}</strong></div>
            </div>
        </div>
    );
}

function CableCalc() {
    const [drops, setDrops] = useState(50);
    const [avgRun, setAvgRun] = useState(150);
    const [waste, setWaste] = useState(15);
    const totalFt = drops * avgRun * (1 + waste / 100);
    const boxes = Math.ceil(totalFt / 1000);

    return (
        <div>
            <h3 className="card-title mb-16">📏 Cable Quantity Estimator</h3>
            <div className="form-row">
                <div className="form-group"><label className="form-label">Number of Drops</label><input type="number" className="form-input" value={drops} onChange={e => setDrops(+e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Avg Run Length (ft)</label><input type="number" className="form-input" value={avgRun} onChange={e => setAvgRun(+e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Waste Factor (%)</label><input type="number" className="form-input" value={waste} onChange={e => setWaste(+e.target.value)} /></div>
            <div className="calc-result mt-24">
                <div className="calc-result-row"><span>Raw Cable Needed</span><strong>{(drops * avgRun).toLocaleString()} ft</strong></div>
                <div className="calc-result-row"><span>With {waste}% Waste</span><strong>{Math.ceil(totalFt).toLocaleString()} ft</strong></div>
                <div className="calc-result-row highlight"><span>1,000ft Boxes Needed</span><strong>{boxes} boxes</strong></div>
            </div>
        </div>
    );
}
