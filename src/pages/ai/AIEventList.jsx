import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Play, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const AIEventList = () => {
  const { currentUser } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnlyNG, setShowOnlyNG] = useState(false);

  const loadEvents = useCallback(() => {
    let allEvents = dataService.getAll('ai_events');
    
    if (currentUser !== 'Project Manager') {
      const lines = dataService.getAll('process_lines').filter(l => l.manager === currentUser);
      const lineIds = lines.map(l => l.line_id);
      const machines = dataService.getAll('machines').filter(m => lineIds.includes(m.line_id));
      const machineIds = machines.map(m => m.machine_id);
      
      allEvents = allEvents.filter(e => machineIds.includes(e.machine_id));
    }

    setEvents(allEvents);
  }, [currentUser]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleGenerate = () => {
    dataService.generateDummyEvents(5);
    loadEvents();
  };

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const columns = [
    { key: 'timestamp', label: 'Time' },
    { key: 'machine_id', label: 'Machine' },
    { key: 'lot_no', label: 'LOT No' },
    { key: 'sound_result', label: 'Result' },
    { key: 'defect_type_ai', label: 'AI Defect Type' },
  ];

  // Custom row rendering or data transformation could be done here
  // For now, we'll just map the data
  const displayData = events
    .filter(e => !showOnlyNG || e.sound_result === 'NG')
    .map(e => ({
      ...e,
      timestamp: new Date(e.timestamp).toLocaleString(),
      sound_result: e.sound_result === 'NG' ? '❌ NG' : '✅ OK'
    }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-2xl">AI Inspection Events</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showOnlyNG} 
              onChange={(e) => setShowOnlyNG(e.target.checked)}
              className="w-4 h-4 accent-accent-primary"
            />
            <span className="text-sm font-medium">Show NG Only</span>
          </label>
          <button className="btn-primary flex-center gap-2" onClick={handleGenerate}>
            <Play size={18} />
            Simulate Incoming Events
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Time</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Machine</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>LOT</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Result</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>AI Defect Type</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{row.timestamp}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{row.machine_id}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{row.lot_no}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      color: row.sound_result.includes('NG') ? 'var(--danger)' : 'var(--success)',
                      fontWeight: 'bold'
                    }}>
                      {row.sound_result}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{row.defect_type_ai || '-'}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <button onClick={() => handleViewDetail(events[idx])} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)' }}>
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No events yet. Click Simulate to generate.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Event Details"
      >
        {selectedEvent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-secondary">Event ID</span>
              <span>{selectedEvent.event_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-secondary">Timestamp</span>
              <span>{new Date(selectedEvent.timestamp).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-secondary">Result</span>
              <span style={{ 
                color: selectedEvent.sound_result === 'NG' ? 'var(--danger)' : 'var(--success)',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {selectedEvent.sound_result === 'NG' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                {selectedEvent.sound_result}
              </span>
            </div>
            {selectedEvent.sound_result === 'NG' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-secondary">Defect Type</span>
                  <span>{selectedEvent.defect_type_ai}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-secondary">Severity</span>
                  <span style={{ color: selectedEvent.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)' }}>
                    {selectedEvent.severity}
                  </span>
                </div>
                <div className="p-4 bg-white/5 rounded-md mt-2">
                  <p className="text-sm text-secondary">
                    * A Defect Log has been automatically created for this NG event. Please check the Defect Logs page to assign a cause and action.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIEventList;
