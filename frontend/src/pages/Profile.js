import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    barCouncilId: user?.barCouncilId || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/me', form);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--primary)' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
            <span className="badge badge-active" style={{ marginTop: 6 }}>{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" placeholder="+91..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bar Council ID</label>
              <input className="form-control" placeholder="MH/12345/2015" value={form.barCouncilId} onChange={e => setForm({ ...form, barCouncilId: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input className="form-control" placeholder="Senior Advocate..." value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
