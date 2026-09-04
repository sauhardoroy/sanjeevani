import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  RotateCcw, 
  Check, 
  Database,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Pill,
  Cloud,
  RefreshCw,
  Copy,
  Share2,
  Key,
  X
} from 'lucide-react';
import { getFirebaseConfig } from '../lib/firebase';

const TOUCH_SPRING = {
  type: 'spring',
  stiffness: 460,
  damping: 24,
  mass: 0.6,
};

function parsePastedSnippet(text) {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed.apiKey && parsed.projectId) return parsed;
  } catch {
    const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
    const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
    const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
    const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

    if (apiKeyMatch && projectIdMatch) {
      return {
        apiKey: apiKeyMatch[1],
        projectId: projectIdMatch[1],
        authDomain: authDomainMatch ? authDomainMatch[1] : undefined,
        appId: appIdMatch ? appIdMatch[1] : undefined,
      };
    }
  }
  return null;
}

/**
 * Settings Screen — Dynamic Multi-Profile & Family Preferences
 * Enables Dad to manage multiple profiles, assign phone numbers, configure caregiver details,
 * and link Mom & Dad's phones via Firebase Family Cloud Vault.
 */
export function Settings({ 
  settings, 
  profiles = [],
  medicines = [],
  syncState = {},
  onCreateVault,
  onJoinVault,
  onUnlinkVault,
  onSaveFirebaseConfig,
  onClearFirebaseConfig,
  onManualSync,
  onUpdateSettings, 
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onResetData, 
  onShowToast,
  onOpenGuide 
}) {
  const [caregiverName, setCaregiverName] = useState(settings?.caregiverName || 'Dad');
  const [grandparentsName, setGrandparentsName] = useState(settings?.grandparentsName || 'Family');
  const [defaultPhone, setDefaultPhone] = useState(settings?.grandparentsPhone || '');
  const [isSaved, setIsSaved] = useState(false);

  // Cloud Sync State & Modals
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isJoinVaultOpen, setIsJoinVaultOpen] = useState(false);
  const [joinVaultCode, setJoinVaultCode] = useState('');
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Firebase Config Form State
  const initialFb = getFirebaseConfig() || {};
  const [fbApiKey, setFbApiKey] = useState(initialFb.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(initialFb.projectId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(initialFb.authDomain || '');
  const [rawSnippet, setRawSnippet] = useState('');

  // Add Profile Modal/Form State
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfilePhone, setNewProfilePhone] = useState('');

  // Edit Profile State
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Delete Profile Modal State
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [reassignProfileId, setReassignProfileId] = useState('');

  const handleRawSnippetChange = (val) => {
    setRawSnippet(val);
    const parsed = parsePastedSnippet(val);
    if (parsed) {
      if (parsed.apiKey) setFbApiKey(parsed.apiKey);
      if (parsed.projectId) setFbProjectId(parsed.projectId);
      if (parsed.authDomain) setFbAuthDomain(parsed.authDomain);
      onShowToast?.('Extracted Firebase credentials from snippet!', 'info');
    }
  };

  const handleSaveFirebaseConfigSubmit = (e) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      onShowToast?.('API Key and Project ID are required', 'warning');
      return;
    }
    try {
      onSaveFirebaseConfig?.({
        apiKey: fbApiKey.trim(),
        projectId: fbProjectId.trim(),
        authDomain: fbAuthDomain.trim()
      });
      setIsFirebaseModalOpen(false);
    } catch (err) {
      onShowToast?.(err.message || 'Error saving Firebase config', 'warning');
    }
  };

  const handleRemoveFirebaseConfigSubmit = () => {
    onClearFirebaseConfig?.();
    setFbApiKey('');
    setFbProjectId('');
    setFbAuthDomain('');
    setRawSnippet('');
    setIsFirebaseModalOpen(false);
  };

  const handleCreateVaultTrigger = async () => {
    try {
      await onCreateVault?.();
    } catch {
      // Toast handled by App.jsx
    }
  };

  const handleJoinVaultSubmit = async (e) => {
    e.preventDefault();
    if (!joinVaultCode.trim()) {
      onShowToast?.('Please enter a Family Vault code', 'warning');
      return;
    }
    try {
      await onJoinVault?.(joinVaultCode.trim().toUpperCase());
      setIsJoinVaultOpen(false);
      setJoinVaultCode('');
    } catch {
      // Toast handled by App.jsx
    }
  };

  const handleCopyVaultCode = async () => {
    if (!syncState.vaultId) return;
    try {
      await navigator.clipboard.writeText(syncState.vaultId);
      setCopiedCode(true);
      onShowToast?.('Vault code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      onShowToast?.(`Code: ${syncState.vaultId}`);
    }
  };

  const handleManualSyncTrigger = async () => {
    setIsSyncingManual(true);
    onManualSync?.();
    setTimeout(() => setIsSyncingManual(false), 1200);
  };

  const handleConfirmUnlink = () => {
    onUnlinkVault?.();
    setIsUnlinkModalOpen(false);
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const getWhatsAppShareVaultLink = (vaultId) => {
    const text = `Hi! Here is our Sanjeevani Family Vault Code to sync medicines across our phones:\n\n*${vaultId}*\n\n1. Open Sanjeevani app\n2. Go to Settings > Family Cloud Sync\n3. Tap "Join Existing Vault" and enter: ${vaultId}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    onUpdateSettings({
      caregiverName: caregiverName.trim() || 'Dad',
      grandparentsName: grandparentsName.trim() || 'Family',
      grandparentsPhone: defaultPhone.trim()
    });
    setIsSaved(true);
    onShowToast?.('Settings updated');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleStartAddProfile = () => {
    setNewProfileName('');
    setNewProfilePhone('');
    setIsAddingProfile(true);
  };

  const handleConfirmAddProfile = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      onShowToast?.('Please enter a name for the profile', 'warning');
      return;
    }
    onAddProfile?.(newProfileName.trim(), newProfilePhone.trim());
    setIsAddingProfile(false);
    setNewProfileName('');
    setNewProfilePhone('');
  };

  const handleStartEditProfile = (profile) => {
    setEditingProfileId(profile.id);
    setEditName(profile.name);
    setEditPhone(profile.phone || '');
  };

  const handleSaveEditProfile = (id) => {
    if (!editName.trim()) {
      onShowToast?.('Profile name cannot be empty', 'warning');
      return;
    }
    onUpdateProfile?.(id, { name: editName.trim(), phone: editPhone.trim() });
    setEditingProfileId(null);
  };

  const handleRequestDelete = (profile) => {
    if (profiles.length <= 1) {
      onShowToast?.('At least one profile must exist', 'warning');
      return;
    }

    const linkedMeds = medicines.filter(m => (m.recipient || m.profileId) === profile.id);
    const otherProfiles = profiles.filter(p => p.id !== profile.id);

    setDeletingProfile({
      ...profile,
      linkedMedsCount: linkedMeds.length
    });
    setReassignProfileId(otherProfiles[0]?.id || '');
  };

  const handleConfirmDelete = (reassign = false) => {
    if (!deletingProfile) return;
    const targetReassign = reassign ? reassignProfileId : null;
    onDeleteProfile?.(deletingProfile.id, targetReassign);
    setDeletingProfile(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset all profiles, medicines, and verification records back to default starting state?')) {
      onResetData();
      setCaregiverName('Dad');
      setGrandparentsName('Family');
      setDefaultPhone('+91 98765 43210');
      onShowToast?.('Application data reset');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <main className="p-4 pt-6 max-w-lg mx-auto w-full flex flex-col gap-6">
        
        {/* ------------------------------------------------------------ */}
        {/* Section 1: People Being Tracked (Dynamic Profiles)           */}
        {/* ------------------------------------------------------------ */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
              Tracked People ({profiles.length})
            </h2>
            {!isAddingProfile && (
              <button
                type="button"
                onClick={handleStartAddProfile}
                className="text-[12px] font-bold text-[#007AFF] hover:text-[#0051A8] flex items-center gap-1 transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add Person</span>
              </button>
            )}
          </div>

          {/* Add Profile Inline Card */}
          <AnimatePresence>
            {isAddingProfile && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleConfirmAddProfile}
                className="rounded-[26px] border border-[#007AFF]/30 bg-white p-4 shadow-sm flex flex-col gap-3 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-2">
                  <span className="text-[13px] font-bold text-[#1C1C1E]">
                    New Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingProfile(false)}
                    className="text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1">
                      Person's Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Mom, Uncle Ramesh, Myself"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full text-[15px] font-semibold text-[#1C1C1E] bg-[#F8F9FB] border border-[#E5E5EA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#007AFF]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1">
                      WhatsApp Phone <span className="font-normal text-[#8E8E93] lowercase">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={newProfilePhone}
                      onChange={(e) => setNewProfilePhone(e.target.value)}
                      className="w-full text-[14px] font-medium text-[#1C1C1E] bg-[#F8F9FB] border border-[#E5E5EA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#007AFF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingProfile(false)}
                    className="px-4 py-1.5 text-xs font-semibold text-[#8E8E93] hover:bg-[#F2F2F7] rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                  >
                    Create Profile
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Profiles List */}
          <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-2 sm:p-3 shadow-xs flex flex-col divide-y divide-[#F2F2F7]">
            {profiles.map((profile) => {
              const medCount = medicines.filter(m => (m.recipient || m.profileId) === profile.id).length;
              const isEditing = editingProfileId === profile.id;

              return (
                <div key={profile.id} className="py-2.5 px-2 flex flex-col gap-2">
                  {isEditing ? (
                    <div className="flex flex-col gap-2.5 p-2 bg-[#F8F9FB] rounded-2xl border border-[#E5E5EA]">
                      <div>
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-[14px] font-bold text-[#1C1C1E] bg-white border border-[#E5E5EA] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#007AFF]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block mb-1">
                          WhatsApp Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-[13px] font-medium text-[#1C1C1E] bg-white border border-[#E5E5EA] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#007AFF]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingProfileId(null)}
                          className="px-3 py-1 text-xs font-semibold text-[#8E8E93]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditProfile(profile.id)}
                          className="px-4 py-1.5 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                          <User size={18} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[15px] font-bold text-[#1C1C1E] tracking-tight truncate">
                            {profile.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#8E8E93] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Pill size={11} />
                              <span>{medCount} med{medCount === 1 ? '' : 's'}</span>
                            </span>
                            {profile.phone && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{profile.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditProfile(profile)}
                          aria-label={`Edit ${profile.name}`}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestDelete(profile)}
                          disabled={profiles.length <= 1}
                          aria-label={`Delete ${profile.name}`}
                          title={profiles.length <= 1 ? "At least one profile must exist" : `Delete ${profile.name}`}
                          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                            profiles.length <= 1 
                              ? 'text-[#C7C7CC] cursor-not-allowed' 
                              : 'text-[#8E8E93] hover:text-[#FF3B30] hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Section 2: Family Cloud Sync (Mom & Dad Shared Memory)       */}
        {/* ------------------------------------------------------------ */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
              Family Cloud Sync
            </h2>
            {syncState.isLinked && (
              <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#34C759]">
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                <span>Live Sync Active</span>
              </span>
            )}
          </div>

          <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            {/* Case 1: Linked and Active! */}
            {syncState.isLinked ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#34C759] border border-green-200 shadow-xs">
                      <Cloud size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
                        Shared Family Vault
                      </h3>
                      <p className="text-[12px] text-[#8E8E93] mt-0.5">
                        {syncState.status === 'syncing' 
                          ? 'Syncing changes live...' 
                          : `Last synced: ${formatTime(syncState.lastSynced)}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSyncTrigger}
                    disabled={isSyncingManual}
                    title="Sync Now"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw size={16} className={isSyncingManual ? 'animate-spin text-[#007AFF]' : ''} />
                  </button>
                </div>

                {/* Vault Code Highlight Box */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                      Family Vault Code
                    </span>
                    <span className="text-[11px] text-[#007AFF] font-medium">
                      Enter on spouse's phone to link
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E5E5EA]">
                    <span className="font-mono text-[22px] font-black tracking-widest text-[#1C1C1E] pl-1">
                      {syncState.vaultId}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyVaultCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check size={13} className="text-[#34C759]" />
                            <span className="text-[#34C759]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={getWhatsAppShareVaultLink(syncState.vaultId)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                      >
                        <Share2 size={13} />
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom row: Unlink & Config */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsFirebaseModalOpen(true)}
                    className="text-[#8E8E93] hover:text-[#1C1C1E] underline font-medium cursor-pointer"
                  >
                    View Cloud Config
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUnlinkModalOpen(true)}
                    className="text-[#FF3B30] hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Unlink Device
                  </button>
                </div>
              </div>
            ) : syncState.isConfigured ? (
              /* Case 2: Configured with Firebase, Ready to Create or Join! */
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#007AFF] border border-blue-200 shadow-xs">
                    <Cloud size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
                      Link Mom & Dad's Phones
                    </h3>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      Start a new family vault or join one already started by your spouse.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCreateVaultTrigger}
                    className="flex flex-col items-center text-center p-3.5 rounded-2xl border border-[#E5E5EA] bg-[#F8F9FB] hover:bg-white hover:border-[#007AFF] transition-all group active:scale-98 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center mb-2 shadow-xs group-hover:bg-[#007AFF] transition-colors">
                      <Plus size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] font-bold text-[#1C1C1E]">
                      Create Family Vault
                    </span>
                    <span className="text-[11px] text-[#8E8E93] mt-0.5">
                      Generates a code & uploads current medicines
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsJoinVaultOpen(true)}
                    className="flex flex-col items-center text-center p-3.5 rounded-2xl border border-[#E5E5EA] bg-[#F8F9FB] hover:bg-white hover:border-[#007AFF] transition-all group active:scale-98 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-white border border-[#E5E5EA] text-[#1C1C1E] flex items-center justify-center mb-2 shadow-xs group-hover:border-[#007AFF] transition-colors">
                      <Key size={15} strokeWidth={2.2} />
                    </div>
                    <span className="text-[13px] font-bold text-[#1C1C1E]">
                      Join Existing Vault
                    </span>
                    <span className="text-[11px] text-[#8E8E93] mt-0.5">
                      Enter the 6-character code from spouse
                    </span>
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFirebaseModalOpen(true)}
                    className="text-[11.5px] text-[#8E8E93] hover:text-[#1C1C1E] underline font-medium cursor-pointer"
                  >
                    Edit Firebase Keys
                  </button>
                </div>
              </div>
            ) : (
              /* Case 3: Not Configured yet */
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#FF9500] border border-amber-200 shadow-xs">
                    <Cloud size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
                      Connect Firebase Cloud Sync
                    </h3>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      Sync medicines live between Mom and Dad's phones using Google Firebase.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] text-[12px] text-[#3A3A3C] leading-relaxed flex flex-col gap-2">
                  <p>
                    <strong>Free Forever:</strong> Google Firebase provides 50,000 free reads/day—far more than two parents need.
                  </p>
                  <p className="text-[#8E8E93]">
                    Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#007AFF] underline">console.firebase.google.com</a>, enable Firestore in Test Mode, and paste your web config here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFirebaseModalOpen(true)}
                  className="w-full py-3 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key size={14} />
                  <span>Configure Firebase Keys</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Section 3: Caregiver Details                                 */}
        {/* ------------------------------------------------------------ */}
        <section className="flex flex-col gap-2.5">
          <div className="px-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
              Caregiver Settings
            </h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                <User size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="caregiver-name" className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                  Your Name (Caregiver)
                </label>
                <input
                  id="caregiver-name"
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="Dad"
                  className="w-full text-[16px] text-[#1C1C1E] font-bold bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                />
              </div>
            </div>

            <div className="h-px bg-[#F2F2F7]" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                <Phone size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="grandparents-phone" className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                  Default WhatsApp Phone Number
                </label>
                <input
                  id="grandparents-phone"
                  type="tel"
                  value={defaultPhone}
                  onChange={(e) => setDefaultPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-[16px] text-[#1C1C1E] font-bold bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={TOUCH_SPRING}
              type="submit"
              className="
                w-full h-11 rounded-2xl
                bg-[#1C1C1E] hover:bg-black active:bg-[#2C2C2E]
                text-white text-[13.5px] font-bold tracking-tight
                flex items-center justify-center gap-2 shadow-xs transition-colors mt-1
              "
            >
              {isSaved ? (
                <>
                  <Check size={16} className="text-[#34C759] stroke-[2.5]" />
                  <span>Preferences Saved</span>
                </>
              ) : (
                <span>Save Caregiver Settings</span>
              )}
            </motion.button>
          </form>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Section 3: Guide & Help                                      */}
        {/* ------------------------------------------------------------ */}
        <section className="flex flex-col gap-2.5">
          <div className="px-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
              Guide & Instructions
            </h2>
          </div>

          <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                <HelpCircle size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13.5px] font-bold text-[#1C1C1E]">
                  How to Use Sanjeevani
                </h4>
                <p className="text-[11.5px] text-[#8E8E93] mt-0.5 leading-relaxed">
                  Review 3D card guide explaining all features & real-life usage scenarios.
                </p>
              </div>
            </div>

            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                className="
                  px-3.5 py-1.5 rounded-full shrink-0
                  border border-[#E5E5EA] bg-[#F8F9FB] hover:bg-[#F2F2F7]
                  text-[#1C1C1E] text-[11.5px] font-bold
                  flex items-center gap-1 shadow-xs active:scale-95 transition-all
                "
              >
                <span>Open Guide</span>
              </button>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Section 4: Data Management                                   */}
        {/* ------------------------------------------------------------ */}
        <section className="flex flex-col gap-2.5">
          <div className="px-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
              Data Management
            </h2>
          </div>

          <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                <Database size={18} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-[#1C1C1E]">
                  Direct Device Storage
                </h4>
                <p className="text-[11.5px] text-[#8E8E93] mt-0.5 leading-relaxed">
                  All prescription inventory and count verifications are stored safely on this phone.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-[#8E8E93]">
                Reset All Records
              </span>
              <motion.button
                whileTap={{ scale: 0.94 }}
                transition={TOUCH_SPRING}
                type="button"
                onClick={handleReset}
                className="
                  px-3.5 py-1.5 rounded-full
                  border border-[#E5E5EA] bg-[#F8F9FB] hover:bg-[#F2F2F7]
                  text-[#FF3B30] text-[11.5px] font-semibold
                  flex items-center gap-1.5 shadow-xs transition-colors
                "
              >
                <RotateCcw size={12} />
                <span>Reset All Data</span>
              </motion.button>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------ */}
      {/* Delete Profile Confirmation Modal with Reassign Guardrail    */}
      {/* ------------------------------------------------------------ */}
      <AnimatePresence>
        {deletingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProfile(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative z-10 w-full max-w-sm rounded-3xl bg-white border border-[#E5E5EA] p-5 shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5 text-[#FF3B30]">
                <div className="h-9 w-9 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-[16px] font-bold text-[#1C1C1E]">
                  Delete {deletingProfile.name}?
                </h3>
              </div>

              {deletingProfile.linkedMedsCount > 0 ? (
                <div className="flex flex-col gap-3 text-xs text-[#3A3A3C]">
                  <p className="leading-relaxed">
                    <strong>{deletingProfile.name}</strong> currently has <strong>{deletingProfile.linkedMedsCount}</strong> active medication(s). What would you like to do with them?
                  </p>

                  <div className="flex flex-col gap-1.5 bg-[#F8F9FB] p-2.5 rounded-xl border border-[#E5E5EA]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                      Reassign to another person:
                    </label>
                    <select
                      value={reassignProfileId}
                      onChange={(e) => setReassignProfileId(e.target.value)}
                      className="w-full text-xs font-semibold text-[#1C1C1E] bg-white border border-[#E5E5EA] rounded-lg p-2 focus:outline-none"
                    >
                      {profiles
                        .filter(p => p.id !== deletingProfile.id)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(true)}
                      className="w-full py-2.5 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                    >
                      Reassign Medicines & Delete Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(false)}
                      className="w-full py-2.5 rounded-full border border-red-200 bg-red-50 text-[#FF3B30] text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete Medicines & Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingProfile(null)}
                      className="w-full py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    This profile has no active medicines. Are you sure you want to remove {deletingProfile.name}?
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingProfile(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-[#8E8E93] hover:bg-[#F2F2F7]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(false)}
                      className="px-5 py-2 rounded-full bg-[#FF3B30] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Firebase Config Modal */}
        {isFirebaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl border border-[#E5E5EA] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Key size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1C1E]">Firebase Cloud Setup</h3>
                    <p className="text-[11px] text-[#8E8E93]">Connect your shared Google Firestore</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFirebaseModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveFirebaseConfigSubmit} className="flex flex-col gap-3">
                {/* Auto-parse paste box */}
                <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                  <label className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                    <span>Quick Paste Firebase Snippet</span>
                    <span className="text-[10px] text-blue-600 font-normal">Auto-detects keys</span>
                  </label>
                  <textarea
                    value={rawSnippet}
                    onChange={(e) => handleRawSnippetChange(e.target.value)}
                    placeholder="Paste firebaseConfig object or JSON snippet here..."
                    rows={2}
                    className="w-full text-xs font-mono bg-white border border-blue-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-[#1C1C1E]"
                  />
                </div>

                <div className="flex items-center gap-2 my-0.5">
                  <div className="h-px bg-[#E5E5EA] flex-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">or enter manually</span>
                  <div className="h-px bg-[#E5E5EA] flex-1" />
                </div>

                {/* API Key */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    API Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs bg-[#F2F2F7] border border-transparent rounded-xl px-3 py-2 font-mono text-[#1C1C1E] focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Project ID */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    placeholder="sanjeevani-app-1234"
                    className="w-full text-xs bg-[#F2F2F7] border border-transparent rounded-xl px-3 py-2 font-mono text-[#1C1C1E] focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Auth Domain */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    Auth Domain <span className="font-normal text-[#8E8E93]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    placeholder="sanjeevani-app-1234.firebaseapp.com"
                    className="w-full text-xs bg-[#F2F2F7] border border-transparent rounded-xl px-3 py-2 font-mono text-[#1C1C1E] focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                  >
                    Save Firebase Credentials
                  </button>

                  {(syncState.isConfigured || syncState.configured) && (
                    <button
                      type="button"
                      onClick={handleRemoveFirebaseConfigSubmit}
                      className="w-full py-2 rounded-full border border-red-200 bg-red-50 text-[#FF3B30] text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      Clear Saved Credentials
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsFirebaseModalOpen(false)}
                    className="w-full py-1.5 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Join Family Vault Modal */}
        {isJoinVaultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl border border-[#E5E5EA] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1C1E]">Join Family Vault</h3>
                    <p className="text-[11px] text-[#8E8E93]">Sync with Mom or Dad's phone</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJoinVaultOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleJoinVaultSubmit} className="flex flex-col gap-4">
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Enter the 6-character code created on the other phone (e.g. from WhatsApp). Both phones will instantly stay in sync!
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    Family Vault Code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={12}
                    value={joinVaultCode}
                    onChange={(e) => setJoinVaultCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SANJ-4829"
                    className="w-full text-center text-lg tracking-widest font-mono font-bold bg-[#F2F2F7] border border-transparent rounded-xl py-3 text-[#1C1C1E] uppercase focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform hover:bg-blue-700"
                  >
                    Connect & Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJoinVaultOpen(false)}
                    className="w-full py-1.5 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Unlink Family Vault Modal */}
        {isUnlinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl border border-[#E5E5EA] flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1C1E]">Unlink from Family Vault?</h3>
                  <p className="text-[11px] text-[#8E8E93]">Disconnect cloud sync</p>
                </div>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                This phone will stop syncing new medicines and log updates with other family members. All existing medicines and history on this phone will be kept safe.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmUnlink}
                  className="w-full py-2.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform hover:bg-red-700"
                >
                  Unlink This Phone
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnlinkModalOpen(false)}
                  className="w-full py-1.5 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
