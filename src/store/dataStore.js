// dataStore.js — Reactive data store with cloud-simulation persistence
const STORAGE_KEY = 'secureserv_pro_data';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

function getDefaultData() {
    const now = new Date().toISOString();
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
    const threeDaysAgo = new Date(today); threeDaysAgo.setDate(today.getDate() - 3);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    return {
        customers: [
            { id: uid(), name: 'Apex Corporate Tower', contact: 'James Mitchell', phone: '(555) 234-5678', email: 'jmitchell@apexcorp.com', address: '1200 Financial Blvd, Suite 800, Dallas, TX 75201', type: 'Commercial', contractType: 'Premium', notes: 'High-priority client. 24/7 monitoring.', createdAt: threeDaysAgo.toISOString() },
            { id: uid(), name: 'Greenfield Residence', contact: 'Sarah Greenfield', phone: '(555) 345-6789', email: 'sarah.g@email.com', address: '4521 Oak Lane, Plano, TX 75023', type: 'Residential', contractType: 'Standard', notes: 'New alarm system installed Jan 2026.', createdAt: twoDaysAgo.toISOString() },
            { id: uid(), name: 'Metro Shopping Center', contact: 'David Chen', phone: '(555) 456-7890', email: 'dchen@metroshops.com', address: '8900 Commerce St, Irving, TX 75062', type: 'Commercial', contractType: 'Enterprise', notes: '45 cameras, 12 access points.', createdAt: yesterday.toISOString() },
            { id: uid(), name: 'Sunrise Medical Center', contact: 'Dr. Patricia Owens', phone: '(555) 567-8901', email: 'powens@sunrisemc.org', address: '2100 Health Park Dr, Arlington, TX 76011', type: 'Commercial', contractType: 'Enterprise', notes: 'HIPAA compliance required. Biometric access.', createdAt: threeDaysAgo.toISOString() },
            { id: uid(), name: 'Henderson Family', contact: 'Mark Henderson', phone: '(555) 678-9012', email: 'mark.h@email.com', address: '7743 Maple Ave, Frisco, TX 75034', type: 'Residential', contractType: 'Basic', notes: 'Ring doorbell + window sensors.', createdAt: now },
        ],
        technicians: [
            { id: uid(), name: 'Carlos Rivera', phone: '(555) 111-2233', email: 'carlos.r@secureserv.com', skills: ['CCTV', 'Access Control', 'Alarm Systems', 'Network Cabling'], certifications: ['NICET Level II', 'Lenel Certified'], status: 'Available', avatar: null, hireDate: '2023-05-15', rating: 4.8, completedJobs: 342 },
            { id: uid(), name: 'Jessica Tran', phone: '(555) 222-3344', email: 'jessica.t@secureserv.com', skills: ['Fire Alarm', 'Intrusion Detection', 'Alarm Systems'], certifications: ['NICET Level III', 'EST Certified'], status: 'On Job', avatar: null, hireDate: '2022-01-20', rating: 4.9, completedJobs: 487 },
            { id: uid(), name: 'Marcus Johnson', phone: '(555) 333-4455', email: 'marcus.j@secureserv.com', skills: ['CCTV', 'Network Cabling', 'Structured Cabling'], certifications: ['Axis Certified', 'BICSI Installer'], status: 'Available', avatar: null, hireDate: '2024-03-10', rating: 4.6, completedJobs: 156 },
            { id: uid(), name: 'Emily Dawson', phone: '(555) 444-5566', email: 'emily.d@secureserv.com', skills: ['Access Control', 'Intercom Systems', 'Alarm Systems', 'Fire Alarm'], certifications: ['HID Certified', 'DMP Certified'], status: 'Off Duty', avatar: null, hireDate: '2021-11-01', rating: 4.7, completedJobs: 523 },
            { id: uid(), name: "Ryan O'Brien", phone: '(555) 555-6677', email: 'ryan.o@secureserv.com', skills: ['CCTV', 'Access Control', 'Intrusion Detection', 'Fire Alarm'], certifications: ['NICET Level II', 'Genetec Certified'], status: 'Available', avatar: null, hireDate: '2023-09-01', rating: 4.5, completedJobs: 201 },
        ],
        tickets: [
            { id: uid(), title: 'Camera System Offline - Building A', customerId: null, priority: 'Critical', status: 'Open', category: 'CCTV', description: 'All 12 cameras on the 3rd floor went offline after power surge. NVR showing error codes.', assignedTo: null, scheduledDate: today.toISOString().split('T')[0], scheduledTime: '09:00', estimatedDuration: 3, notes: [], parts: [], createdAt: yesterday.toISOString(), updatedAt: yesterday.toISOString(), closedAt: null, billingStatus: 'Unbilled', laborHours: 0, laborRate: 95 },
            { id: uid(), title: 'Access Card Reader Malfunction', customerId: null, priority: 'High', status: 'In Progress', category: 'Access Control', description: 'Main entrance card reader not reading HID cards. Manual override in use.', assignedTo: null, scheduledDate: today.toISOString().split('T')[0], scheduledTime: '10:30', estimatedDuration: 2, notes: [], parts: [], createdAt: twoDaysAgo.toISOString(), updatedAt: yesterday.toISOString(), closedAt: null, billingStatus: 'Unbilled', laborHours: 1.5, laborRate: 95 },
            { id: uid(), title: 'Fire Panel Trouble Signal', customerId: null, priority: 'Critical', status: 'Open', category: 'Fire Alarm', description: 'Trouble signal on zone 4. Smoke detector showing fault. AHJ inspection next week.', assignedTo: null, scheduledDate: today.toISOString().split('T')[0], scheduledTime: '08:00', estimatedDuration: 2, notes: [], parts: [], createdAt: now, updatedAt: now, closedAt: null, billingStatus: 'Unbilled', laborHours: 0, laborRate: 110 },
            { id: uid(), title: 'Monthly System Test - Henderson', customerId: null, priority: 'Low', status: 'Scheduled', category: 'Alarm Systems', description: 'Routine monthly system test. Check all zones, battery backup, and communication.', assignedTo: null, scheduledDate: nextWeek.toISOString().split('T')[0], scheduledTime: '14:00', estimatedDuration: 1, notes: [], parts: [], createdAt: now, updatedAt: now, closedAt: null, billingStatus: 'Unbilled', laborHours: 0, laborRate: 85 },
            { id: uid(), title: 'New Camera Installation - Parking Lot', customerId: null, priority: 'Medium', status: 'Scheduled', category: 'CCTV', description: 'Install 4 new 4K IP cameras in parking structure. Run CAT6 to MDF.', assignedTo: null, scheduledDate: nextWeek.toISOString().split('T')[0], scheduledTime: '07:00', estimatedDuration: 8, notes: [], parts: [], createdAt: yesterday.toISOString(), updatedAt: yesterday.toISOString(), closedAt: null, billingStatus: 'Unbilled', laborHours: 0, laborRate: 95 },
            { id: uid(), title: 'Alarm Panel Replacement', customerId: null, priority: 'High', status: 'Parts Ordered', category: 'Alarm Systems', description: 'Existing DSC panel EOL. Upgrade to DMP XR550. Full reprogramming required.', assignedTo: null, scheduledDate: null, scheduledTime: null, estimatedDuration: 6, notes: [], parts: [], createdAt: threeDaysAgo.toISOString(), updatedAt: yesterday.toISOString(), closedAt: null, billingStatus: 'Unbilled', laborHours: 0, laborRate: 95 },
        ],
        parts: [
            { id: uid(), name: 'Axis M3115-LVE Camera', sku: 'AXIS-M3115', category: 'CCTV', price: 389.99, cost: 245.00, quantity: 12, reorderLevel: 5, vendor: 'Axis Communications', location: 'Warehouse A - Shelf 3', description: '2MP fixed dome with IR. Indoor/outdoor.' },
            { id: uid(), name: 'HID iCLASS SE Reader', sku: 'HID-ICLASS-SE', category: 'Access Control', price: 275.00, cost: 165.00, quantity: 8, reorderLevel: 3, vendor: 'HID Global', location: 'Warehouse A - Shelf 7', description: 'Multi-technology smart card reader.' },
            { id: uid(), name: 'System Sensor 2WT-B Smoke Detector', sku: 'SS-2WTB', category: 'Fire Alarm', price: 45.99, cost: 22.50, quantity: 48, reorderLevel: 20, vendor: 'System Sensor', location: 'Warehouse B - Shelf 1', description: '2-wire photoelectric with base.' },
            { id: uid(), name: 'DMP XR550 Panel', sku: 'DMP-XR550', category: 'Alarm Systems', price: 849.99, cost: 520.00, quantity: 3, reorderLevel: 2, vendor: 'DMP', location: 'Warehouse A - Shelf 1', description: '550-zone alarm panel with built-in comm.' },
            { id: uid(), name: 'CAT6 Plenum Cable (1000ft)', sku: 'CAT6-PL-1000', category: 'Cabling', price: 289.99, cost: 175.00, quantity: 6, reorderLevel: 3, vendor: 'Belden', location: 'Warehouse B - Shelf 5', description: 'Blue plenum-rated CAT6 UTP.' },
            { id: uid(), name: '12V 7Ah Battery', sku: 'BAT-12V7AH', category: 'Power', price: 24.99, cost: 12.50, quantity: 35, reorderLevel: 15, vendor: 'Altronix', location: 'Warehouse A - Shelf 2', description: 'Sealed lead-acid backup battery.' },
            { id: uid(), name: 'Honeywell 5800PIR-RES Motion', sku: 'HON-5800PIR', category: 'Intrusion Detection', price: 89.99, cost: 48.00, quantity: 22, reorderLevel: 10, vendor: 'Honeywell', location: 'Warehouse A - Shelf 4', description: 'Wireless PIR motion detector.' },
            { id: uid(), name: 'Hikvision 16-Ch NVR', sku: 'HIK-NVR16', category: 'CCTV', price: 599.99, cost: 350.00, quantity: 4, reorderLevel: 2, vendor: 'Hikvision', location: 'Warehouse A - Shelf 3', description: '16-channel 4K NVR with 4TB HDD.' },
        ],
        invoices: [
            { id: uid(), ticketId: null, customerId: null, invoiceNumber: 'INV-2026-001', date: threeDaysAgo.toISOString().split('T')[0], dueDate: nextWeek.toISOString().split('T')[0], status: 'Sent', items: [{ description: 'Camera replacement - Unit 4B', qty: 1, unitPrice: 389.99 }, { description: 'Labor - 3 hours @ $95/hr', qty: 1, unitPrice: 285.00 }], subtotal: 674.99, tax: 55.69, total: 730.68, notes: 'Net 30 terms.', paidAmount: 0 },
            { id: uid(), ticketId: null, customerId: null, invoiceNumber: 'INV-2026-002', date: twoDaysAgo.toISOString().split('T')[0], dueDate: nextWeek.toISOString().split('T')[0], status: 'Paid', items: [{ description: 'Monthly monitoring - March 2026', qty: 1, unitPrice: 149.99 }], subtotal: 149.99, tax: 12.37, total: 162.36, notes: 'Auto-pay processed.', paidAmount: 162.36 },
        ],
        partOrders: [
            { id: uid(), partId: null, partName: 'DMP XR550 Panel', sku: 'DMP-XR550', vendor: 'DMP', quantity: 2, unitCost: 520.00, totalCost: 1040.00, status: 'Ordered', orderDate: yesterday.toISOString().split('T')[0], expectedDate: nextWeek.toISOString().split('T')[0], trackingNumber: '1Z999AA10123456784', notes: 'Rush order for Henderson replacement.' },
        ],
        knowledgeBase: [
            { id: uid(), title: 'DMP XR550 Programming Guide', category: 'Alarm Systems', content: '1. Enter installer code (default 9713)\n2. Navigate to Zone Programming\n3. Set zone type per spec sheet\n4. Configure communication paths\n5. Test all zones with CS', tags: ['DMP', 'programming', 'alarm'], author: 'Carlos Rivera', createdAt: threeDaysAgo.toISOString() },
            { id: uid(), title: 'Axis Camera Network Reset', category: 'CCTV', content: '1. Hold reset button for 15 seconds\n2. Wait for status LED amber flash\n3. Camera returns to DHCP\n4. Access via 192.168.0.90 (default)\n5. Reconfigure IP settings', tags: ['Axis', 'camera', 'network', 'reset'], author: 'Marcus Johnson', createdAt: twoDaysAgo.toISOString() },
            { id: uid(), title: 'HID Reader Wiring Standards', category: 'Access Control', content: 'Standard Wiegand wiring:\n- Green: Data 0 (D0)\n- White: Data 1 (D1)\n- Red: +12VDC\n- Black: Ground\n- Orange: LED Control\n- Brown: Beeper Control\n\nMax cable run: 500ft with 22AWG', tags: ['HID', 'wiring', 'access control', 'wiegand'], author: 'Emily Dawson', createdAt: yesterday.toISOString() },
        ],
        activityLog: [],
        settings: {
            companyName: 'SecureServ Pro',
            companyPhone: '(555) 100-2000',
            companyEmail: 'dispatch@secureservpro.com',
            companyAddress: '5500 Security Way, Dallas, TX 75201',
            defaultLaborRate: 95,
            taxRate: 8.25,
            businessHours: { start: '07:00', end: '18:00' },
            emergencyRate: 142.50,
            slaTargets: { critical: 2, high: 4, medium: 8, low: 24 },
        },
    };
}

let listeners = new Set();

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('Failed to load data, using defaults', e); }
    return getDefaultData();
}

function saveData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.warn('Failed to save data', e); }
}

let _data = loadData();

function linkSeedData() {
    const d = _data;
    if (d.customers.length >= 5 && d.tickets.length >= 6) {
        if (!d.tickets[0].customerId) d.tickets[0].customerId = d.customers[0].id;
        if (!d.tickets[1].customerId) d.tickets[1].customerId = d.customers[0].id;
        if (!d.tickets[2].customerId) d.tickets[2].customerId = d.customers[3].id;
        if (!d.tickets[3].customerId) d.tickets[3].customerId = d.customers[4].id;
        if (!d.tickets[4].customerId) d.tickets[4].customerId = d.customers[2].id;
        if (!d.tickets[5].customerId) d.tickets[5].customerId = d.customers[4].id;
    }
    if (d.technicians.length >= 5 && d.tickets.length >= 6) {
        if (!d.tickets[0].assignedTo) d.tickets[0].assignedTo = d.technicians[2].id;
        if (!d.tickets[1].assignedTo) d.tickets[1].assignedTo = d.technicians[3].id;
        if (!d.tickets[2].assignedTo) d.tickets[2].assignedTo = d.technicians[1].id;
    }
    if (d.invoices.length >= 2 && d.customers.length >= 3) {
        if (!d.invoices[0].customerId) d.invoices[0].customerId = d.customers[0].id;
        if (!d.invoices[1].customerId) d.invoices[1].customerId = d.customers[2].id;
    }
    saveData(d);
}
linkSeedData();

const store = {
    getData: () => _data,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    _notify: () => { saveData(_data); listeners.forEach(fn => fn(_data)); },
    logActivity: (action, entity, entityId, details) => {
        _data.activityLog.unshift({ id: uid(), action, entity, entityId, details, timestamp: new Date().toISOString() });
        if (_data.activityLog.length > 200) _data.activityLog = _data.activityLog.slice(0, 200);
    },

    // CUSTOMERS
    getCustomers: () => _data.customers,
    getCustomer: (id) => _data.customers.find(c => c.id === id),
    addCustomer: (customer) => { const c = { ...customer, id: uid(), createdAt: new Date().toISOString() }; _data.customers.push(c); store.logActivity('Created', 'Customer', c.id, c.name); store._notify(); return c; },
    updateCustomer: (id, updates) => { const idx = _data.customers.findIndex(c => c.id === id); if (idx >= 0) { _data.customers[idx] = { ..._data.customers[idx], ...updates }; store.logActivity('Updated', 'Customer', id, updates.name || ''); store._notify(); } },
    deleteCustomer: (id) => { const c = _data.customers.find(c => c.id === id); _data.customers = _data.customers.filter(c => c.id !== id); store.logActivity('Deleted', 'Customer', id, c?.name || ''); store._notify(); },

    // TECHNICIANS
    getTechnicians: () => _data.technicians,
    getTechnician: (id) => _data.technicians.find(t => t.id === id),
    addTechnician: (tech) => { const t = { ...tech, id: uid(), completedJobs: 0, rating: 0 }; _data.technicians.push(t); store.logActivity('Created', 'Technician', t.id, t.name); store._notify(); return t; },
    updateTechnician: (id, updates) => { const idx = _data.technicians.findIndex(t => t.id === id); if (idx >= 0) { _data.technicians[idx] = { ..._data.technicians[idx], ...updates }; store.logActivity('Updated', 'Technician', id, updates.name || ''); store._notify(); } },
    deleteTechnician: (id) => { const t = _data.technicians.find(t => t.id === id); _data.technicians = _data.technicians.filter(t => t.id !== id); store.logActivity('Deleted', 'Technician', id, t?.name || ''); store._notify(); },

    // TICKETS
    getTickets: () => _data.tickets,
    getTicket: (id) => _data.tickets.find(t => t.id === id),
    addTicket: (ticket) => { const t = { ...ticket, id: uid(), notes: [], parts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), closedAt: null, billingStatus: 'Unbilled', laborHours: 0 }; _data.tickets.push(t); store.logActivity('Created', 'Ticket', t.id, t.title); store._notify(); return t; },
    updateTicket: (id, updates) => { const idx = _data.tickets.findIndex(t => t.id === id); if (idx >= 0) { updates.updatedAt = new Date().toISOString(); if (updates.status === 'Closed' && !_data.tickets[idx].closedAt) updates.closedAt = new Date().toISOString(); _data.tickets[idx] = { ..._data.tickets[idx], ...updates }; store.logActivity('Updated', 'Ticket', id, updates.title || _data.tickets[idx].title); store._notify(); } },
    addTicketNote: (ticketId, note) => { const idx = _data.tickets.findIndex(t => t.id === ticketId); if (idx >= 0) { _data.tickets[idx].notes.push({ id: uid(), text: note, timestamp: new Date().toISOString() }); _data.tickets[idx].updatedAt = new Date().toISOString(); store._notify(); } },
    deleteTicket: (id) => { const t = _data.tickets.find(t => t.id === id); _data.tickets = _data.tickets.filter(t => t.id !== id); store.logActivity('Deleted', 'Ticket', id, t?.title || ''); store._notify(); },

    // PARTS
    getParts: () => _data.parts,
    getPart: (id) => _data.parts.find(p => p.id === id),
    addPart: (part) => { const p = { ...part, id: uid() }; _data.parts.push(p); store.logActivity('Created', 'Part', p.id, p.name); store._notify(); return p; },
    updatePart: (id, updates) => { const idx = _data.parts.findIndex(p => p.id === id); if (idx >= 0) { _data.parts[idx] = { ..._data.parts[idx], ...updates }; store.logActivity('Updated', 'Part', id, updates.name || ''); store._notify(); } },
    deletePart: (id) => { const p = _data.parts.find(p => p.id === id); _data.parts = _data.parts.filter(p => p.id !== id); store.logActivity('Deleted', 'Part', id, p?.name || ''); store._notify(); },

    // PART ORDERS
    getPartOrders: () => _data.partOrders,
    addPartOrder: (order) => { const o = { ...order, id: uid(), orderDate: new Date().toISOString().split('T')[0], status: 'Ordered' }; _data.partOrders.push(o); store.logActivity('Created', 'Part Order', o.id, o.partName); store._notify(); return o; },
    updatePartOrder: (id, updates) => { const idx = _data.partOrders.findIndex(o => o.id === id); if (idx >= 0) { _data.partOrders[idx] = { ..._data.partOrders[idx], ...updates }; store._notify(); } },

    // INVOICES
    getInvoices: () => _data.invoices,
    getInvoice: (id) => _data.invoices.find(i => i.id === id),
    addInvoice: (invoice) => { const num = `INV-${new Date().getFullYear()}-${String(_data.invoices.length + 1).padStart(3, '0')}`; const i = { ...invoice, id: uid(), invoiceNumber: num, date: new Date().toISOString().split('T')[0], status: 'Draft', paidAmount: 0 }; _data.invoices.push(i); store.logActivity('Created', 'Invoice', i.id, i.invoiceNumber); store._notify(); return i; },
    updateInvoice: (id, updates) => { const idx = _data.invoices.findIndex(i => i.id === id); if (idx >= 0) { _data.invoices[idx] = { ..._data.invoices[idx], ...updates }; store.logActivity('Updated', 'Invoice', id, ''); store._notify(); } },
    deleteInvoice: (id) => { _data.invoices = _data.invoices.filter(i => i.id !== id); store.logActivity('Deleted', 'Invoice', id, ''); store._notify(); },

    // KNOWLEDGE BASE
    getKnowledgeBase: () => _data.knowledgeBase,
    addKBArticle: (article) => { const a = { ...article, id: uid(), createdAt: new Date().toISOString() }; _data.knowledgeBase.push(a); store._notify(); return a; },
    updateKBArticle: (id, updates) => { const idx = _data.knowledgeBase.findIndex(a => a.id === id); if (idx >= 0) { _data.knowledgeBase[idx] = { ..._data.knowledgeBase[idx], ...updates }; store._notify(); } },
    deleteKBArticle: (id) => { _data.knowledgeBase = _data.knowledgeBase.filter(a => a.id !== id); store._notify(); },

    // SETTINGS
    getSettings: () => _data.settings,
    updateSettings: (updates) => { _data.settings = { ..._data.settings, ...updates }; store._notify(); },

    // ACTIVITY LOG
    getActivityLog: () => _data.activityLog,

    // RESET
    resetData: () => { _data = getDefaultData(); linkSeedData(); store._notify(); },

    uid,
};

export default store;
