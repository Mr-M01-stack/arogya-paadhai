import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiChevronDown, FiMenu, FiX, FiAlertTriangle, FiMessageSquare, FiFileText, FiMapPin, FiShoppingCart, FiPackage, FiCheck } from 'react-icons/fi';
import Sidebar from './Sidebar';

import { API } from '../api';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/daily-update': 'Daily Update',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

const iconMap = {
  'alert-triangle': FiAlertTriangle,
  'message-square': FiMessageSquare,
  'file-text': FiFileText,
  'map-pin': FiMapPin,
  'shopping-cart': FiShoppingCart,
  'package': FiPackage,
};

const severityStyles = {
  danger: 'notif-danger',
  warning: 'notif-warning',
  info: 'notif-info',
  success: 'notif-info',
};

function getNotifId(n) {
  return `${n.type}_${n.message}_${n.time || ''}`;
}

export default function AdminLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notifReadIds') || '[]')); }
    catch { return new Set(); }
  });
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(getNotifId(n))).length;

  const markAllRead = useCallback(() => {
    const ids = new Set(readIds);
    notifications.forEach(n => ids.add(getNotifId(n)));
    setReadIds(ids);
    localStorage.setItem('notifReadIds', JSON.stringify([...ids]));
  }, [notifications, readIds]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API}/notifications`)
      .then(r => r.json())
      .then(data => setNotifications(data.notifications || []))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch(`${API}/notifications`)
        .then(r => r.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <div className="admin-layout">
      <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} />
      <Sidebar collapsed={true} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <button className="btn btn-link text-white" onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} />
      </div>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="btn btn-link hamburger-btn d-lg-none" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={22} />
            </button>
            <h5 className="topbar-title mb-0">{title}</h5>
          </div>
          <div className="topbar-right">
            <div className="notification-wrapper" ref={notifRef}>
              <button className="notification-btn position-relative me-3" onClick={() => setNotifOpen(!notifOpen)}>
                <FiBell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <strong>Notifications</strong>
                    <div className="d-flex align-items-center gap-2">
                      {unreadCount > 0 && (
                        <button className="btn btn-sm btn-outline-success rounded-pill d-inline-flex align-items-center gap-1" onClick={markAllRead} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          <FiCheck size={11} />Mark all read
                        </button>
                      )}
                      <span className="notif-count">{notifications.length} alerts</span>
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">All clear — no alerts</div>
                    ) : (
                      notifications.map((n, i) => {
                        const Icon = iconMap[n.icon] || FiBell;
                        const isRead = readIds.has(getNotifId(n));
                        return (
                          <div key={i} className={`notif-item ${severityStyles[n.severity]} ${isRead ? 'notif-read' : ''}`}
                            onClick={() => {
                              const ids = new Set(readIds);
                              ids.add(getNotifId(n));
                              setReadIds(ids);
                              localStorage.setItem('notifReadIds', JSON.stringify([...ids]));
                              navigate(n.link);
                              setNotifOpen(false);
                            }}>
                            <Icon className="notif-item-icon" />
                            <div className="notif-item-text">
                              <p className="mb-0">{n.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="profile-dropdown">
              <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="profile-avatar">{user?.name?.charAt(0) || 'A'}</div>
                <span className="profile-name d-none d-sm-inline">{user?.name || 'Admin'}</span>
                <FiChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <strong>{user?.name}</strong>
                    <small className="text-muted d-block">{user?.email}</small>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { logout(); setProfileOpen(false); }}>
                    <FiLogOut className="me-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function FiLogOut(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
