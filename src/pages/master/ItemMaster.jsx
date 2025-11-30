import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

const ItemMaster = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ item_id: '', item_name: '', type: 'FG', unit: 'EA' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(dataService.getAll('items'));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ item_id: '', item_name: '', type: 'FG', unit: 'EA' });
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
      dataService.update('items', 'item_id', editingItem.item_id, formData);
    } else {
      dataService.create('items', formData);
    }
    loadItems();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`${t('deleteConfirm')} ${item.item_name}?`)) {
      dataService.delete('items', 'item_id', item.item_id);
      loadItems();
    }
  };

  const columns = [
    { key: 'item_id', label: t('itemId') },
    { key: 'item_name', label: t('itemName') },
    { key: 'type', label: t('type') },
    { key: 'unit', label: t('unit') },
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
        <h1 className="text-2xl">{t('itemMaster')}</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          {t('addItem')}
        </button>
      </div>

      <Table
        columns={columns}
        data={items}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? t('editItem') : t('addNewItem')}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>{t('itemId')}</label>
            <input
              style={inputStyle}
              value={formData.item_id}
              onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              disabled={!!editingItem}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>{t('itemName')}</label>
            <input
              style={inputStyle}
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>{t('type')}</label>
            <select
              style={inputStyle}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="FG">{t('finishedGood')}</option>
              <option value="RM">{t('rawMaterial')}</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('unit')}</label>
            <input
              style={inputStyle}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemMaster;
