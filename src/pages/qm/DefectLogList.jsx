import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Filter, Save, AlertTriangle } from 'lucide-react';

const DefectLogList = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  // Master Data for Selects
  const [causeCodes, setCauseCodes] = useState([]);
  const [defectCodes, setDefectCodes] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    lot_no: '',
    line_id: '',
    machine_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadData = () => {
    setLogs(dataService.getAll('defect_logs').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setCauseCodes(dataService.getAll('cause_codes'));
    setDefectCodes(dataService.getAll('defect_codes'));
  };

  const applyFilters = () => {
    let result = logs;
    if (filters.lot_no) result = result.filter(l => l.lot_no.includes(filters.lot_no));
    if (filters.line_id) result = result.filter(l => l.line_id.includes(filters.line_id));
    if (filters.machine_id) result = result.filter(l => l.machine_id.includes(filters.machine_id));
    setFilteredLogs(result);
  };

  const handleEdit = (log) => {
    setEditingLog({ ...log });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    dataService.update('defect_logs', 'defect_log_id', editingLog.defect_log_id, editingLog);
    loadData();
    handleCloseModal();
  };

  const columns = [
    { key: 'created_at', label: 'Time' },
    { key: 'defect_log_id', label: 'Log ID' },
    { key: 'lot_no', label: 'LOT No' },
    { key: 'defect_code', label: 'Defect' },
    { key: 'cause_code', label: 'Cause' },
    { key: 'action', label: 'Action' },
    { key: 'status', label: 'Status' }, // Virtual column
  ];

  // Transform for display
  const displayData = filteredLogs.map(l => ({
    ...l,
    created_at: new Date(l.created_at).toLocaleString(),
    status: l.action ? '✅ Resolved' : '⚠️ Open'
  }));

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-2xl">Defect Logs</h1>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 mb-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Filter size={20} className="text-secondary" />
        <input 
          placeholder="Filter by LOT..." 
          style={{ ...inputStyle, marginBottom: 0, width: '200px' }}
          value={filters.lot_no}
          onChange={e => setFilters({...filters, lot_no: e.target.value})}
        />
        <input 
          placeholder="Filter by Line..." 
          style={{ ...inputStyle, marginBottom: 0, width: '200px' }}
          value={filters.line_id}
          onChange={e => setFilters({...filters, line_id: e.target.value})}
        />
        <input 
          placeholder="Filter by Machine..." 
          style={{ ...inputStyle, marginBottom: 0, width: '200px' }}
          value={filters.machine_id}
          onChange={e => setFilters({...filters, machine_id: e.target.value})}
        />
      </div>

      <Table
        columns={columns}
        data={displayData}
        onEdit={handleEdit}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Update Defect Log"
      >
        {editingLog && (
          <form onSubmit={handleSave}>
            <div className="p-4 bg-white/5 rounded-md mb-4">
              <div className="text-sm text-secondary mb-2">Event Context</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span className="text-secondary">LOT:</span> {editingLog.lot_no}</div>
                <div><span className="text-secondary">Machine:</span> {editingLog.machine_id}</div>
                <div><span className="text-secondary">Defect:</span> {editingLog.defect_code}</div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Cause Code</label>
              <select
                style={inputStyle}
                value={editingLog.cause_code}
                onChange={(e) => setEditingLog({ ...editingLog, cause_code: e.target.value })}
                required
              >
                <option value="">Select Cause</option>
                {causeCodes.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Action Taken</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                value={editingLog.action}
                onChange={(e) => setEditingLog({ ...editingLog, action: e.target.value })}
                placeholder="Describe the corrective action taken..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-center gap-2">
                <Save size={18} />
                Save Updates
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DefectLogList;
