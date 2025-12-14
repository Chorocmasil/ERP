import React, { useMemo, useState } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Filter, Save, AlertTriangle, Search } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const DefectLogList = () => {
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  // Master Data for Selects
  const causeCodes = useMemo(() => dataService.getAll('cause_codes'), []);

  // Filters
  const [filters, setFilters] = useState({
    lot_no: '',
    line_id: 'all',
    status: 'all'
  });

  const { logs, lines } = useMemo(() => {
    let allLogs = dataService
      .getAll('defect_logs')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let allLines = dataService.getAll('process_lines');

    if (currentUser !== 'Project Manager') {
      allLines = allLines.filter((l) => l.manager === currentUser);
      const lineIds = allLines.map((l) => l.line_id);
      allLogs = allLogs.filter((l) => lineIds.includes(l.line_id));
    }

    return { logs: allLogs, lines: allLines };
  }, [currentUser]);

  const availableLines = lines;

  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by LOT No
    if (filters.lot_no) {
      result = result.filter((l) => l.lot_no.toLowerCase().includes(filters.lot_no.toLowerCase()));
    }

    // Filter by Line (Toggle)
    if (filters.line_id !== 'all') {
      result = result.filter((l) => l.line_id === filters.line_id);
    }

    // Filter by Status (Toggle)
    if (filters.status === 'open') {
      result = result.filter((l) => !l.action);
    } else if (filters.status === 'resolved') {
      result = result.filter((l) => l.action);
    }

    return result;
  }, [logs, filters]);

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
    status: l.action ? '✅ Resolved' : '⚠️ Open',
    lot_no: (
      <Link
        to={`/qm/traceability?lot=${encodeURIComponent(l.lot_no || '')}&dir=backward`}
        style={{ color: 'var(--accent-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        title="추적성 관리에서 LOT 조회"
      >
        {l.lot_no}
      </Link>
    )
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
      <div className="glass-panel p-6 mb-6">
        <div className="flex flex-col gap-10">
          
          {/* Search */}
          <div className="search-box">
            <Search className="text-secondary mr-3" size={20} />
            <input 
              placeholder="Search by LOT No..." 
              className="search-input"
              value={filters.lot_no}
              onChange={e => setFilters({...filters, lot_no: e.target.value})}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-secondary w-16 pt-2 shrink-0">Status:</span>
              <div className="flex gap-2 flex-1 flex-wrap min-w-0">
                {['all', 'open', 'resolved'].map(status => (
                  <button
                    key={status}
                    className={`filter-chip ${filters.status === status ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status})}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-secondary w-16 pt-2 shrink-0">Line:</span>
              <div className="flex gap-2 flex-1 flex-wrap min-w-0">
                <button
                  className={`filter-chip ${filters.line_id === 'all' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, line_id: 'all'})}
                >
                  All Lines
                </button>
                {availableLines.map(line => (
                  <button
                    key={line.line_id}
                    className={`filter-chip ${filters.line_id === line.line_id ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, line_id: line.line_id})}
                  >
                    {line.line_name}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
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
