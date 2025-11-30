import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const MachineMaster = () => {
  const [machines, setMachines] = useState([]);
  const [lines, setLines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ machine_id: '', machine_name: '', line_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMachines(dataService.getAll('machines'));
    setLines(dataService.getAll('process_lines'));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ machine_id: '', machine_name: '', line_id: lines[0]?.line_id || '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      dataService.update('machines', 'machine_id', editingItem.machine_id, formData);
    } else {
      dataService.create('machines', formData);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.machine_name}?`)) {
      dataService.delete('machines', 'machine_id', item.machine_id);
      loadData();
    }
  };

  const columns = [
    { key: 'machine_id', label: 'Machine ID' },
    { key: 'machine_name', label: 'Machine Name' },
    { key: 'line_id', label: 'Line ID' },
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
        <h1 className="text-2xl">Machine Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Machine
        </button>
      </div>

      <Table
        columns={columns}
        data={machines}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Machine' : 'Add New Machine'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Machine ID</label>
            <input
              style={inputStyle}
              value={formData.machine_id}
              onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Machine Name</label>
            <input
              style={inputStyle}
              value={formData.machine_name}
              onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Process Line</label>
            <select
              style={inputStyle}
              value={formData.line_id}
              onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
              required
            >
              <option value="">Select Line</option>
              {lines.map(line => (
                <option key={line.line_id} value={line.line_id}>
                  {line.line_name} ({line.line_id})
                </option>
              ))}
            </select>
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

export default MachineMaster;
