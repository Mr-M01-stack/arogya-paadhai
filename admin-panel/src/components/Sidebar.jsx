import { NavLink } from 'react-router-dom';
import { FiGrid, FiPackage, FiFolder, FiCalendar, FiBarChart2, FiSettings, FiLogOut, FiMapPin, FiDollarSign, FiBox, FiTool, FiTrendingUp, FiUsers, FiMessageSquare, FiFileText, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/stall', label: 'Stall Management', icon: FiMapPin },
  { to: '/sales', label: 'Sales Entry', icon: FiDollarSign },
  { to: '/stock', label: 'Stock Management', icon: FiBox },
  { to: '/production', label: 'Production', icon: FiTool },
  { to: '/investment', label: 'Daily Investment', icon: FiTrendingUp },
  { to: '/customers', label: 'Customer Analytics', icon: FiUsers },
  { to: '/enquiries', label: 'Enquiries', icon: FiMessageSquare },
  { to: '/products', label: 'Products', icon: FiPackage },
  { to: '/categories', label: 'Categories', icon: FiFolder },
  { to: '/daily-update', label: 'Daily Update', icon: FiCalendar },
  { to: '/reports', label: 'Reports', icon: FiFileText },
  { to: '/export', label: 'Export Data', icon: FiDownload },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <>
      {collapsed && <div className="sidebar-overlay" onClick={onToggle} />}
      <nav className={`admin-sidebar ${collapsed ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🌿</span>
          {!collapsed && <span className="brand-text">Arogya Paadhai</span>}
        </div>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onToggle}
              >
                <item.icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="nav-link logout-btn" onClick={() => { logout(); onToggle(); }}>
            <FiLogOut className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
