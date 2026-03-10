import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../store/useStore';
import PageHeader from '../components/PageHeader';

export default function Scheduling({ onMenuClick, toast }) {
    const navigate = useNavigate();
    const { tickets, technicians, getTechnician, getCustomer } = useTickets();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        // Fill previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, isOtherMonth: true, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isOtherMonth: false, date: new Date(year, month, i) });
        }
        // Fill next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isOtherMonth: true, date: new Date(year, month + 1, i) });
        }
        return days;
    }, [year, month, daysInMonth, firstDayOfMonth]);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const getTicketsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tickets.filter(t => t.scheduledDate === dateStr);
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Today's & upcoming schedule
    const upcomingTickets = tickets
        .filter(t => t.scheduledDate && new Date(t.scheduledDate) >= new Date(todayStr) && t.status !== 'Closed')
        .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime))
        .slice(0, 10);

    return (
        <>
            <PageHeader title="Scheduling" subtitle={monthName} onMenuClick={onMenuClick}>
                <button className="btn btn-secondary btn-sm" onClick={prevMonth}>←</button>
                <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
                <button className="btn btn-secondary btn-sm" onClick={nextMonth}>→</button>
            </PageHeader>

            <div className="page-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                    {/* Calendar */}
                    <div>
                        <div className="calendar-grid">
                            {weekDays.map(d => (
                                <div key={d} className="calendar-header-cell">{d}</div>
                            ))}
                            {calendarDays.map((d, i) => {
                                const dateStr = d.date.toISOString().split('T')[0];
                                const isToday = dateStr === todayStr;
                                const dayTickets = getTicketsForDate(d.date);
                                return (
                                    <div key={i} className={`calendar-cell ${d.isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                                        <div className="calendar-day-number">{d.day}</div>
                                        {dayTickets.slice(0, 3).map(t => (
                                            <div key={t.id} className={`calendar-event ${t.priority.toLowerCase()}`} onClick={() => navigate(`/tickets/${t.id}`)}>
                                                {t.scheduledTime && <span>{t.scheduledTime} </span>}{t.title.substring(0, 20)}
                                            </div>
                                        ))}
                                        {dayTickets.length > 3 && (
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>+{dayTickets.length - 3} more</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">📅 Upcoming</h3>
                                <span className="text-muted text-sm">{upcomingTickets.length} calls</span>
                            </div>
                            {upcomingTickets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>Nothing scheduled</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {upcomingTickets.map(t => {
                                        const tech = getTechnician(t.assignedTo);
                                        return (
                                            <div key={t.id} style={{
                                                padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                                                border: '1px solid var(--border-secondary)', cursor: 'pointer',
                                                borderLeft: `3px solid ${t.priority === 'Critical' ? 'var(--accent-danger)' : t.priority === 'High' ? 'var(--accent-warning)' : t.priority === 'Medium' ? 'var(--accent-info)' : 'var(--accent-success)'}`
                                            }} onClick={() => navigate(`/tickets/${t.id}`)}>
                                                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                                                    <span>📅 {t.scheduledDate}</span>
                                                    {t.scheduledTime && <span>🕐 {t.scheduledTime}</span>}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                                    {tech ? `👷 ${tech.name}` : '⚠️ Unassigned'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
