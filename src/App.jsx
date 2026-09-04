import React, { useState, useEffect, useMemo } from 'react';
import { 
  getData, 
  saveMedicine, 
  deleteMedicine, 
  addAuditLog, 
  updateSettings, 
  resetToDemoData, 
  subscribe,
  addProfile,
  updateProfile,
  deleteProfile,
  applyRemoteData
} from './lib/storage';
import { 
  getSyncState, 
  subscribeSyncState, 
  subscribeToVault, 
  createFamilyVault, 
  joinFamilyVault, 
  unlinkFamilyVault, 
  pushVaultUpdate 
} from './lib/sync';
import { 
  saveFirebaseConfig, 
  clearFirebaseConfig 
} from './lib/firebase';
import { reconcileAudit } from './lib/depletion';
import { Home } from './screens/Home';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { AddMedicineSheet } from './screens/AddMedicineSheet';
import { GlassBottomNav } from './components/glass/GlassBottomNav';
import { Toast } from './components/content/Toast';
import { AppGuideModal } from './components/guide/AppGuideModal';

const HAS_SEEN_GUIDE_KEY = 'sanjeevani_has_seen_guide';
const ACTIVE_PROFILE_KEY = 'sanjeevani_active_profile_id';

export function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [appData, setAppData] = useState(() => getData());
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addSheetProfileId, setAddSheetProfileId] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    try {
      return localStorage.getItem(HAS_SEEN_GUIDE_KEY) !== 'true';
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState(null);

  const profiles = useMemo(() => appData.profiles || [], [appData.profiles]);

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (saved && profiles.some(p => p.id === saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return profiles[0]?.id || 'prof-grandmother';
  });

  // Guardrail: Ensure activeProfileId stays valid when profiles change/delete
  useEffect(() => {
    if (profiles.length > 0 && !profiles.some(p => p.id === activeProfileId)) {
      const fallbackId = profiles[0].id;
      setActiveProfileId(fallbackId);
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, fallbackId);
      } catch (e) {
        console.error(e);
      }
    }
  }, [profiles, activeProfileId]);

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

  const handleSelectProfile = (id) => {
    setActiveProfileId(id);
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } catch (e) {
      console.error(e);
    }
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

  const handleAddProfile = (name, phone) => {
    const created = addProfile(name, phone);
    if (created) {
      showToast(`Added profile for ${created.name}`);
      handleSelectProfile(created.id);
    }
    return created;
  };

  const handleUpdateProfile = (id, updates) => {
    const updated = updateProfile(id, updates);
    if (updated) {
      showToast(`Updated ${updated.name}'s profile`);
    }
    return updated;
  };

  const handleDeleteProfile = (id, reassignId) => {
    const success = deleteProfile(id, reassignId);
    if (success) {
      showToast('Profile removed');
    } else {
      showToast('Cannot delete the last remaining profile', 'warning');
    }
    return success;
  };

  // Cloud Sync State
  const [syncState, setSyncState] = useState(() => getSyncState());

  // Listen to sync engine status updates
  useEffect(() => {
    return subscribeSyncState(setSyncState);
  }, []);

  // Live real-time Firestore listener when connected to a Family Vault
  useEffect(() => {
    if (!syncState.vaultId || !syncState.isConfigured) return;

    const unsubscribe = subscribeToVault(syncState.vaultId, (remoteData) => {
      applyRemoteData(remoteData);
      showToast('Synced live update from family', 'info');
    });

    return unsubscribe;
  }, [syncState.vaultId, syncState.isConfigured]);

  const handleCreateVault = async () => {
    try {
      const code = await createFamilyVault(appData);
      showToast(`Created Family Vault ${code}!`);
      return code;
    } catch (err) {
      showToast(err.message || 'Failed to create vault', 'warning');
      throw err;
    }
  };

  const handleJoinVault = async (code) => {
    try {
      const remoteData = await joinFamilyVault(code);
      if (remoteData) {
        applyRemoteData(remoteData);
      }
      showToast(`Joined Family Vault ${code.toUpperCase()}!`);
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to join vault', 'warning');
      throw err;
    }
  };

  const handleUnlinkVault = () => {
    unlinkFamilyVault();
    showToast('Unlinked from Family Vault');
  };

  const handleSaveFirebaseConfig = (config) => {
    try {
      saveFirebaseConfig(config);
      showToast('Firebase configuration saved!');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to save config', 'warning');
      throw err;
    }
  };

  const handleClearFirebaseConfig = () => {
    unlinkFamilyVault();
    clearFirebaseConfig();
    showToast('Firebase configuration removed');
  };

  const handleManualSync = () => {
    pushVaultUpdate(appData);
    showToast('Syncing changes with family cloud...');
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
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
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
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={handleSelectProfile}
          onAudit={handleAudit}
          onDelete={handleDeleteMedicine}
          onOpenAddSheet={(profileId) => {
            setAddSheetProfileId(profileId || activeProfileId);
            setIsAddSheetOpen(true);
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {currentTab === 'history' && (
        <History
          auditLogs={appData.auditLogs}
          medicines={appData.medicines}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={handleSelectProfile}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {currentTab === 'settings' && (
        <Settings
          settings={appData.settings}
          profiles={profiles}
          medicines={appData.medicines}
          syncState={syncState}
          onCreateVault={handleCreateVault}
          onJoinVault={handleJoinVault}
          onUnlinkVault={handleUnlinkVault}
          onSaveFirebaseConfig={handleSaveFirebaseConfig}
          onClearFirebaseConfig={handleClearFirebaseConfig}
          onManualSync={handleManualSync}
          onUpdateSettings={updateSettings}
          onAddProfile={handleAddProfile}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          onResetData={handleResetData}
          onShowToast={showToast}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {/* Floating Glass Bottom Nav */}
      <GlassBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onAddMedicine={() => {
          setAddSheetProfileId(activeProfileId);
          setIsAddSheetOpen(true);
        }}
      />

      {/* Add Medicine Glass Bottom Sheet */}
      <AddMedicineSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSave={handleSaveMedicine}
        profiles={profiles}
        initialRecipient={addSheetProfileId || activeProfileId}
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
