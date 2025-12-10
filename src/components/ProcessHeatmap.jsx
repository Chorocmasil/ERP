import React, { useMemo } from 'react';
import { dataService } from '../services/mockData';
import { useUser } from '../context/UserContext';

const ProcessHeatmap = () => {
  const { currentUser } = useUser();

  const { lines, machines, logs } = useMemo(() => {
    let allLines = dataService.getAll('process_lines').sort((a, b) => a.seq - b.seq);
    
    if (currentUser !== 'Project Manager') {
      allLines = allLines.filter(l => l.manager === currentUser);
    }

    return {
      lines: allLines,
      machines: dataService.getAll('machines'),
      logs: dataService.getAll('defect_logs')
    };
  }, [currentUser]);

  // Calculate defect counts and statistics
  const stats = useMemo(() => {
    const lineStats = {};
    const machineStats = {};
    let totalMachineDefects = 0;
    let machineCountWithDefects = 0;
    let maxMachineDefects = 0;

    logs.forEach(log => {
      // Line count
      lineStats[log.line_id] = (lineStats[log.line_id] || 0) + 1;
      // Machine count
      if (log.machine_id) {
        machineStats[log.machine_id] = (machineStats[log.machine_id] || 0) + 1;
      }
    });

    // Calculate stats for heatmap
    const machineIds = Object.keys(machineStats);
    machineCountWithDefects = machineIds.length;
    machineIds.forEach(id => {
      const count = machineStats[id];
      totalMachineDefects += count;
      if (count > maxMachineDefects) maxMachineDefects = count;
    });

    const avgMachineDefects = machineCountWithDefects > 0 ? totalMachineDefects / machineCountWithDefects : 0;

    return { lineStats, machineStats, avgMachineDefects, maxMachineDefects };
  }, [logs]);

  const getSeverityStyle = (count, avg, max) => {
    // If very low defects (<= 10), return green
    if (count <= 10) return {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    };

    // If below average, return neutral/yellow
    if (count <= avg) {
      return {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        color: '#eab308'
      };
    }

    // If above average, calculate intensity of red
    // Normalize the excess over average to 0-1 range
    const range = Math.max(max - avg, 1);
    const intensity = Math.min((count - avg) / range, 1);
    
    // Base red with increasing opacity based on intensity
    // Min opacity 0.2, Max opacity 0.5 for background
    const bgOpacity = 0.2 + (intensity * 0.3);
    const borderOpacity = 0.4 + (intensity * 0.6);

    return {
      backgroundColor: `rgba(239, 68, 68, ${bgOpacity})`,
      borderColor: `rgba(239, 68, 68, ${borderOpacity})`,
      color: '#ef4444'
    };
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 className="text-lg mb-6" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '0.5rem', height: '1.5rem', backgroundColor: '#3b82f6', borderRadius: '0.125rem', display: 'inline-block' }}></span>
        Process Line Heatmap
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        {lines.map(line => {
          const lineDefects = stats.lineStats[line.line_id] || 0;
          const lineMachines = machines.filter(m => m.line_id === line.line_id);
          // For line header, we just use a simple check or maybe aggregate severity? 
          // Let's keep line header simple for now, or use the same logic if applicable.
          // Using a simplified logic for line header to avoid confusion
          const lineSeverityStyle = lineDefects > (stats.avgMachineDefects * lineMachines.length) 
            ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }
            : { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981' };

          return (
            <div key={line.line_id} style={{ position: 'relative', padding: '1rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'rgba(30, 41, 59, 0.3)' }}>
              {/* Line Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{line.line_name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Manager: {line.manager}</div>
                </div>
                <div style={{
                  ...lineSeverityStyle,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  border: '1px solid'
                }}>
                  {lineDefects} Defects
                </div>
              </div>

              {/* Machines Flow */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {lineMachines.map((machine, idx) => {
                  const machineDefects = stats.machineStats[machine.machine_id] || 0;
                  const machineSeverityStyle = getSeverityStyle(machineDefects, stats.avgMachineDefects, stats.maxMachineDefects);
                  
                  return (
                    <div key={machine.machine_id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '140px' }}>
                      {/* Arrow for flow */}
                      {idx > 0 && (
                        <div style={{ color: '#4b5563', margin: '0 0.5rem' }}>→</div>
                      )}
                      
                      <div style={{
                        ...machineSeverityStyle,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={machine.machine_name}>
                          {machine.machine_name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{machine.machine_id}</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{machineDefects}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {lineMachines.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>No machines assigned</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          <span style={{ color: '#94a3b8' }}>Good (≤10)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
          <span style={{ color: '#94a3b8' }}>Below Average</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#ef4444', opacity: 0.5 }}></div>
          <span style={{ color: '#94a3b8' }}>Above Average</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
          <span style={{ color: '#94a3b8' }}>Critical (High)</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessHeatmap;
