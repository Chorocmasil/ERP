import React from 'react';

const Table = ({ columns, data, onEdit, onDelete }) => {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginTop: '1rem',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={thStyle}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} style={{ transition: 'background-color 0.2s' }} className="hover:bg-white/5">
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle}>{row[col.key]}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          style={{ color: 'var(--accent-primary)', background: 'none', border: 'none' }}
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          style={{ color: 'var(--danger)', background: 'none', border: 'none' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} style={{ ...tdStyle, textAlign: 'center', padding: '2rem' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
