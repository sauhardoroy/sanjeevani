import React, { useState, useEffect } from 'react';
import { 
  getData, 
  saveMedicine, 
  deleteMedicine, 
  addAuditLog, 
  updateSettings, 
  resetToDemoData, 
  subscribe 
} from './lib/storage';
import { reconcileAudit } from './lib/depletion';
import { Home } from './screens/Home';
import { MedicineDetail } from './screens/MedicineDetail';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { AddMedicineSheet } from './screens/AddMedicineSheet';
import { GlassBottomNav } from './components/glass/GlassBottomNav';
import { Toast } from './components/content/Toast';

export function App() {
  const [appData, setAppData] = useState(getData());
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribe((newData) => {
      setAppData(newData);
    });
    return unsubscribe;
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const selectedMedicine = appData.medicines?.find(m => m.id === selectedMedicineId) || null;

  const handleSelectMedicine = (med) => {
    setSelectedMedicineId(med.id);
  };

  const handleBack = () => {
    setSelectedMedicineId(null);
  };

  const handleSaveMedicine = (newMed) => {
    saveMedicine(newMed);
    showToast(`Added ${newMed.name}`);
  };

  const handleDeleteMedicine = (id) => {
    deleteMedicine(id);
    setSelectedMedicineId(null);
    showToast('Medicine removed');
  };

  const handleAudit = (med, outcome) => {
    const { updatedMedicine, auditRecord } = reconcileAudit(med, outcome);
    saveMedicine(updatedMedicine);
    addAuditLog(auditRecord);
    
    if (outcome === 'MATCHES_EXPECTED') {
      showToast('Count confirmed. All safe!');
    } else {
      showToast('Logged: Strip discarded early. New strip opened.', 'warning');
    }
  };

  const handleResetData = () => {
    resetToDemoData();
    setSelectedMedicineId(null);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans antialiased selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Screen Routing */}
      {selectedMedicine ? (
        <MedicineDetail
          medicine={selectedMedicine}
          settings={appData.settings}
          onBack={handleBack}
          onAudit={handleAudit}
          onDelete={handleDeleteMedicine}
        />
      ) : (
        <>
          {currentTab === 'home' && (
            <Home
              medicines={appData.medicines}
              settings={appData.settings}
              onSelectMedicine={handleSelectMedicine}
              onOpenAddSheet={() => setIsAddSheetOpen(true)}
            />
          )}

          {currentTab === 'history' && (
            <History
              auditLogs={appData.auditLogs}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              settings={appData.settings}
              onUpdateSettings={updateSettings}
              onResetData={handleResetData}
              onShowToast={showToast}
            />
          )}

          {/* Floating Glass Bottom Nav */}
          <GlassBottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setSelectedMedicineId(null);
              setCurrentTab(tab);
            }}
          />
        </>
      )}

      {/* Add Medicine Glass Bottom Sheet */}
      <AddMedicineSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSave={handleSaveMedicine}
      />
    </div>
  );
}

export default App;
