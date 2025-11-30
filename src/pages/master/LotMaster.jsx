import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const LotMaster = () => {
  const [lots, setLots] = useState([]);
  const [items, setItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ lot_no: '', product_id: '', line_id: '', date: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLots(dataService.getAll('lots'));
    setItems(dataService.getAll('items').filter(i => i.type === 'FG')); // Only FGs have LOTs usually
    setLines(dataService.getAll('process_lines'));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({ 
        lot_no: `LOT${today.replace(/-/g, '')}-01`, 
        product_id: items[0]?.item_id || '', 
        line_id: lines[0]?.line_id || '', 
        date: today 
      });
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
      dataService.update('lots', 'lot_no', editingItem.lot_no, formData);
    } else {
      dataService.create('lots', formData);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.lot_no}?`)) {
      dataService.delete('lots', 'lot_no', item.lot_no);
      loadData();
    }
  };

  const columns = [
    { key: 'lot_no', label: 'LOT No' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'line_id', label: 'Line ID' },
    { key: 'date', label: 'Date' },
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
        <h1 className="text-2xl">LOT Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add LOT
        </button>
      </div>

      <Table
        columns={columns}
        data={lots}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit LOT' : 'Add New LOT'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>LOT No</label>
            <input
              style={inputStyle}
              value={formData.lot_no}
              onChange={(e) => setFormData({ ...formData, lot_no: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Product</label>
            <select
              style={inputStyle}
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {items.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_name} ({item.item_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Line</label>
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
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              style={inputStyle}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

export default LotMaster;
