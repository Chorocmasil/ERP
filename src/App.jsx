import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import AIEventList from './pages/ai/AIEventList';
import DefectLogList from './pages/qm/DefectLogList';
import MasterDashboard from './pages/master/MasterDashboard';
import ItemMaster from './pages/master/ItemMaster';
import BomMaster from './pages/master/BomMaster';
import ProcessLineMaster from './pages/master/ProcessLineMaster';
import MachineMaster from './pages/master/MachineMaster';
import DefectCodeMaster from './pages/master/DefectCodeMaster';
import CauseCodeMaster from './pages/master/CauseCodeMaster';
import LotMaster from './pages/master/LotMaster';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="ai-events" element={<AIEventList />} />
              <Route path="defect-logs" element={<DefectLogList />} />
              <Route path="master" element={<MasterDashboard />} />
              <Route path="master/items" element={<ItemMaster />} />
              <Route path="master/boms" element={<BomMaster />} />
              <Route path="master/process-lines" element={<ProcessLineMaster />} />
              <Route path="master/machines" element={<MachineMaster />} />
              <Route path="master/defect-codes" element={<DefectCodeMaster />} />
              <Route path="master/cause-codes" element={<CauseCodeMaster />} />
              <Route path="master/lots" element={<LotMaster />} />
            </Route>
          </Routes>
        </Router>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
