import React from 'react';
import { Bell, User } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const headerStyle = {
    height: '64px',
    backgroundColor: 'var(--bg-primary)', // Transparent/same as body for glass effect or distinct
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
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
      <h2 className="text-xl">{t('overview')}</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button style={iconButtonStyle} onClick={toggleLanguage} title="Switch Language">
          {language === 'en' ? 'KO' : 'EN'}
        </button>
        <button style={iconButtonStyle}>
          <Bell size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ ...iconButtonStyle, backgroundColor: 'var(--bg-tertiary)' }}>
            <User size={20} />
          </div>
          <span className="text-sm">{t('qmManager')}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
