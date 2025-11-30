import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const CauseCodeMaster = () => {
  const [codes, setCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '' });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = () => {
    setCodes(dataService.getAll('cause_codes'));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ code: '', name: '' });
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
      dataService.update('cause_codes', 'code', editingItem.code, formData);
    } else {
      dataService.create('cause_codes', formData);
    }
    loadCodes();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      dataService.delete('cause_codes', 'code', item.code);
      loadCodes();
    }
  };

  const columns = [
    { key: 'code', label: 'Cause Code' },
    { key: 'name', label: 'Cause Name' },
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
        <h1 className="text-2xl">Cause Code Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Cause Code
        </button>
      </div>

      <Table
        columns={columns}
        data={codes}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Cause Code' : 'Add New Cause Code'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Cause Code</label>
            <input
              style={inputStyle}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Cause Name</label>
            <input
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

export default CauseCodeMaster;
