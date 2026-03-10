/* ═══════════════════════════════════════════════════════════
   Gemini 3.1 Pro — 3 Specialized AI Brains
   SecureServ Pro Service Intelligence Engine
   ═══════════════════════════════════════════════════════════ */

const GEMINI_MODEL = 'gemini-3.1-pro';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── Brain Definitions ─────────────────────────────────────
export const AI_BRAINS = {
    field: {
        id: 'field',
        name: 'Field Intelligence',
        icon: 'build',
        color: '#0d9488',
        description: 'Troubleshooting, diagnostics, repair procedures, and field service guidance',
        systemPrompt: `You are the Field Intelligence Brain for SecureServ Pro, a Fortune 500 security service management platform.
You are an elite-level field service expert specializing in ALL low-voltage and security systems:
- Structured Cabling (Cat5e, Cat6, Cat6a, Fiber Optic, MDF/IDF)
- CCTV / IP Video Surveillance (IP cameras, NVR, DVR, VMS, PoE, analytics)
- Access Control (card readers, controllers, door hardware, Wiegand, OSDP, biometrics)
- DAS (Distributed Antenna Systems, RF planning, BDA, signal boosters)
- Audio Visual (DSP, speakers, displays, matrix switching, control systems)
- Intrusion Detection (motion sensors, glass break, panels, zones, cellular communicators)
- Fire Alarm (FACP, initiating devices, NAC, NFPA 72, addressable vs conventional)

ROLE: Provide step-by-step troubleshooting, repair procedures, diagnostic guidance, wiring instructions, and field service best practices. Always include safety warnings where applicable.

FORMAT: Use clear numbered steps, include wire color codes, voltage expectations, and test procedures. Be specific with model numbers and industry-standard tools. If a question is ambiguous, ask clarifying questions.

EXPERTISE LEVEL: Master Technician / Field Engineer level. Assume the user is a trained security technician.`
    },

    compliance: {
        id: 'compliance',
        name: 'Code & Compliance',
        icon: 'gavel',
        color: '#a16207',
        description: 'NFPA, NEC, BICSI, TIA/EIA standards, AHJ requirements, and inspection prep',
        systemPrompt: `You are the Code & Compliance Brain for SecureServ Pro, a Fortune 500 security service management platform.
You are an expert in ALL relevant codes, standards, and regulations for low-voltage and security systems:

FIRE ALARM: NFPA 72 (National Fire Alarm Code), NFPA 70 (NEC), NFPA 101 (Life Safety Code), UL 864, UL 2572
STRUCTURED CABLING: TIA-568, TIA-569, TIA-606, TIA-607, BICSI TDMM, ANSI/TIA-942 (Data Centers)
ACCESS CONTROL: UL 294, NFPA 80 (Fire Doors), ADA compliance, IBC (International Building Code)
CCTV: NEC Article 725/820, NDAA compliance, ONVIF standards
INTRUSION: UL 681, UL 1023, UL 2050, SIA standards
DAS: NFPA 1221, IFC Section 510, local fire marshal requirements
AV: NEC Article 640/725, AVIXA standards, InfoComm

ROLE: Provide code references, compliance requirements, inspection checklists, and regulatory guidance. Always cite specific code sections. Explain the intent behind codes, not just the letter.

FORMAT: Reference specific code sections (e.g., "Per NFPA 72, 10.6.7.2..."). Include tables of requirements when applicable. Flag common code violations and how to correct them.

EXPERTISE LEVEL: AHJ / Fire Marshal / Code Consultant level.`
    },

    design: {
        id: 'design',
        name: 'System Design',
        icon: 'architecture',
        color: '#0f766e',
        description: 'System design, engineering calculations, product specifications, and architecture planning',
        systemPrompt: `You are the System Design Brain for SecureServ Pro, a Fortune 500 security service management platform.
You are a senior systems engineer and designer for ALL low-voltage and security systems:

EXPERTISE AREAS:
- Structured Cabling: MDF/IDF design, cable pathway planning, backbone/horizontal design, fiber count planning
- CCTV: Camera placement, lens selection, storage calculations, bandwidth planning, network design
- Access Control: System architecture, controller topology, door hardware specification, credential technology selection
- DAS: RF coverage design, signal propagation, antenna placement, carrier coordination, BDA sizing
- AV: Room acoustics, display sizing, DSP design, loudspeaker coverage, control system programming
- Intrusion: Zone planning, sensor placement, partition design, central station programming
- Fire Alarm: Device placement per NFPA 72, NAC circuit design, battery calculations, riser diagrams

ROLE: Provide system design recommendations, engineering calculations, product comparisons, bill of materials guidance, and architecture planning. Help with proposals and scope of work documents.

FORMAT: Include calculations with formulas, comparison tables, recommended products with model numbers, and design diagrams described in text. Be specific with quantities and specifications.

EXPERTISE LEVEL: Senior Design Engineer / PE level.`
    }
};

// ── API Key Management ────────────────────────────────────
export function getApiKey() {
    return localStorage.getItem('secureserv_gemini_key') || '';
}

export function setApiKey(key) {
    localStorage.setItem('secureserv_gemini_key', key);
}

export function hasApiKey() {
    return !!getApiKey();
}

// ── Chat History Management ───────────────────────────────
const chatHistories = { field: [], compliance: [], design: [] };

export function getChatHistory(brainId) {
    return chatHistories[brainId] || [];
}

export function clearChatHistory(brainId) {
    chatHistories[brainId] = [];
}

// ── Gemini API Call ───────────────────────────────────────
export async function queryBrain(brainId, userMessage, context = '') {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Gemini API key not configured. Go to Settings to add your key.');

    const brain = AI_BRAINS[brainId];
    if (!brain) throw new Error(`Unknown brain: ${brainId}`);

    // Build conversation with history
    const history = chatHistories[brainId] || [];

    const contents = [];

    // Add system instruction via first user turn
    const systemContext = context
        ? `${brain.systemPrompt}\n\nADDITIONAL CONTEXT:\n${context}`
        : brain.systemPrompt;

    // Add history
    history.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    // Add current message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(
            `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: { parts: [{ text: systemContext }] },
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 4096,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    ]
                })
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

        // Update history
        chatHistories[brainId] = [
            ...history,
            { role: 'user', text: userMessage, timestamp: new Date().toISOString() },
            { role: 'assistant', text: reply, timestamp: new Date().toISOString() }
        ];

        // Keep last 20 messages per brain
        if (chatHistories[brainId].length > 40) {
            chatHistories[brainId] = chatHistories[brainId].slice(-40);
        }

        return reply;
    } catch (error) {
        if (error.message.includes('API key')) {
            throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
        }
        throw error;
    }
}

// ── Quick Query (no history) ──────────────────────────────
export async function quickQuery(brainId, question, context = '') {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Gemini API key not configured.');

    const brain = AI_BRAINS[brainId];

    const response = await fetch(
        `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: question }] }],
                systemInstruction: { parts: [{ text: `${brain.systemPrompt}\n\n${context}` }] },
                generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
            })
        }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Suggested Prompts per Brain ───────────────────────────
export const BRAIN_PROMPTS = {
    field: [
        'Camera showing no video — POE switch shows link light but no image on NVR',
        'Access control door not locking — how to troubleshoot electric strike',
        'Fire alarm panel showing ground fault — systematic troubleshooting steps',
        'Cat6 cable failing fluke test — how to identify and fix the issue',
        'Motion detector false alarms — identification and resolution steps',
        'DAS BDA showing low signal — RF troubleshooting procedure',
        'DSP audio feedback/echo — how to tune and eliminate',
        'NVR hard drive failure — data recovery and replacement procedure',
    ],
    compliance: [
        'NFPA 72 smoke detector spacing requirements for standard ceilings',
        'TIA-568 maximum cable run distances for Cat6a',
        'ADA compliance requirements for access control reader mounting heights',
        'NEC requirements for low voltage cable in plenum spaces',
        'NFPA 1221 in-building DAS coverage requirements',
        'UL 294 listing requirements for access control systems',
        'NDAA compliant camera manufacturers — current approved list',
        'Fire alarm inspection frequency requirements per NFPA 72 Chapter 14',
    ],
    design: [
        'Design a 32-camera IP surveillance system for a 50,000 sq ft warehouse',
        'Calculate storage requirements for 64 cameras at 15fps 1080p for 30 days',
        'Design MDF/IDF layout for a 3-story office building with 200 drops',
        'Size a fire alarm battery for a 5-NAC circuit system',
        'Design access control for a 20-door office building with visitor management',
        'Calculate voltage drop for a 24V fire alarm NAC circuit at 1000ft',
        'Design DAS coverage for a 10-story building with 3 carriers',
        'Specify AV system for a 50-person boardroom with video conferencing',
    ]
};
