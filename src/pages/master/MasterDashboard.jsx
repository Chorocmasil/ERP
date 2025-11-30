import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Settings, Activity, AlertTriangle, FileText, Database } from 'lucide-react';

const MasterDashboard = () => {
  const cards = [
    { title: 'Items', icon: <Package size={24} />, path: '/master/items', desc: 'Manage Products & Materials' },
    { title: 'BOM', icon: <Layers size={24} />, path: '/master/boms', desc: 'Bill of Materials' },
    { title: 'Process Lines', icon: <Activity size={24} />, path: '/master/process-lines', desc: 'Production Lines' },
    { title: 'Machines', icon: <Settings size={24} />, path: '/master/machines', desc: 'Equipment Management' },
    { title: 'Defect Codes', icon: <AlertTriangle size={24} />, path: '/master/defect-codes', desc: 'ISO Defect Standards' },
    { title: 'Cause Codes', icon: <FileText size={24} />, path: '/master/cause-codes', desc: 'Root Cause Analysis' },
    { title: 'LOTs', icon: <Database size={24} />, path: '/master/lots', desc: 'Production Batches' },
  ];

  return (
    <div>
      <h1 className="text-2xl mb-6">Master Data Management</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
            <div style={{ color: 'var(--accent-primary)' }}>{card.icon}</div>
            <div>
              <h3 className="text-lg" style={{ marginBottom: '0.5rem' }}>{card.title}</h3>
              <p className="text-sm text-secondary">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MasterDashboard;
