import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const ProcessLineMaster = () => {
  const [lines, setLines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ line_id: '', line_name: '', seq: 1 });

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = () => {
    setLines(dataService.getAll('process_lines').sort((a, b) => a.seq - b.seq));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ line_id: '', line_name: '', seq: lines.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure seq is a number
    const dataToSave = { ...formData, seq: parseInt(formData.seq, 10) };
    
    if (editingItem) {
      dataService.update('process_lines', 'line_id', editingItem.line_id, dataToSave);
    } else {
      dataService.create('process_lines', dataToSave);
    }
    loadLines();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.line_name}?`)) {
      dataService.delete('process_lines', 'line_id', item.line_id);
      loadLines();
    }
  };

  const columns = [
    { key: 'line_id', label: 'Line ID' },
    { key: 'line_name', label: 'Line Name' },
    { key: 'seq', label: 'Sequence' },
  ];

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
        <h1 className="text-2xl">Process Line Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Line
        </button>
      </div>

      <Table
        columns={columns}
        data={lines}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Process Line' : 'Add New Process Line'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Line ID</label>
            <input
              style={inputStyle}
              value={formData.line_id}
              onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Line Name</label>
            <input
              style={inputStyle}
              value={formData.line_name}
              onChange={(e) => setFormData({ ...formData, line_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Sequence</label>
            <input
              type="number"
              style={inputStyle}
              value={formData.seq}
              onChange={(e) => setFormData({ ...formData, seq: e.target.value })}
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
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProcessLineMaster;
