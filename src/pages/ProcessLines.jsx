import React from 'react';

const ProcessLines = () => {
  return (
    <div style={{ padding: '20px', height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>공정 라인 관리 (Process Lines)</h1>
      
      {/* 
        차트 라이브러리(Recharts 등)는 부모 컨테이너의 높이가 명시되어 있어야 정상 작동합니다.
        아래와 같이 flex-grow 또는 고정 높이를 주어 차트 영역을 확보합니다.
      */}
      <div style={{ flex: 1, minHeight: '500px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '10px' }}>공정 라인 현황 차트 영역</p>
        
        {/* 이곳에 차트 컴포넌트를 배치하면 width/height 오류가 해결됩니다. */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', border: '1px dashed #ccc' }}>
          차트 데이터가 로딩될 영역입니다.
        </div>
      </div>
    </div>
  );
};

export default ProcessLines;
