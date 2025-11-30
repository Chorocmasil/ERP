import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const DefectCodeMaster = () => {
  const [codes, setCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Acoustic',
    iso_group: 'Q-AC',
    iso_code: ''
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = () => {
    setCodes(dataService.getAll('defect_codes'));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      // Default to first group and auto-gen code
      const defaultGroup = 'Q-AC';
      const nextIso = dataService.getNextIsoCode(defaultGroup);
      setFormData({
        code: '',
        name: '',
        category: 'Acoustic',
        iso_group: defaultGroup,
        iso_code: nextIso
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleGroupChange = (e) => {
    const newGroup = e.target.value;
    const nextIso = dataService.getNextIsoCode(newGroup);
    setFormData({
      ...formData,
      iso_group: newGroup,
      iso_code: nextIso
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      dataService.update('defect_codes', 'code', editingItem.code, formData);
    } else {
      dataService.create('defect_codes', formData);
    }
    loadCodes();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      dataService.delete('defect_codes', 'code', item.code);
      loadCodes();
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'iso_group', label: 'ISO Group' },
    { key: 'iso_code', label: 'ISO Code' },
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
        <h1 className="text-2xl">Defect Code Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Defect Code
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
        title={editingItem ? 'Edit Defect Code' : 'Add New Defect Code'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Defect Code</label>
            <input
              style={inputStyle}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Defect Name</label>
            <input
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              style={inputStyle}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Acoustic">Acoustic</option>
              <option value="Visual">Visual</option>
              <option value="Dimensional">Dimensional</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>ISO Group</label>
            <select
              style={inputStyle}
              value={formData.iso_group}
              onChange={handleGroupChange}
              disabled={!!editingItem} // Usually ISO code shouldn't change after creation to maintain history, but user didn't specify. I'll disable it for edit to be safe.
            >
              <option value="Q-AC">Q-AC (Acoustic)</option>
              <option value="Q-VIS">Q-VIS (Visual)</option>
              <option value="Q-DIM">Q-DIM (Dimensional)</option>
              <option value="Q-MECH">Q-MECH (Mechanical)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>ISO Code (Auto-generated)</label>
            <input
              style={{ ...inputStyle, backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
              value={formData.iso_code}
              readOnly
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

export default DefectCodeMaster;
