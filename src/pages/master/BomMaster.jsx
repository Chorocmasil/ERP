import React, { useMemo, useState } from 'react';
import { dataService } from '../../services/mockData';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Trash2 } from 'lucide-react';

const BomMaster = () => {
  const [boms, setBoms] = useState(() => dataService.getAll('boms'));
  const [items, setItems] = useState(() => dataService.getAll('items'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ product_id: '', materials: [] });

  const loadData = () => {
    setBoms(dataService.getAll('boms'));
    setItems(dataService.getAll('items'));
  };

  // 초기 데이터는 localStorage 기반 동기 API이므로, useState 초기값으로 로딩합니다.

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(JSON.parse(JSON.stringify(item))); // Deep copy
    } else {
      setEditingItem(null);
      setFormData({ product_id: '', materials: [] });
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
      dataService.update('boms', 'product_id', editingItem.product_id, formData);
    } else {
      dataService.create('boms', formData);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete BOM for ${item.product_id}?`)) {
      dataService.delete('boms', 'product_id', item.product_id);
      loadData();
    }
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { material_id: '', qty: 1 }]
    });
  };

  const removeMaterial = (index) => {
    const newMaterials = [...formData.materials];
    newMaterials.splice(index, 1);
    setFormData({ ...formData, materials: newMaterials });
  };

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData({ ...formData, materials: newMaterials });
  };

  const columns = [
    { key: 'product_name', label: 'Product' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'material_count', label: 'Materials Count' },
  ];

  // Transform data for display
  const displayData = useMemo(
    () => {
      const itemById = new Map(items.map((i) => [i.item_id, i]));
      return boms.map((b) => {
        const it = itemById.get(b.product_id);
        const name = it?.item_name ? `${it.item_name}${it.type ? ` [${it.type}]` : ''}` : '미정(마스터에 없음)';
        return {
          ...b,
          product_name: name,
          material_count: Array.isArray(b.materials) ? b.materials.length : 0
        };
      });
    },
    [boms, items]
  );

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
        <h1 className="text-2xl">BOM Master</h1>
        <button className="btn-primary flex-center gap-4" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add BOM
        </button>
      </div>

      <div style={{ margin: '-1rem 0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          현재 BOM 엔트리: <b style={{ color: 'var(--text-primary)' }}>{boms.length}</b>개 / 아이템: <b style={{ color: 'var(--text-primary)' }}>{items.length}</b>개
        </div>
      </div>

      <Table
        columns={columns}
        data={displayData}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit BOM' : 'Add New BOM'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Product</label>
            <select
              style={inputStyle}
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              disabled={!!editingItem}
              required
            >
              <option value="">Select Product</option>
              {items.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_name} ({item.item_id}){item.type ? ` [${item.type}]` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={labelStyle}>Materials</label>
              <button type="button" onClick={addMaterial} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', fontSize: '0.875rem' }}>
                + Add Material
              </button>
            </div>
            {formData.materials.map((mat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  style={{ ...inputStyle, marginBottom: 0, flex: 2 }}
                  value={mat.material_id}
                  onChange={(e) => updateMaterial(idx, 'material_id', e.target.value)}
                  required
                >
                  <option value="">Select Material</option>
                  {(items.some((i) => i.type === 'RM') ? items.filter(i => i.type === 'RM') : items).map(item => (
                    <option key={item.item_id} value={item.item_id}>
                      {item.item_name} ({item.item_id}){item.type ? ` [${item.type}]` : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  value={mat.qty}
                  onChange={(e) => updateMaterial(idx, 'qty', parseFloat(e.target.value))}
                  placeholder="Qty"
                  required
                />
                <button type="button" onClick={() => removeMaterial(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
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

export default BomMaster;
