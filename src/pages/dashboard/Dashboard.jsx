import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingUp, Activity, CheckCircle } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalDefects: 0,
    openDefects: 0,
    processDefects: [],
    machineDefects: [],
    isoDefects: [],
    lotTrend: [],
    warnings: []
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const logs = dataService.getAll('defect_logs');
    const machines = dataService.getAll('machines');
    const lines = dataService.getAll('process_lines');
    const defectCodes = dataService.getAll('defect_codes');

    // 1. Basic Stats
    const totalDefects = logs.length;
    const openDefects = logs.filter(l => !l.action).length;

    // 2. Process Defect Chart Data
    const processCount = {};
    logs.forEach(l => {
      const lineName = lines.find(line => line.line_id === l.line_id)?.line_name || l.line_id;
      processCount[lineName] = (processCount[lineName] || 0) + 1;
    });
    const processDefects = Object.keys(processCount).map(key => ({ name: key, count: processCount[key] }));

    // 3. Machine Defect Chart Data
    const machineCount = {};
    logs.forEach(l => {
      const machineName = machines.find(m => m.machine_id === l.machine_id)?.machine_name || l.machine_id;
      machineCount[machineName] = (machineCount[machineName] || 0) + 1;
    });
    const machineDefects = Object.keys(machineCount).map(key => ({ name: key, count: machineCount[key] }));

    // 4. ISO Group Chart Data
    const isoCount = {};
    logs.forEach(l => {
      const code = defectCodes.find(d => d.code === l.defect_code);
      const group = code?.iso_group || 'Unknown';
      isoCount[group] = (isoCount[group] || 0) + 1;
    });
    const isoDefects = Object.keys(isoCount).map(key => ({ name: key, value: isoCount[key] }));

    // 5. LOT Trend Data (Last 7 days or last 10 lots)
    // Group by Date
    const dateCount = {};
    logs.forEach(l => {
      const date = l.created_at.split('T')[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    const lotTrend = Object.keys(dateCount).sort().map(date => ({ date, count: dateCount[date] }));

    // 6. Warnings (Machines with > 3 defects)
    const warnings = machineDefects.filter(m => m.count > 3);

    setStats({
      totalDefects,
      openDefects,
      processDefects,
      machineDefects,
      isoDefects,
      lotTrend,
      warnings
    });
  };

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

  const Card = ({ title, value, icon, color }) => (
    <div className="glass-panel p-4 flex items-center justify-between">
      <div>
        <p className="text-secondary text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div style={{ color: color, backgroundColor: `${color}20`, padding: '0.75rem', borderRadius: '50%' }}>
        {icon}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl mb-6">{t('dashboard')}</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title={t('totalDefects')} value={stats.totalDefects} icon={<Activity size={24} />} color="#3b82f6" />
        <Card title={t('openIssues')} value={stats.openDefects} icon={<AlertTriangle size={24} />} color="#ef4444" />
        <Card title={t('resolutionRate')} value={`${stats.totalDefects ? Math.round(((stats.totalDefects - stats.openDefects) / stats.totalDefects) * 100) : 100}%`} icon={<CheckCircle size={24} />} color="#22c55e" />
        <Card title={t('activeLines')} value={stats.processDefects.length} icon={<TrendingUp size={24} />} color="#eab308" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Process Defects Bar Chart */}
        <div className="glass-panel p-4">
          <h3 className="text-lg mb-4">{t('defectsByProcess')}</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.processDefects}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ISO Group Pie Chart */}
        <div className="glass-panel p-4">
          <h3 className="text-lg mb-4">{t('defectsByISOGroup')}</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.isoDefects}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.isoDefects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                   itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Defects Bar Chart */}
        <div className="glass-panel p-4">
          <h3 className="text-lg mb-4">{t('defectsByMachine')}</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.machineDefects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="count" fill="#eab308" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="glass-panel p-4">
          <h3 className="text-lg mb-4">{t('defectTrend')}</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.lotTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Warning Cards */}
      {stats.warnings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl mb-4 text-danger flex items-center gap-2">
            <AlertTriangle /> {t('criticalEquipmentWarnings')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {stats.warnings.map((w, idx) => (
              <div key={idx} className="glass-panel p-4" style={{ borderLeft: '4px solid var(--danger)' }}>
                <h4 className="text-lg font-bold">{w.name}</h4>
                <p className="text-secondary">{t('highDefectRateDetected')}: <span className="text-danger font-bold">{w.count} {t('defects')}</span></p>
                <button className="btn-primary mt-4 text-sm w-full">{t('requestMaintenance')}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
