import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Activity, ClipboardList, Settings } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/', label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/ai-events', label: t('aiEvents'), icon: <Activity size={20} /> },
    { path: '/defect-logs', label: t('defectLogs'), icon: <ClipboardList size={20} /> },
    { path: '/master', label: t('masterData'), icon: <Database size={20} /> },
  ];

  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--accent-primary)',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'white' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
    marginBottom: '0.5rem',
    transition: 'all 0.2s',
    fontWeight: isActive ? '500' : 'normal',
  });

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <span>Cloud QM</span>
      </div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={linkStyle(location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
