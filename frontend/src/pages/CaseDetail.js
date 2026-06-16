import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './CaseDetail.css';

const STATUS_OPTIONS = ['Active','Pending','Disposed','Adjourned','Stayed','Withdrawn','Decided'];
const HEARING_PURPOSES = ['Arguments','Evidence','Judgment','Interim Order','Framing of Issues','Settlement','Preliminary Hearing','Other'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [note, setNote] = useState('');
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [editingHearingId, setEditingHearingId] = useState(null);
  const emptyHearingForm = {
    hearingDate: '', hearingTime: '', purpose: 'Arguments',
    judge: '', courtRoom: '', status: 'Scheduled', outcome: '', adjournmentReason: '', nextDate: ''
  };
  const [hearingForm, setHearingForm] = useState(emptyHearingForm);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    api.get(`/cases/${id}`)
      .then(res => {
        setCaseData(res.data.case);
        setHearings(res.data.hearings);
        setEditStatus(res.data.case.status);
      })
      .catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  }, [id]);

  const getBadge = (val) => {
    const map = {
      Active: 'active', Pending: 'pending', Disposed: 'disposed', Adjourned: 'adjourned',
      Stayed: 'stayed', Withdrawn: 'withdrawn', Decided: 'decided',
      High: 'high', Medium: 'medium', Low: 'low',
    };
    return `badge badge-${map[val] || 'active'}`;
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const res = await api.post(`/cases/${id}/notes`, { content: note });
      setCaseData(res.data.case);
      setNote('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const saveHearing = async (e) => {
    e.preventDefault();
    try {
      if (editingHearingId) {
        const res = await api.put(`/hearings/${editingHearingId}`, hearingForm);
        setHearings(h => h.map(item => item._id === editingHearingId ? res.data.hearing : item));
        toast.success('Hearing updated');
      } else {
        const res = await api.post('/hearings', { ...hearingForm, case: id });
        setHearings(h => [res.data.hearing, ...h]);
        toast.success('Hearing added');
      }
      setShowHearingForm(false);
      setEditingHearingId(null);
      setHearingForm(emptyHearingForm);
      // Refresh the case so any updated next/last hearing date shows immediately.
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data.case);
    } catch {
      toast.error(editingHearingId ? 'Failed to update hearing' : 'Failed to add hearing');
    }
  };

  const startEditHearing = (h) => {
    setEditingHearingId(h._id);
    setHearingForm({
      hearingDate: h.hearingDate ? h.hearingDate.slice(0, 10) : '',
      hearingTime: h.hearingTime || '',
      purpose: h.purpose || 'Arguments',
      judge: h.judge || '',
      courtRoom: h.courtRoom || '',
      status: h.status || 'Scheduled',
      outcome: h.outcome || '',
      adjournmentReason: h.adjournmentReason || '',
      nextDate: h.nextDate ? h.nextDate.slice(0, 10) : ''
    });
    setShowHearingForm(true);
  };

  const cancelHearingForm = () => {
    setShowHearingForm(false);
    setEditingHearingId(null);
    setHearingForm(emptyHearingForm);
  };

  const deleteHearing = async (hearingId) => {
    if (!window.confirm('Delete this hearing record?')) return;
    try {
      await api.delete(`/hearings/${hearingId}`);
      setHearings(h => h.filter(item => item._id !== hearingId));
      toast.success('Hearing deleted');
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data.case);
    } catch {
      toast.error('Failed to delete hearing');
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await api.put(`/cases/${id}`, { status: newStatus });
      setCaseData(res.data.case);
      setEditStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const deleteCase = async () => {
    if (!window.confirm('Delete this case and all its hearings?')) return;
    try {
      await api.delete(`/cases/${id}`);
      toast.success('Case deleted');
      navigate('/cases');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="spinner" />;
  if (!caseData) return <div className="empty-state"><h3>Case not found</h3></div>;

  const c = caseData;

  return (
    <div className="case-detail">
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate('/cases')}>← All Cases</button>
          <h1 className="page-title">{c.title}</h1>
          <div className="case-meta">
            <span className={getBadge(c.status)}>{c.status}</span>
            <span className={getBadge(c.priority)}>{c.priority}</span>
            <span className="badge">{c.caseType}</span>
            <span className="case-number">{c.caseNumber}</span>
          </div>
        </div>
        <div className="header-actions">
          <select className="form-control" value={editStatus} onChange={e => updateStatus(e.target.value)} style={{ width: 150 }}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" onClick={deleteCase}>Delete</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['details','hearings','notes'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'details' ? '📋 Details' : t === 'hearings' ? `📅 Hearings (${hearings.length})` : `📝 Notes (${c.notes?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === 'details' && (
        <div className="tab-content">
          <div className="detail-grid">
            <div className="card">
              <h3 className="section-title-sm">🏛 Court Information</h3>
              <div className="detail-row"><span>Court</span><strong>{c.court?.name}</strong></div>
              <div className="detail-row"><span>Type</span><strong>{c.court?.type}</strong></div>
              <div className="detail-row"><span>State</span><strong>{c.court?.state}</strong></div>
              {c.court?.district && <div className="detail-row"><span>District</span><strong>{c.court?.district}</strong></div>}
              {c.court?.bench && <div className="detail-row"><span>Bench</span><strong>{c.court?.bench}</strong></div>}
            </div>
            <div className="card">
              <h3 className="section-title-sm">📅 Important Dates</h3>
              <div className="detail-row"><span>Filing Date</span><strong>{new Date(c.filingDate).toLocaleDateString('en-IN')}</strong></div>
              {c.nextHearingDate && <div className="detail-row"><span>Next Hearing</span><strong style={{ color: 'var(--accent)' }}>{new Date(c.nextHearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>}
              {c.cnrNumber && <div className="detail-row"><span>CNR Number</span><strong>{c.cnrNumber}</strong></div>}
            </div>
            <div className="card">
              <h3 className="section-title-sm">👥 Parties</h3>
              <div className="detail-row"><span>Petitioner</span><strong>{c.petitioner?.name}</strong></div>
              {c.petitioner?.contact && <div className="detail-row"><span>Contact</span><strong>{c.petitioner?.contact}</strong></div>}
              <hr style={{ margin: '10px 0', borderColor: 'var(--border)' }} />
              <div className="detail-row"><span>Respondent</span><strong>{c.respondent?.name}</strong></div>
              {c.respondent?.contact && <div className="detail-row"><span>Contact</span><strong>{c.respondent?.contact}</strong></div>}
            </div>
            {c.client?.name && (
              <div className="card">
                <h3 className="section-title-sm">🤝 Client</h3>
                <div className="detail-row"><span>Name</span><strong>{c.client?.name}</strong></div>
                {c.client?.contact && <div className="detail-row"><span>Phone</span><strong>{c.client?.contact}</strong></div>}
                {c.client?.email && <div className="detail-row"><span>Email</span><strong>{c.client?.email}</strong></div>}
              </div>
            )}
          </div>
          {c.description && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title-sm">📄 Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{c.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Hearings Tab */}
      {tab === 'hearings' && (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              className="btn btn-primary"
              onClick={() => (showHearingForm ? cancelHearingForm() : setShowHearingForm(true))}
            >
              {showHearingForm ? '✕ Cancel' : '+ Add Hearing'}
            </button>
          </div>
          {showHearingForm && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className="section-title-sm">{editingHearingId ? 'Edit Hearing Record' : 'Add Hearing Record'}</h3>
              <form onSubmit={saveHearing}>
                <div className="grid-3">
                  <div className="form-group">
                    <label>Hearing Date *</label>
                    <input type="date" className="form-control" required
                      value={hearingForm.hearingDate} onChange={e => setHearingForm({ ...hearingForm, hearingDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" className="form-control"
                      value={hearingForm.hearingTime} onChange={e => setHearingForm({ ...hearingForm, hearingTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Purpose</label>
                    <select className="form-control" value={hearingForm.purpose} onChange={e => setHearingForm({ ...hearingForm, purpose: e.target.value })}>
                      {HEARING_PURPOSES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Judge</label>
                    <input className="form-control" placeholder="Hon'ble Justice..."
                      value={hearingForm.judge} onChange={e => setHearingForm({ ...hearingForm, judge: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={hearingForm.status} onChange={e => setHearingForm({ ...hearingForm, status: e.target.value })}>
                      {['Scheduled','Completed','Adjourned','Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Next Date</label>
                    <input type="date" className="form-control"
                      value={hearingForm.nextDate} onChange={e => setHearingForm({ ...hearingForm, nextDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Outcome / Remarks</label>
                  <textarea className="form-control" rows={2} placeholder="What happened in this hearing..."
                    value={hearingForm.outcome} onChange={e => setHearingForm({ ...hearingForm, outcome: e.target.value })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">{editingHearingId ? 'Update Hearing' : 'Save Hearing'}</button>
                </div>
              </form>
            </div>
          )}
          {hearings.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><h3>No hearings yet</h3><p>Add the first hearing record</p></div>
          ) : (
            <div className="hearings-timeline">
              {hearings.map(h => (
                <div key={h._id} className="timeline-item">
                  <div className="timeline-date">
                    <span>{new Date(h.hearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="timeline-year">{new Date(h.hearingDate).getFullYear()}</span>
                  </div>
                  <div className="timeline-dot" />
                  <div className="timeline-content card">
                    <div className="timeline-header">
                      <strong>{h.purpose}</strong>
                      <div className="timeline-header-right">
                        <span className={`badge badge-${h.status?.toLowerCase()}`}>{h.status}</span>
                        <button className="icon-btn" title="Edit hearing" onClick={() => startEditHearing(h)}>✎</button>
                        <button className="icon-btn icon-btn-danger" title="Delete hearing" onClick={() => deleteHearing(h._id)}>🗑</button>
                      </div>
                    </div>
                    {h.judge && <div className="timeline-detail">👨‍⚖️ {h.judge}</div>}
                    {h.outcome && <div className="timeline-outcome">{h.outcome}</div>}
                    {h.nextDate && <div className="timeline-next">Next: {new Date(h.nextDate).toLocaleDateString('en-IN')}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {tab === 'notes' && (
        <div className="tab-content">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>Add Note</label>
              <textarea className="form-control" rows={3} placeholder="Type your notes here..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={addNote}>+ Add Note</button>
            </div>
          </div>
          {c.notes?.length === 0 ? (
            <div className="empty-state"><div className="icon">📝</div><h3>No notes yet</h3></div>
          ) : (
            <div className="notes-list">
              {[...c.notes].reverse().map((n, i) => (
                <div key={i} className="card note-card">
                  <p>{n.content}</p>
                  <div className="note-meta">{new Date(n.addedAt).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
