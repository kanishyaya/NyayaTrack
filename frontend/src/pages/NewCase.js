import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './NewCase.css';

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Labour', 'Consumer', 'Revenue', 'Writ', 'PIL', 'Other'];
const COURT_TYPES = ['Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Civil Court', 'Consumer Forum', 'Tribunal', 'Other'];
const INDIA_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    caseNumber: '', cnrNumber: '', title: '', description: '', caseType: 'Civil',
    status: 'Active', priority: 'Medium', filingDate: '', nextHearingDate: '',
    court: { name: '', type: 'District Court', state: 'Maharashtra', district: '', bench: '' },
    petitioner: { name: '', address: '', contact: '' },
    respondent: { name: '', address: '', contact: '' },
    client: { name: '', contact: '', email: '' },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key, val) => setForm(f => ({ ...f, [parent]: { ...f[parent], [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/cases', form);
      toast.success('Case added successfully!');
      navigate(`/cases/${res.data.case._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-case">
      <div className="page-header">
        <h1 className="page-title">New Case</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/cases')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Case Identification */}
        <div className="card form-section">
          <h3 className="form-section-title">📋 Case Identification</h3>
          <div className="grid-3">
            <div className="form-group">
              <label>Case Number *</label>
              <input className="form-control" placeholder="e.g., CS/123/2024" required
                value={form.caseNumber} onChange={e => set('caseNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label>CNR Number</label>
              <input className="form-control" placeholder="MHFC01-123456-2024"
                value={form.cnrNumber} onChange={e => set('cnrNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Filing Date *</label>
              <input type="date" className="form-control" required
                value={form.filingDate} onChange={e => set('filingDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Case Title *</label>
            <input className="form-control" placeholder="e.g., Ramesh Kumar vs State of Maharashtra"
              required value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} placeholder="Brief description of the case..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label>Case Type *</label>
              <select className="form-control" value={form.caseType} onChange={e => set('caseType', e.target.value)}>
                {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Active','Pending','Adjourned','Stayed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Court Details */}
        <div className="card form-section">
          <h3 className="form-section-title">🏛 Court Details</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Court Name *</label>
              <input className="form-control" placeholder="e.g., Bombay High Court" required
                value={form.court.name} onChange={e => setNested('court', 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Court Type</label>
              <select className="form-control" value={form.court.type} onChange={e => setNested('court', 'type', e.target.value)}>
                {COURT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select className="form-control" value={form.court.state} onChange={e => setNested('court', 'state', e.target.value)}>
                {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>District</label>
              <input className="form-control" placeholder="e.g., Mumbai"
                value={form.court.district} onChange={e => setNested('court', 'district', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bench / Court Room</label>
              <input className="form-control" placeholder="e.g., Court No. 3"
                value={form.court.bench} onChange={e => setNested('court', 'bench', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Next Hearing Date</label>
              <input type="date" className="form-control"
                value={form.nextHearingDate} onChange={e => set('nextHearingDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card form-section">
            <h3 className="form-section-title">👤 Petitioner / Plaintiff</h3>
            <div className="form-group">
              <label>Name *</label>
              <input className="form-control" placeholder="Full name" required
                value={form.petitioner.name} onChange={e => setNested('petitioner', 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control" rows={2} placeholder="Address"
                value={form.petitioner.address} onChange={e => setNested('petitioner', 'address', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input className="form-control" placeholder="+91..."
                value={form.petitioner.contact} onChange={e => setNested('petitioner', 'contact', e.target.value)} />
            </div>
          </div>
          <div className="card form-section">
            <h3 className="form-section-title">👤 Respondent / Defendant</h3>
            <div className="form-group">
              <label>Name *</label>
              <input className="form-control" placeholder="Full name" required
                value={form.respondent.name} onChange={e => setNested('respondent', 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control" rows={2} placeholder="Address"
                value={form.respondent.address} onChange={e => setNested('respondent', 'address', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input className="form-control" placeholder="+91..."
                value={form.respondent.contact} onChange={e => setNested('respondent', 'contact', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="card form-section">
          <h3 className="form-section-title">🤝 Client Details</h3>
          <div className="grid-3">
            <div className="form-group">
              <label>Client Name</label>
              <input className="form-control" placeholder="Who hired you"
                value={form.client.name} onChange={e => setNested('client', 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Client Contact</label>
              <input className="form-control" placeholder="+91..."
                value={form.client.contact} onChange={e => setNested('client', 'contact', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Client Email</label>
              <input type="email" className="form-control" placeholder="client@email.com"
                value={form.client.email} onChange={e => setNested('client', 'email', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/cases')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '✓ Save Case'}
          </button>
        </div>
      </form>
    </div>
  );
}
