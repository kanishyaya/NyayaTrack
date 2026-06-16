import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const navItems = [
  { to: '/dashboard', icon: '⚖️', label: 'Dashboard' },
  { to: '/cases', icon: '📋', label: 'Cases' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚖</span>
            <div>
              <div className="logo-name">NyayaTrack</div>
              <div className="logo-sub">न्याय ट्रैक</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⬤ Logout</button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="main-content">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-right">
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/cases/new')}>
              + New Case
            </button>
          </div>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
