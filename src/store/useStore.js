import { useState, useEffect, useCallback } from 'react';
import store from './dataStore';

export function useStore() {
    const [data, setData] = useState(store.getData());

    useEffect(() => {
        const unsub = store.subscribe(newData => setData({ ...newData }));
        return unsub;
    }, []);

    return { data, store };
}

export function useTickets() {
    const { data, store: s } = useStore();
    return {
        tickets: data.tickets,
        customers: data.customers,
        technicians: data.technicians,
        getTicket: s.getTicket,
        addTicket: s.addTicket,
        updateTicket: s.updateTicket,
        addTicketNote: s.addTicketNote,
        deleteTicket: s.deleteTicket,
        getCustomer: s.getCustomer,
        getTechnician: s.getTechnician,
    };
}

export function useCustomers() {
    const { data, store: s } = useStore();
    return {
        customers: data.customers,
        getCustomer: s.getCustomer,
        addCustomer: s.addCustomer,
        updateCustomer: s.updateCustomer,
        deleteCustomer: s.deleteCustomer,
    };
}

export function useTechnicians() {
    const { data, store: s } = useStore();
    return {
        technicians: data.technicians,
        getTechnician: s.getTechnician,
        addTechnician: s.addTechnician,
        updateTechnician: s.updateTechnician,
        deleteTechnician: s.deleteTechnician,
    };
}

export function useParts() {
    const { data, store: s } = useStore();
    return {
        parts: data.parts,
        partOrders: data.partOrders,
        getPart: s.getPart,
        addPart: s.addPart,
        updatePart: s.updatePart,
        deletePart: s.deletePart,
        addPartOrder: s.addPartOrder,
        updatePartOrder: s.updatePartOrder,
    };
}

export function useInvoices() {
    const { data, store: s } = useStore();
    return {
        invoices: data.invoices,
        customers: data.customers,
        getInvoice: s.getInvoice,
        addInvoice: s.addInvoice,
        updateInvoice: s.updateInvoice,
        deleteInvoice: s.deleteInvoice,
        getCustomer: s.getCustomer,
    };
}

export function useKnowledgeBase() {
    const { data, store: s } = useStore();
    return {
        articles: data.knowledgeBase,
        addArticle: s.addKBArticle,
        updateArticle: s.updateKBArticle,
        deleteArticle: s.deleteKBArticle,
    };
}

export function useSettings() {
    const { data, store: s } = useStore();
    return {
        settings: data.settings,
        updateSettings: s.updateSettings,
    };
}

export function useDashboard() {
    const { data } = useStore();
    const tickets = data.tickets;
    const technicians = data.technicians;
    const invoices = data.invoices;
    const parts = data.parts;

    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
    const scheduledTickets = tickets.filter(t => t.status === 'Scheduled').length;
    const closedTickets = tickets.filter(t => t.status === 'Closed').length;
    const criticalTickets = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;
    const availableTechs = technicians.filter(t => t.status === 'Available').length;
    const onJobTechs = technicians.filter(t => t.status === 'On Job').length;

    const totalRevenue = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const outstandingRevenue = invoices.reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);
    const lowStockParts = parts.filter(p => p.quantity <= p.reorderLevel).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTickets = tickets.filter(t => t.scheduledDate === todayStr);

    return {
        openTickets, inProgressTickets, scheduledTickets, closedTickets,
        criticalTickets, availableTechs, onJobTechs,
        totalRevenue, outstandingRevenue, lowStockParts,
        todayTickets, totalTickets: tickets.length,
        totalTechnicians: technicians.length,
        activityLog: data.activityLog,
        recentTickets: tickets.slice(-5).reverse(),
    };
}
