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
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { AddMedicineSheet } from './screens/AddMedicineSheet';
import { GlassBottomNav } from './components/glass/GlassBottomNav';
import { Toast } from './components/content/Toast';
import { AppGuideModal } from './components/guide/AppGuideModal';

const HAS_SEEN_GUIDE_KEY = 'sanjeevani_has_seen_guide';

export function App() {
  const [appData, setAppData] = useState(getData());
  const [currentTab, setCurrentTab] = useState('home');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addSheetRecipient, setAddSheetRecipient] = useState('GRANDMOTHER');
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    try {
      return !localStorage.getItem(HAS_SEEN_GUIDE_KEY);
    } catch {
      return true;
    }
  });
  const [toast, setToast] = useState(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribe((freshData) => {
      setAppData(freshData);
    });
    return unsubscribe;
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaveMedicine = (newMed) => {
    saveMedicine(newMed);
    showToast(`Added ${newMed.name}`);
  };

  const handleDeleteMedicine = (id) => {
    deleteMedicine(id);
    showToast('Medicine removed');
  };

  const handleAudit = (med, outcome, customData = null) => {
    const { updatedMedicine, auditRecord } = reconcileAudit(med, outcome, customData);
    saveMedicine(updatedMedicine);
    addAuditLog(auditRecord);
    
    if (outcome === 'MATCHES_EXPECTED') {
      showToast('Count confirmed. All safe!');
    } else if (outcome === 'COUNT_ADJUSTED') {
      showToast('Strip counts updated & synced!');
    } else {
      showToast('Logged: Strip discarded early. Inventory updated.', 'warning');
    }
  };

  const handleCloseGuide = () => {
    try {
      localStorage.setItem(HAS_SEEN_GUIDE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsGuideOpen(false);
  };

  const handleResetData = () => {
    try {
      localStorage.removeItem(HAS_SEEN_GUIDE_KEY);
    } catch (e) {
      console.error(e);
    }
    resetToDemoData();
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
      {currentTab === 'home' && (
        <Home
          medicines={appData.medicines}
          settings={appData.settings}
          onAudit={handleAudit}
          onDelete={handleDeleteMedicine}
          onOpenAddSheet={(recipient) => {
            if (recipient) setAddSheetRecipient(recipient);
            setIsAddSheetOpen(true);
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {currentTab === 'history' && (
        <History
          auditLogs={appData.auditLogs}
          settings={appData.settings}
        />
      )}

      {currentTab === 'settings' && (
        <Settings
          settings={appData.settings}
          onUpdateSettings={updateSettings}
          onResetData={handleResetData}
          onShowToast={showToast}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {/* Floating Glass Bottom Nav */}
      <GlassBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Add Medicine Glass Bottom Sheet */}
      <AddMedicineSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSave={handleSaveMedicine}
        initialRecipient={addSheetRecipient}
        settings={appData.settings}
      />

      {/* 3D CardSwipe App Guide & Tutorial Modal */}
      <AppGuideModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
      />
    </div>
  );
}

export default App;
