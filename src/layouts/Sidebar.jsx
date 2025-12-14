import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Activity, ClipboardList, Settings, BarChart2, GitMerge, MessageSquare } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { currentUser } = useUser();

  const menuItems = [
    { path: '/', label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/analytics/process', label: '공정 품질 분석', icon: <BarChart2 size={20} /> },
    { path: '/qm/traceability', label: '추적성 관리', icon: <GitMerge size={20} /> },
    { path: '/qm/claims', label: '클레임 관리', icon: <MessageSquare size={20} /> },
    { path: '/ai-events', label: t('aiEvents'), icon: <Activity size={20} /> },
    { path: '/defect-logs', label: t('defectLogs'), icon: <ClipboardList size={20} /> },
    ...(currentUser === 'Project Manager' ? [{ path: '/master', label: t('masterData'), icon: <Database size={20} /> }] : []),
  ];

  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'var(--accent-primary)',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    color: 'white',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '3rem',
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
    color: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
    backgroundColor: isActive ? 'white' : 'transparent',
    marginBottom: '0.5rem',
    transition: 'all 0.2s',
    fontWeight: isActive ? '600' : 'normal',
  });

  return (
    <aside style={sidebarStyle}>
      <div style={{ ...logoStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
        <span style={{ fontSize: '1rem', opacity: 0.9 }}>현대모비스 품질관리</span>
        <span>Cloud ERP</span>
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
