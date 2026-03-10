/* ═══════════════════════════════════════════════════════════
   Technical Knowledge Database — 7 ELV Disciplines
   SecureServ Pro Knowledge Library
   ═══════════════════════════════════════════════════════════ */

export const DISCIPLINES = [
    { id: 'structured-cabling', name: 'Structured Cabling', icon: 'cable', color: '#0d9488' },
    { id: 'cctv', name: 'CCTV / Video Surveillance', icon: 'videocam', color: '#ef4444' },
    { id: 'access-control', name: 'Access Control', icon: 'lock', color: '#10b981' },
    { id: 'das', name: 'DAS', icon: 'cell_tower', color: '#f59e0b' },
    { id: 'av', name: 'Audio Visual', icon: 'speaker', color: '#7c3aed' },
    { id: 'intrusion', name: 'Intrusion Detection', icon: 'sensors', color: '#ec4899' },
    { id: 'fire-alarm', name: 'Fire Alarm', icon: 'local_fire_department', color: '#f97316' },
];

export const KNOWLEDGE_ARTICLES = [
    // ═══ STRUCTURED CABLING ═══════════════════════════════
    {
        id: 'sc-001', discipline: 'structured-cabling', category: 'Standards',
        title: 'TIA-568 Cabling Standards Complete Reference',
        tags: ['TIA-568', 'Cat5e', 'Cat6', 'Cat6a', 'standards'],
        content: `## TIA-568 Cabling Standards

### Cable Categories & Performance
| Category | Bandwidth | Max Distance | Common Use |
|----------|-----------|-------------|------------|
| Cat5e | 100 MHz | 100m (328ft) | Legacy VoIP, 1GbE |
| Cat6 | 250 MHz | 100m / 55m (10GbE) | Standard enterprise |
| Cat6a | 500 MHz | 100m (328ft) | 10GbE, PoE++, recommended |
| Cat8 | 2000 MHz | 30m | Data centers |

### T568A vs T568B Wiring
**T568B (Most Common in Commercial):**
Pin 1: White/Orange | Pin 2: Orange
Pin 3: White/Green | Pin 4: Blue
Pin 5: White/Blue | Pin 6: Green
Pin 7: White/Brown | Pin 8: Brown

**T568A:**
Pin 1: White/Green | Pin 2: Green
Pin 3: White/Orange | Pin 4: Blue
Pin 5: White/Blue | Pin 6: Orange
Pin 7: White/Brown | Pin 8: Brown

### Channel vs Permanent Link Testing
- **Channel**: Full 100m including patch cords (≤100m total)
- **Permanent Link**: Fixed cabling only (≤90m)
- Always test to Permanent Link for certification

### Key Requirements
- Maximum horizontal distance: 90 meters
- Maximum patch cord: 5m each end (10m total)
- Minimum bend radius: 4x cable OD (UTP), 10x (fiber)
- Pull tension: Max 25 lbf for 4-pair UTP
- No more than 2 transition points per horizontal run`
    },
    {
        id: 'sc-002', discipline: 'structured-cabling', category: 'Installation',
        title: 'MDF/IDF Room Design & Best Practices',
        tags: ['MDF', 'IDF', 'TR', 'design', 'cooling'],
        content: `## MDF/IDF Telecommunications Room Design

### Room Sizing (TIA-569)
| Serving Area | Minimum Room Size |
|-------------|-------------------|
| Up to 5,000 sq ft | 150 sq ft (10×15) |
| 5,001–8,000 sq ft | 200 sq ft |
| 8,001–10,000 sq ft | 250 sq ft |

### Environmental Requirements
- **Temperature**: 64–75°F (18–24°C) sustained
- **Humidity**: 30–55% RH
- **Dedicated HVAC** — never shared with general building
- **Positive pressure** to prevent dust infiltration

### Power Requirements
- Minimum 2 dedicated 20A circuits
- UPS for all active equipment
- Separate electrical panel preferred
- Emergency power connection if available

### Rack Layout
- 19" EIA standard racks
- Minimum 36" clearance front and rear
- Cable management: vertical and horizontal
- Label every cable at both ends per TIA-606
- Ground rack to TMGB per TIA-607`
    },
    {
        id: 'sc-003', discipline: 'structured-cabling', category: 'Testing',
        title: 'Fluke Certification Testing Procedures',
        tags: ['Fluke', 'testing', 'certification', 'troubleshooting'],
        content: `## Cable Certification Testing

### Required Tests (per TIA-568)
1. **Wire Map** — Correct pin assignments, no shorts/opens/crosses
2. **Length** — ≤90m permanent link
3. **Insertion Loss (Attenuation)** — Signal loss over distance
4. **NEXT (Near-End Crosstalk)** — Signal bleeding between pairs
5. **PS-NEXT** — Power Sum NEXT
6. **ELFEXT** — Equal Level Far End Crosstalk
7. **Return Loss** — Signal reflection
8. **Propagation Delay** — Signal travel time
9. **Delay Skew** — Timing difference between pairs (≤50ns)

### Common Failures & Fixes
| Failure | Likely Cause | Fix |
|---------|-------------|-----|
| Wire Map | Bad termination | Re-terminate, check T568B |
| Length FAIL | Run too long | Re-route or add TR |
| NEXT FAIL | Untwisted pairs at term | Maintain twist to 0.5" |
| Return Loss | Kink or connector | Replace patch cord, re-term |
| Insertion Loss | Bad cable or too long | Verify cable category |

### Pro Tips
- Always calibrate before testing
- Test from both ends
- Save all results for documentation
- Use Permanent Link adapters (not Channel)`
    },
    {
        id: 'sc-004', discipline: 'structured-cabling', category: 'Fiber',
        title: 'Fiber Optic Standards & Installation',
        tags: ['fiber', 'singlemode', 'multimode', 'OTDR', 'fusion splice'],
        content: `## Fiber Optic Cabling

### Fiber Types
| Type | Core/Cladding | Wavelength | Max Distance | Use |
|------|-------------|-----------|-------------|-----|
| OM1 (62.5/125) | 62.5µm | 850nm | 275m (1GbE) | Legacy |
| OM3 (50/125) | 50µm | 850nm | 300m (10GbE) | Common |
| OM4 (50/125) | 50µm | 850nm | 400m (10GbE) | Recommended |
| OM5 (50/125) | 50µm | 850/953nm | 400m | SWDM |
| OS2 (9/125) | 9µm | 1310/1550nm | 10km+ | Campus/long |

### Connector Types
- **LC** — Most common, small form factor
- **SC** — Square, push-pull, legacy
- **ST** — Bayonet, legacy
- **MPO/MTP** — Multi-fiber (12/24), high density

### Testing
- **OLTS** (Optical Loss Test Set): Measures end-to-end loss
- **OTDR** (Optical Time Domain Reflectometer): Maps entire path
- Max insertion loss per connection: 0.75 dB (TIA), 0.3 dB (typical)
- Max splice loss: 0.3 dB (mechanical), 0.1 dB (fusion)`
    },

    // ═══ CCTV / VIDEO SURVEILLANCE ═════════════════════════
    {
        id: 'cctv-001', discipline: 'cctv', category: 'System Design',
        title: 'IP Camera System Design Guide',
        tags: ['IP camera', 'NVR', 'PoE', 'bandwidth', 'storage'],
        content: `## IP Surveillance System Design

### Camera Resolution Guide
| Resolution | Megapixels | Typical Use |
|-----------|-----------|------------|
| 1080p | 2MP | General surveillance, most applications |
| 4MP | 4MP | Detail-critical areas |
| 4K/8MP | 8MP | License plates, facial detail |
| 12MP+ | 12MP+ | Panoramic, multi-sensor |

### Bandwidth Calculations
**Formula**: Bitrate × Cameras = Total Bandwidth
| Resolution | H.264 (Mbps) | H.265 (Mbps) |
|-----------|-------------|-------------|
| 1080p 15fps | 4-6 | 2-3 |
| 1080p 30fps | 6-10 | 3-5 |
| 4MP 15fps | 6-8 | 3-4 |
| 4K 15fps | 12-16 | 6-8 |

### Storage Calculation
**Formula**: Bitrate (Mbps) × 86400 sec × Days ÷ 8 ÷ 1024 = TB per camera
Example: 4 Mbps × 86,400 × 30 ÷ 8 ÷ 1,024 ÷ 1,024 = ~1.26 TB/camera/30 days

### PoE Power Budget
| PoE Standard | Max Power | Common Use |
|-------------|----------|-----------|
| 802.3af (PoE) | 15.4W | Basic cameras |
| 802.3at (PoE+) | 30W | PTZ, heaters |
| 802.3bt (PoE++) | 60/90W | Multi-sensor, high-power PTZ |`
    },
    {
        id: 'cctv-002', discipline: 'cctv', category: 'Troubleshooting',
        title: 'Camera & NVR Troubleshooting Guide',
        tags: ['troubleshooting', 'no video', 'NVR', 'network'],
        content: `## CCTV Troubleshooting

### No Video on Camera
1. Check PoE switch — is port showing link light?
2. Ping camera IP — if no response, check cable/power
3. Verify camera IP not conflicting with another device
4. Try different port on switch
5. Connect laptop directly to camera — access web interface
6. Factory reset if needed (hold reset button 15-30 sec)

### NVR Not Recording
1. Check HDD status in NVR menu — healthy/error?
2. Verify recording schedule is enabled
3. Check storage space — auto-overwrite enabled?
4. Verify camera stream configuration matches NVR
5. Check for firmware updates

### Image Quality Issues
| Issue | Cause | Solution |
|-------|-------|---------|
| Blurry image | Focus, dirty lens | Clean lens, adjust focus |
| Dark image | IR not switching, exposure | Check IR cut filter, adjust exposure |
| Purple tint | IR cut filter stuck | Power cycle, replace if persistent |
| Bandwidth artifacts | Bitrate too low | Increase bitrate/quality |
| Fish-eye distortion | Wrong lens | Apply dewarp correction |

### Network Issues
- Use separate VLAN for cameras
- Enable IGMP snooping on switches
- Limit multicast streams
- Check MTU settings (recommend 1500)`
    },
    {
        id: 'cctv-003', discipline: 'cctv', category: 'Compliance',
        title: 'NDAA Compliance & Approved Manufacturers',
        tags: ['NDAA', 'compliance', 'approved', 'manufacturers'],
        content: `## NDAA Compliance for Video Surveillance

### What is NDAA Section 889?
Federal law prohibiting use of telecommunications equipment from specific manufacturers in government contracts. Effective August 13, 2020.

### Banned Manufacturers
- Huawei Technologies
- ZTE Corporation
- Hytera Communications
- Hikvision / HikVision (including OEM)
- Dahua Technology (including OEM)

### NDAA Compliant Manufacturers
| Manufacturer | Strengths |
|-------------|----------|
| Axis Communications | Premium, analytics, cybersecurity |
| Hanwha Vision (Wisenet) | Enterprise, AI analytics |
| Bosch Security | Commercial/enterprise |
| Motorola/Avigilon | AI, appearance search |
| Verkada | Cloud-managed |
| i-PRO (Panasonic) | Enterprise, analytics |
| March Networks | Retail-focused |
| Digital Watchdog | Mid-market value |
| Vivotek | Budget-friendly compliant |

### Important Notes
- Many Hikvision/Dahua OEMs exist — verify chip manufacturer
- NDAA applies to ALL federal contracts and subcontracts
- Private sector increasingly adopting NDAA compliance
- Always request NDAA compliance letter from manufacturer`
    },

    // ═══ ACCESS CONTROL ════════════════════════════════════
    {
        id: 'ac-001', discipline: 'access-control', category: 'System Design',
        title: 'Access Control System Architecture',
        tags: ['controllers', 'readers', 'architecture', 'Wiegand', 'OSDP'],
        content: `## Access Control Architecture

### System Components
1. **Head-End Server** — Software, database, user management
2. **Controllers (Panels)** — Process decisions, store credentials
3. **Readers** — Read credentials (card, fob, mobile, biometric)
4. **Door Hardware** — Electric strikes, maglocks, REX, door contacts

### Communication Protocols
| Protocol | Direction | Max Distance | Security |
|----------|-----------|-------------|---------|
| Wiegand 26-bit | Reader→Controller | 500ft | Low (unencrypted) |
| Wiegand 37-bit | Reader→Controller | 500ft | Low |
| OSDP v2 | Bidirectional | 4000ft (RS-485) | High (AES-128) |
| IP | Bidirectional | Unlimited | High (TLS) |

### OSDP Advantages (Recommended)
- Encrypted communication (AES-128)
- Bidirectional — reader gets feedback from controller
- Supervision — knows if reader is tampered
- Multi-factor support
- Remote firmware updates

### Door Hardware Selection
| Lock Type | Use Case | Fail-Safe? | Power |
|----------|---------|-----------|-------|
| Electric Strike | Standard doors | Configurable | 12/24VDC |
| Magnetic Lock | Secure areas, glass | Yes (power off = open) | 12/24VDC, 300-1200lbs |
| Electric Latch | Heavy-use doors | Configurable | 12/24VDC |
| Electrified Panic | Exits with ADA | Yes | 24VDC |

### Wiring Best Practices
- Home-run all readers to controller panel
- 22/6 shielded for readers (typical)
- 18/2 for lock power
- 22/2 for door contact and REX
- Separate power supply for maglocks`
    },
    {
        id: 'ac-002', discipline: 'access-control', category: 'Troubleshooting',
        title: 'Access Control Troubleshooting',
        tags: ['troubleshooting', 'reader', 'lock', 'door'],
        content: `## Access Control Troubleshooting

### Reader Not Reading Cards
1. Verify reader has power — LED should be visible
2. Check Wiegand/OSDP wiring at controller
3. Try a known-good card — could be deactivated credential
4. Verify card format matches reader (HID, MIFARE, etc.)
5. Check for RF interference near reader
6. Swap reader with known-good unit

### Door Not Locking/Unlocking
1. **Check power supply voltage** at lock:
   - Electric Strike: 12VDC or 24VDC (verify spec)
   - Maglock: Typically 12 or 24VDC
2. Test lock directly with power — bypass controller
3. Check relay output on controller
4. Verify door contact alignment
5. Check REX (Request to Exit) — may be holding door unlocked
6. Verify fail-safe vs fail-secure setting

### Common Voltage Readings
| Device | Expected Voltage |
|--------|-----------------|
| Reader (idle) | 12VDC / 5VDC |
| Electric Strike (locked) | 0V / 24V (depends on config) |
| Maglock (holding) | 12 or 24VDC |
| Door Contact (closed) | Short / 0Ω |
| REX (not pressed) | Open / 10KΩ |
| REX (pressed) | Short / 0Ω |`
    },

    // ═══ DAS (Distributed Antenna Systems) ═════════════════
    {
        id: 'das-001', discipline: 'das', category: 'System Design',
        title: 'DAS/BDA System Design Fundamentals',
        tags: ['DAS', 'BDA', 'ERRCS', 'RF', 'signal'],
        content: `## Distributed Antenna System Design

### What is DAS?
DAS extends wireless cellular and public safety radio coverage inside buildings where signals cannot penetrate. Required by fire code (NFPA 1221 / IFC 510).

### System Types
| Type | Description | Best For |
|------|------------|---------|
| Passive DAS | Coax + splitters + antennas, no amplification | Small buildings |
| Active DAS | BDA (Bi-Directional Amplifier) + fiber/coax + remote antennas | Large buildings |
| Hybrid DAS | Combination passive + active | Mid-size |
| Digital DAS | Head-end + fiber + digital remotes | Enterprise/campus |

### BDA (Bi-Directional Amplifier) Sizing
- **Donor Signal**: Measure signal at BDA location (donor antenna)
- **Coverage Area**: Calculate number of antennas needed
- **Gain Required**: Donor signal + cable/splitter losses + antenna gain = target coverage
- **Target**: -95 dBm minimum for voice, -85 dBm for data

### Frequency Bands
| Band | Frequency | Carriers |
|------|----------|---------|
| Band 12/17 (700MHz) | 698-746 MHz | AT&T, T-Mobile |
| Band 13 (700MHz) | 746-756 MHz | Verizon |
| Band 14 (FirstNet) | 758-768 MHz | FirstNet/AT&T |
| Band 71 (600MHz) | 617-652 MHz | T-Mobile |
| Public Safety | 700/800 MHz | Fire/EMS/Police |

### NFPA 1221 / IFC Section 510 Requirements
- Signal strength: -95 dBm minimum in 95% of building area
- Critical areas (stairs, elevators): 99% coverage
- 12-hour battery backup for public safety
- Annual testing and certification
- AHJ (local fire marshal) must approve design`
    },

    // ═══ AUDIO VISUAL ═════════════════════════════════════
    {
        id: 'av-001', discipline: 'av', category: 'System Design',
        title: 'AV System Design & Room Standards',
        tags: ['AV', 'display', 'audio', 'DSP', 'conference'],
        content: `## Audio Visual System Design

### Display Sizing (AVIXA DISCAS Standard)
**4x/6x Rule**: Maximum viewing distance = Screen height × multiplier
| Content Type | Max Distance | Screen Height for 20ft |
|-------------|-------------|----------------------|
| Analytical (spreadsheets) | 4× screen height | 60" / 5ft |
| Basic (presentations) | 6× screen height | 40" / 3.3ft |
| Passive (video) | 8× screen height | 30" / 2.5ft |

### Audio System Design
- **Speech intelligibility**: Target STI > 0.6
- **Speaker coverage**: 1 speaker per 250 sq ft (ceiling)
- **DSP essentials**: AEC (echo cancel), AGC, noise gate, EQ
- **Microphone placement**: Within 24" of speaker, avoid >36"

### Room Types
| Room | Key Equipment |
|------|-------------|
| Huddle (4-6) | 55" display, soundbar, USB camera |
| Conference (8-12) | 75" display, DSP, ceiling mics, PTZ camera |
| Boardroom (12-20) | 85"+ or dual displays, DSP, beamforming mics |
| Training (20-40) | Projector/LED wall, wireless mic, recording |
| Auditorium (40+) | Projector, line array speakers, mixing console |

### Common Cable Types
| Signal | Cable | Max Distance |
|--------|-------|-------------|
| HDMI 2.0 | HDMI | 15ft (passive), 100ft (active/fiber) |
| HDBaseT | Cat6a | 328ft (100m) |
| SDI | Coax | 300ft+ |
| Dante Audio | Cat6 | 328ft |
| RS-232 Control | Cat5/serial | 50ft |
| USB 2.0 | USB | 16ft (5m) without extender |`
    },

    // ═══ INTRUSION DETECTION ══════════════════════════════
    {
        id: 'int-001', discipline: 'intrusion', category: 'System Design',
        title: 'Intrusion Detection System Design',
        tags: ['intrusion', 'alarm', 'motion', 'sensors', 'zones'],
        content: `## Intrusion Detection System Design

### Sensor Types & Placement
| Sensor | Detection | Coverage | Mounting |
|--------|----------|---------|---------|
| PIR Motion | Body heat movement | 40×56ft | 7.5ft height, corner |
| Dual-Tech | PIR + Microwave | 40×56ft | 7.5ft, reduces false alarms |
| Glass Break | Breaking glass acoustic | 25ft radius | Ceiling or wall |
| Door/Window Contact | Open/close | N/A | Frame/door gap |
| Shock Sensor | Vibration/impact | Per surface | Wall/ceiling |
| Beam Detector | IR beam break | 100-500ft | Perimeter |
| PIR Curtain | Narrow pattern | 40ft × 6ft | Above windows |

### Zone Types
| Zone Type | Response |
|----------|---------|
| Entry/Exit Delay | Delay before alarm (30-60 sec) |
| Instant/Perimeter | Immediate alarm |
| Interior/Follower | Active when AWAY, not STAY |
| 24-Hour | Always active (fire, panic) |
| Cross-Zone | Requires 2 zones for alarm |

### Panel Programming
- Entry delay: 30 seconds typical
- Exit delay: 60 seconds typical
- Siren timeout: 4 minutes (per local ordinance)
- Auto-arm: Schedule-based arming
- Cross-zoning: Reduces false dispatches

### Communication Paths
| Path | Reliability | Speed | Notes |
|------|-----------|-------|-------|
| Cellular (LTE) | High | Fast | Primary recommended |
| IP/Ethernet | High | Fastest | Needs network |
| POTS (phone) | Medium | Slow | Legacy, being phased out |
| Dual-Path | Highest | Fast | Cell + IP recommended |`
    },

    // ═══ FIRE ALARM ═══════════════════════════════════════
    {
        id: 'fa-001', discipline: 'fire-alarm', category: 'Standards',
        title: 'NFPA 72 Fire Alarm Essentials',
        tags: ['NFPA 72', 'fire alarm', 'FACP', 'smoke', 'notification'],
        content: `## NFPA 72 Fire Alarm Essentials

### System Types
| Type | Description | Use |
|------|------------|-----|
| Conventional | Zones, non-addressable | Small buildings |
| Addressable | Individual device IDs | Commercial, recommended |
| Analog Addressable | Sensitivity values | Large/complex buildings |

### Initiating Devices
| Device | Spacing (NFPA 72 Ch.17) | Coverage |
|--------|------------------------|---------|
| Smoke Detector (spot) | 30ft apart, 21ft from wall | 900 sq ft |
| Heat Detector (fixed) | 50ft apart, 35ft from wall | 2,500 sq ft |
| Heat Detector (ROR) | 50ft apart | 2,500 sq ft |
| Duct Detector | Per duct, >2000 CFM | N/A |
| Pull Station | Within 60" of exit, 5ft travel | Near exits |
| Waterflow Switch | Per sprinkler riser | N/A |
| Tamper Switch | Per valve | N/A |

### Notification Appliance Requirements
- **Audible**: 15 dB above ambient, or 5 dB above max sound
- **Sleeping areas**: 75 dBA at pillow level
- **Visual (strobes)**: Per room size, sync required within field of view
  - 20×20 room: 15 cd
  - 28×28 room: 30 cd
  - 40×40 room: 75 cd
  - 54×54 room: 115 cd

### NAC Circuit Design
- **Class A**: Wiring returns to panel (fault tolerant)
- **Class B**: End-of-line resistor (non-fault tolerant)
- Maximum 26 notification appliances per NAC max
- Check voltage drop: Must maintain 16VDC minimum at last device`
    },
    {
        id: 'fa-002', discipline: 'fire-alarm', category: 'Troubleshooting',
        title: 'Fire Alarm Troubleshooting Guide',
        tags: ['troubleshooting', 'ground fault', 'trouble', 'FACP'],
        content: `## Fire Alarm Troubleshooting

### Ground Fault Troubleshooting
Ground faults are the #1 fire alarm trouble condition:
1. **Isolate the circuit**: Disconnect SLC/NAC loops one at a time
2. **Divide and conquer**: Disconnect half the devices on the faulted loop
3. **Megger test**: Use insulation resistance tester (not on addressable devices)
4. **Common causes**: Water in junction box, nail through cable, insulation damage
5. **Measurement**: Should read >1MΩ to ground on each conductor

### Common Trouble Conditions
| Trouble | Cause | Fix |
|---------|-------|-----|
| Ground Fault | Wire touching conduit/ground | Find and repair insulation damage |
| Open Circuit | Break in wiring | Find break, repair splice |
| Short Circuit | Wires touching | Separate conductors, fix splice |
| Device Trouble | Failed device | Replace device |
| Low Battery | Batteries aged | Replace with same AH rating |
| AC Power Loss | Breaker tripped | Reset breaker, check lock |
| Communication | Phone/cellular fail | Check dialer, cell signal |

### Battery Calculations
**Formula**: Total NAC current × 24 hours standby + Total NAC current × 5 min alarm
- Standby: Full system supervisory current × 24 hours
- Alarm: All NAC devices at full load × 5 minutes (or 15 min if no sprinklers)
- Use 120% safety factor
- Replace batteries every 5 years (sealed lead-acid)

### Inspection Frequencies (NFPA 72 Ch.14)
| Item | Visual | Testing |
|------|--------|---------|
| FACP | Weekly | Annually |
| Smoke Detectors | Semi-annually | Annually |
| Heat Detectors | Semi-annually | Annually |
| Pull Stations | Semi-annually | Annually |
| Waterflow | Quarterly | Semi-annually |
| Notification Appliances | Semi-annually | Annually |
| Batteries | Monthly | Semi-annually |
| Emergency Voice | Semi-annually | Annually |`
    },
    {
        id: 'fa-003', discipline: 'fire-alarm', category: 'Installation',
        title: 'Fire Alarm Wiring & Installation Guide',
        tags: ['wiring', 'installation', 'SLC', 'NAC', 'fire rated'],
        content: `## Fire Alarm Wiring Standards

### Cable Types
| Application | Cable Type | Notes |
|------------|-----------|-------|
| SLC (addressable) | 18/2 or 16/2, shielded | Twisted pair, FPLR minimum |
| NAC (notification) | 14/2 or 12/2 | Size for voltage drop |
| Initiating (conventional) | 18/2 | FPLR or FPLP |
| Speaker | 14/2 or 12/2 | Size for wattage |
| Riser/plenum | FPLP (plenum rated) | Required in air-handling spaces |

### Fire-Rated Cable Requirements
- **FPLR**: Fire Power Limited Riser — vertical runs between floors
- **FPLP**: Fire Power Limited Plenum — air handling spaces
- **CI (Circuit Integrity)**: 2-hour fire rated — survivability circuits
- Must use CI cable for emergency voice/alarm in high-rises

### Conduit Requirements
- Fire alarm wiring may NOT share conduit with power cables
- Can share with other low-voltage if same system
- Use red conduit or red paint to identify fire alarm
- Seal penetrations with fire-rated sealant

### Voltage Drop Calculation
**Formula**: VD = (2 × L × I × R) ÷ 1000
Where: L = distance (ft), I = current (amps), R = resistance (Ω/1000ft)
- 18 AWG: 6.51 Ω/1000ft
- 16 AWG: 4.09 Ω/1000ft  
- 14 AWG: 2.57 Ω/1000ft
- Minimum voltage at last device: 16VDC (for 24V system)`
    },

    // ═══ ADDITIONAL CROSS-DISCIPLINE ══════════════════════
    {
        id: 'gen-001', discipline: 'structured-cabling', category: 'PoE',
        title: 'PoE Standards & Power Budget Planning',
        tags: ['PoE', 'PoE+', 'PoE++', 'power budget', 'IEEE'],
        content: `## Power over Ethernet (PoE) Standards

### IEEE PoE Standards
| Standard | Name | Max PSE Power | PD Power | Pairs |
|----------|------|-------------|----------|-------|
| 802.3af | PoE | 15.4W | 12.95W | 2 |
| 802.3at | PoE+ | 30W | 25.5W | 2 |
| 802.3bt Type 3 | PoE++ | 60W | 51W | 4 |
| 802.3bt Type 4 | PoE++ | 90W (100W) | 71.3W | 4 |

### Power Budget Calculation
1. List all PoE devices and their power draw
2. Add 20% safety margin
3. Verify switch total PoE budget exceeds requirement
4. Account for cable loss (especially >50m runs)

### Cable Considerations for PoE
- **Cat5e**: Supports PoE/PoE+ reliably
- **Cat6**: Recommended for PoE++
- **Cat6a**: Required for high-power PoE++ and reduces heat
- **Temperature Rating**: PoE generates heat in cable bundles → derate temperature
- **Bundle Derating**: Reduce max temp by cable count in bundle:
  - 1-6 cables: 100% capacity
  - 7-12 cables: 90% capacity
  - 13-24 cables: 80% capacity
  - 25+ cables: 70% capacity`
    },
    {
        id: 'gen-002', discipline: 'access-control', category: 'Credentials',
        title: 'Credential Technologies Comparison',
        tags: ['credentials', 'HID', 'MIFARE', 'mobile', 'biometrics'],
        content: `## Credential Technology Comparison

### Card/Fob Technologies
| Technology | Frequency | Security | Notes |
|-----------|-----------|---------|-------|
| 125kHz Prox (HID) | 125 kHz | Low — easily cloned | Legacy, phase out |
| MIFARE Classic | 13.56 MHz | Medium — cracked | Avoid for new installs |
| iCLASS SE | 13.56 MHz | High | HID ecosystem |
| SEOS | 13.56 MHz + BLE | Very High | HID, mobile capable |
| DESFire EV2/EV3 | 13.56 MHz | Very High | Open standard |
| MIFARE Plus | 13.56 MHz | High | NXP |

### Mobile Credentials
- **HID Mobile Access**: BLE + NFC via smartphone
- **Apple Wallet**: Employee badges in Apple Wallet
- **Google Wallet**: Android NFC credentials
- **Advantages**: No physical card to lose, remote issuance
- **Considerations**: Phone battery, NFC availability

### Biometric Options
| Type | FAR | FRR | Speed | Cost |
|------|-----|-----|-------|------|
| Fingerprint | 0.001% | 0.1% | Fast | Low |
| Facial Recognition | 0.01% | 0.5% | Fast | Medium |
| Iris Scan | 0.0001% | 0.2% | Medium | High |
| Palm Vein | 0.00008% | 0.01% | Medium | High |

*FAR = False Accept Rate, FRR = False Reject Rate*`
    },
];

export function getArticlesByDiscipline(disciplineId) {
    return KNOWLEDGE_ARTICLES.filter(a => a.discipline === disciplineId);
}

export function getArticlesByCategory(category) {
    return KNOWLEDGE_ARTICLES.filter(a => a.category === category);
}

export function searchArticles(query) {
    const q = query.toLowerCase();
    return KNOWLEDGE_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
}

export function getArticle(id) {
    return KNOWLEDGE_ARTICLES.find(a => a.id === id);
}

export function getAllCategories() {
    return [...new Set(KNOWLEDGE_ARTICLES.map(a => a.category))];
}

export function getAllTags() {
    const tags = new Set();
    KNOWLEDGE_ARTICLES.forEach(a => a.tags.forEach(t => tags.add(t)));
    return [...tags].sort();
}
