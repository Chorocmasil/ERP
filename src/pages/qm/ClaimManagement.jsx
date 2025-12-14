import React, { useState } from 'react';
import { dataService } from '../../services/mockData';
import Modal from '../../components/Modal';
import { Plus, FileText } from 'lucide-react';

const createClaimId = () => { 
  // 렌더 중 비결정적 함수(Date.now 등) 호출을 피하기 위해, 이벤트 핸들러에서만 호출되는 순수-ish ID 생성.
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `CLM-${year}-${suffix}`;
};

const KanbanColumn = ({ title, status, color, claims, onOpen }) => {
  const items = claims.filter(c => c.status === status);

  return (
    <div className="flex-1 glass-panel p-4 min-h-[520px]">
      <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span
          className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          {items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.map(claim => (
          <div
            key={claim.claim_id}
            onClick={() => onOpen(claim)}
            className="p-4 rounded-md cursor-pointer card-hover"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${status === 'Open' ? '#EF4444' : status === 'In Progress' ? '#3B82F6' : '#10B981'}`,
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-gray-500">{claim.claim_id}</span>
              <span className="text-xs text-gray-400">{claim.issue_date}</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{claim.description}</h4>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{claim.customer}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{claim.model}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClaimManagement = () => {
  const [claims, setClaims] = useState(() => dataService.getAll('claims') || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [formData, setFormData] = useState({});
  const loadClaims = () => setClaims(dataService.getAll('claims') || []);

  const handleOpenModal = (claim = null) => {
    if (claim) {
      setEditingClaim(claim);
      setFormData(claim);
    } else {
      setEditingClaim(null);
      setFormData({
        claim_id: createClaimId(),
        status: 'Open',
        issue_date: new Date().toISOString().split('T')[0],
        d0_symptom: '', d1_team: '', d2_problem: '', d3_containment: '',
        d4_root_cause: '', d5_corrective_action: '', d6_validation: '', d7_prevention: '', d8_closure: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClaim) {
      dataService.update('claims', 'claim_id', editingClaim.claim_id, formData);
    } else {
      dataService.create('claims', formData);
    }
    loadClaims();
    setIsModalOpen(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' };
  const roomyButtonStyle = { paddingTop: '0.75rem', paddingBottom: '0.75rem', minHeight: '44px' };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-2xl text-primary" style={{ marginBottom: '0.75rem' }}>클레임 관리 (8D 보고서)</h1>
        <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>
          고객 클레임 접수부터 시정조치(8D)까지 단계별로 관리합니다.
        </p>
        <div>
          <button onClick={() => handleOpenModal()} className="btn-primary" type="button" style={roomyButtonStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> 신규 클레임
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn title="접수" status="Open" color="bg-red-500" claims={claims} onOpen={handleOpenModal} />
        <KanbanColumn title="처리중" status="In Progress" color="bg-blue-500" claims={claims} onOpen={handleOpenModal} />
        <KanbanColumn title="종결" status="Closed" color="bg-green-500" claims={claims} onOpen={handleOpenModal} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClaim ? 'Edit 8D Report' : 'New Claim Registration'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Claim ID</label>
              <input style={{...inputStyle, backgroundColor: '#f3f4f6'}} value={formData.claim_id} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select 
                style={inputStyle} 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Customer</label>
              <input style={inputStyle} value={formData.customer || ''} onChange={e => setFormData({...formData, customer: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <input style={inputStyle} value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label style={labelStyle}>Problem Description</label>
            <textarea 
              style={{...inputStyle, minHeight: '60px'}} 
              value={formData.description || ''} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={16} /> 8D 상세
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'd0_symptom', label: 'D0: 증상' },
                { key: 'd1_team', label: 'D1: 팀 구성' },
                { key: 'd2_problem', label: 'D2: 문제 정의' },
                { key: 'd3_containment', label: 'D3: 임시 조치' },
                { key: 'd4_root_cause', label: 'D4: 근본 원인' },
                { key: 'd5_corrective_action', label: 'D5: 영구 대책' },
                { key: 'd6_validation', label: 'D6: 검증' },
                { key: 'd7_prevention', label: 'D7: 재발 방지' },
                { key: 'd8_closure', label: 'D8: 종결' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input 
                    style={inputStyle} 
                    value={formData[field.key] || ''} 
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                    placeholder={`Enter ${field.label}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3" style={{ paddingTop: '1rem', paddingBottom: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-primary"
              style={{ ...roomyButtonStyle, minWidth: '96px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              취소
            </button>
            <button type="submit" className="btn-primary" style={{ ...roomyButtonStyle, minWidth: '96px' }}>저장</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClaimManagement;
