import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'lawyer',
    phone: '', barCouncilId: '', designation: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-brand">
          <div className="auth-logo">⚖</div>
          <h1>NyayaTrack</h1>
          <p>न्याय ट्रैक</p>
          <blockquote>"Manage every case, every hearing — in one place"</blockquote>
        </div>
      </div>
      <div className="auth-form-panel" style={{ width: 480 }}>
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start tracking your cases today</p>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" placeholder="Adv. Ramesh Kumar" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="lawyer">Lawyer</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" className="form-control" placeholder="lawyer@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className="form-control" placeholder="Min 6 characters" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bar Council ID</label>
                <input className="form-control" placeholder="MH/12345/2015"
                  value={form.barCouncilId} onChange={e => setForm({ ...form, barCouncilId: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input className="form-control" placeholder="Senior Advocate, High Court of Bombay"
                value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
