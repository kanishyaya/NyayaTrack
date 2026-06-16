import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Cases.css';

const STATUS_OPTIONS = ['', 'Active', 'Pending', 'Disposed', 'Adjourned', 'Stayed', 'Withdrawn', 'Decided'];
const TYPE_OPTIONS = ['', 'Civil', 'Criminal', 'Family', 'Labour', 'Consumer', 'Revenue', 'Writ', 'PIL', 'Other'];
const PRIORITY_OPTIONS = ['', 'High', 'Medium', 'Low'];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', caseType: '', priority: '', page: 1 });
  const navigate = useNavigate();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/cases?${params}`);
      setCases(res.data.cases);
      setTotal(res.data.total);
      setPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const getBadgeClass = (val) => {
    const map = {
      Active: 'active', Pending: 'pending', Disposed: 'disposed',
      Adjourned: 'adjourned', Stayed: 'stayed', Withdrawn: 'withdrawn', Decided: 'decided',
      High: 'high', Medium: 'medium', Low: 'low',
      Civil: 'civil', Criminal: 'criminal', Family: 'family'
    };
    return `badge badge-${map[val] || 'active'}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cases <span className="cases-count">({total})</span></h1>
        <button className="btn btn-primary" onClick={() => navigate('/cases/new')}>+ New Case</button>
      </div>

      {/* Filters */}
      <div className="card filters-bar">
        <input
          className="form-control search-input"
          placeholder="🔍  Search by case number, title, parties..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select className="form-control filter-select" value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.slice(1).map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control filter-select" value={filters.caseType}
          onChange={e => setFilters({ ...filters, caseType: e.target.value, page: 1 })}>
          <option value="">All Types</option>
          {TYPE_OPTIONS.slice(1).map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="form-control filter-select" value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.slice(1).map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Cases Table */}
      {loading ? <div className="spinner" /> : cases.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⚖️</div>
          <h3>No cases found</h3>
          <p>Add your first case to get started</p>
          <br />
          <button className="btn btn-primary" onClick={() => navigate('/cases/new')}>+ Add Case</button>
        </div>
      ) : (
        <div className="card cases-table-wrap">
          <table className="cases-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Title</th>
                <th>Type</th>
                <th>Court</th>
                <th>Next Hearing</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c._id} onClick={() => navigate(`/cases/${c._id}`)}>
                  <td className="case-num">
                    <strong>{c.caseNumber}</strong>
                    {c.cnrNumber && <div className="cnr">{c.cnrNumber}</div>}
                  </td>
                  <td className="case-title">
                    <div>{c.title}</div>
                    <div className="parties">{c.petitioner?.name} v. {c.respondent?.name}</div>
                  </td>
                  <td><span className={getBadgeClass(c.caseType)}>{c.caseType}</span></td>
                  <td className="court-name">{c.court?.name}</td>
                  <td className="hearing-date">
                    {c.nextHearingDate
                      ? new Date(c.nextHearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td><span className={getBadgeClass(c.priority)}>{c.priority}</span></td>
                  <td><span className={getBadgeClass(c.status)}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                ‹ Prev
              </button>
              <span className="pagination-info">Page {filters.page} of {pages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={filters.page >= pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
