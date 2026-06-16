import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Calendar.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const partyLine = (c) => `${c.petitioner?.name || 'Petitioner'} vs ${c.respondent?.name || 'Respondent'}`;

export default function Calendar() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Sourced from Case.nextHearingDate — the same field Dashboard and the
    // Cases list use — so the calendar always stays in sync with "Next Hearing"
    // shown everywhere else in the app.
    api.get('/cases/calendar')
      .then(res => setCases(res.data.cases))
      .catch(() => toast.error('Failed to load calendar'))
      .finally(() => setLoading(false));
  }, []);

  const getCasesForDate = (date) => {
    const d = date.toDateString();
    return cases.filter(c => c.nextHearingDate && new Date(c.nextHearingDate).toDateString() === d);
  };

  const upcoming = cases
    .filter(c => new Date(c.nextHearingDate) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.nextHearingDate) - new Date(b.nextHearingDate))
    .slice(0, 20);

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1));

  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(current.getFullYear(), current.getMonth(), d));

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Hearing Calendar</h1>
      </div>
      <div className="calendar-layout">
        {/* Calendar Grid */}
        <div className="card calendar-card">
          <div className="cal-header">
            <button className="cal-nav" onClick={prevMonth}>‹</button>
            <h2 className="cal-month">{MONTHS[current.getMonth()]} {current.getFullYear()}</h2>
            <button className="cal-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-grid">
            {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} className="cal-cell empty" />;
              const dayCases = getCasesForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div key={i} className={`cal-cell ${isToday ? 'today' : ''} ${dayCases.length ? 'has-hearings' : ''}`}>
                  <span className="cal-date">{date.getDate()}</span>
                  {dayCases.map((c) => (
                    <div
                      key={c._id}
                      className={`cal-event priority-${c.priority?.toLowerCase()}`}
                      title={`${c.caseNumber} — ${partyLine(c)} — ${c.court?.name || ''} (${c.status})`}
                      onClick={() => navigate(`/cases/${c._id}`)}
                    >
                      {partyLine(c)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="card upcoming-card">
          <h3 className="section-title">Upcoming Hearings</h3>
          {upcoming.length === 0 ? (
            <div className="empty-sm">No scheduled hearings</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.map(c => (
                <div key={c._id} className="upcoming-hearing-card" onClick={() => navigate(`/cases/${c._id}`)}>
                  <div className="uh-date">
                    <div className="uh-day">{new Date(c.nextHearingDate).getDate()}</div>
                    <div className="uh-month">{MONTHS[new Date(c.nextHearingDate).getMonth()].slice(0,3)}</div>
                  </div>
                  <div className="uh-info">
                    <div className="uh-title">{c.title}</div>
                    <div className="uh-parties">{partyLine(c)}</div>
                    <div className="uh-court">{c.court?.name}</div>
                    <div className="uh-num">{c.caseNumber}</div>
                  </div>
                  <span className={`badge badge-${c.priority?.toLowerCase()}`}>{c.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
