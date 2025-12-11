import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { currentUser, setCurrentUser, managers } = useUser();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/' || pathname === '/ERP/') return t('dashboard');
    if (pathname.includes('/ai-events')) return 'AI Inspection Events';
    if (pathname.includes('/defect-logs')) return 'Defect Logs';
    if (pathname.includes('/master')) return 'Master Data';
    return t('overview');
  };
  
  const headerStyle = {
    height: '64px',
    backgroundColor: 'white',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid var(--border-color)',
  };

  const iconButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <header style={headerStyle}>
      <h2 className="text-xl font-bold">{getPageTitle(location.pathname)}</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button style={iconButtonStyle} onClick={toggleLanguage} title="Switch Language">
          {language === 'en' ? 'KO' : 'EN'}
        </button>
        <button style={iconButtonStyle}>
          <Bell size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              outline: 'none'
            }}
          >
            {managers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} className="text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
