import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const TYPE_COLORS = ['#1a237e','#c6922a','#2e7d32','#c62828','#6a1b9a','#00695c','#e65100','#1565c0'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cases/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const today = new Date();
  const greet = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greet}, {user?.name?.split(' ')[0]} 🙏</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cases/new')}>+ New Case</button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: 'Total Cases', value: stats?.total, icon: '📋', color: '#1a237e' },
          { label: 'Active', value: stats?.active, icon: '🟢', color: '#2e7d32' },
          { label: 'Pending', value: stats?.pending, icon: '🟡', color: '#f57f17' },
          { label: 'High Priority', value: stats?.highPriority, icon: '🔴', color: '#c62828' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value ?? 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Today's Hearings */}
        <div className="card">
          <h3 className="section-title">📅 Today's Hearings</h3>
          {stats?.todayHearings?.length === 0 ? (
            <div className="empty-sm">No hearings scheduled today</div>
          ) : (
            <div className="hearing-list">
              {stats?.todayHearings?.map(c => (
                <div key={c._id} className="hearing-item" onClick={() => navigate(`/cases/${c._id}`)}>
                  <div className="hearing-court">{c.court?.name}</div>
                  <div className="hearing-title">{c.title}</div>
                  <div className="hearing-num">{c.caseNumber}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Hearings */}
        <div className="card">
          <h3 className="section-title">🗓 Upcoming This Week</h3>
          {stats?.upcomingHearings?.length === 0 ? (
            <div className="empty-sm">No upcoming hearings</div>
          ) : (
            <div className="upcoming-list">
              {stats?.upcomingHearings?.map(c => (
                <div key={c._id} className="upcoming-item" onClick={() => navigate(`/cases/${c._id}`)}>
                  <div className="upcoming-date">
                    {new Date(c.nextHearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="upcoming-info">
                    <div className="upcoming-title">{c.title}</div>
                    <div className="upcoming-court">{c.court?.name}</div>
                  </div>
                  <span className={`badge badge-${c.priority?.toLowerCase()}`}>{c.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Case Type Chart */}
        <div className="card">
          <h3 className="section-title">📊 Cases by Type</h3>
          {stats?.byType?.length === 0 ? (
            <div className="empty-sm">No cases yet</div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats?.byType?.map(b => ({ name: b._id, value: b.count }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {stats?.byType?.map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {stats?.byType?.map((b, i) => (
                  <div key={b._id} className="legend-item">
                    <span className="legend-dot" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span>{b._id}</span>
                    <strong>{b.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
