import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebase.js';

const VAULT_ID_KEY = 'sanjeevani_family_vault_id';
const LAST_SYNCED_KEY = 'sanjeevani_last_synced_at';
const COLLECTION_NAME = 'family_vaults';

// Sync status: 'unconfigured' | 'unlinked' | 'syncing' | 'synced' | 'offline' | 'error'
let currentSyncStatus = 'idle';
let currentError = null;
let activeUnsubscribe = null;
let lastPushedTimestamp = 0;
let debounceTimer = null;

const syncListeners = new Set();

function notifySyncListeners() {
  const state = getSyncState();
  syncListeners.forEach(fn => fn(state));
}

export function subscribeSyncState(fn) {
  syncListeners.add(fn);
  fn(getSyncState());
  return () => syncListeners.delete(fn);
}

export function getVaultId() {
  try {
    return localStorage.getItem(VAULT_ID_KEY);
  } catch {
    return null;
  }
}

export function setVaultId(id) {
  if (id) {
    localStorage.setItem(VAULT_ID_KEY, id.toUpperCase().trim());
  } else {
    localStorage.removeItem(VAULT_ID_KEY);
  }
  notifySyncListeners();
}

export function getLastSyncedAt() {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY);
  } catch {
    return null;
  }
}

export function setLastSyncedAt(isoString) {
  if (isoString) {
    localStorage.setItem(LAST_SYNCED_KEY, isoString);
  } else {
    localStorage.removeItem(LAST_SYNCED_KEY);
  }
  notifySyncListeners();
}

export function getSyncState() {
  const isConfigured = isFirebaseConfigured();
  const vaultId = getVaultId();
  const lastSynced = getLastSyncedAt();

  let computedStatus = currentSyncStatus;
  if (!isConfigured) {
    computedStatus = 'unconfigured';
  } else if (!vaultId) {
    computedStatus = 'unlinked';
  }

  return {
    isConfigured,
    isLinked: Boolean(vaultId),
    vaultId,
    lastSynced,
    status: computedStatus,
    error: currentError
  };
}

/**
 * Generates an easy-to-read, 6-character alphanumeric code for parents.
 * Example: SANJ-7842
 */
export function generateVaultCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing 0, 1, I, O
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SANJ-${code}`;
}

/**
 * Creates a brand new Family Vault in Firestore and links this device to it.
 */
export async function createFamilyVault(initialData) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Please add Firebase project keys in Settings.');
  }

  currentSyncStatus = 'syncing';
  notifySyncListeners();

  const vaultCode = generateVaultCode();
  const now = Date.now();
  const isoNow = new Date(now).toISOString();

  const payload = {
    vaultCode,
    version: 2,
    createdAt: isoNow,
    lastUpdated: now,
    data: {
      profiles: initialData.profiles || [],
      medicines: initialData.medicines || [],
      auditLogs: initialData.auditLogs || [],
      settings: initialData.settings || {}
    }
  };

  try {
    const vaultRef = doc(db, COLLECTION_NAME, vaultCode);
    await setDoc(vaultRef, payload);

    setVaultId(vaultCode);
    setLastSyncedAt(isoNow);
    lastPushedTimestamp = now;
    currentSyncStatus = 'synced';
    currentError = null;
    notifySyncListeners();

    return vaultCode;
  } catch (err) {
    currentSyncStatus = 'error';
    currentError = err.message || 'Failed to create Family Vault';
    notifySyncListeners();
    throw err;
  }
}

/**
 * Connects this phone to an existing Family Vault using the code shared from Mom or Dad.
 */
export async function joinFamilyVault(rawCode) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Please add Firebase project keys in Settings.');
  }

  const cleanCode = (rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Please enter a Family Vault code.');
  }

  currentSyncStatus = 'syncing';
  notifySyncListeners();

  try {
    const vaultRef = doc(db, COLLECTION_NAME, cleanCode);
    const snap = await getDoc(vaultRef);

    if (!snap.exists()) {
      throw new Error(`Vault code "${cleanCode}" not found. Please double check the code with your family.`);
    }

    const cloudPayload = snap.data();
    const isoNow = new Date().toISOString();

    setVaultId(cleanCode);
    setLastSyncedAt(isoNow);
    currentSyncStatus = 'synced';
    currentError = null;
    notifySyncListeners();

    return cloudPayload?.data || null;
  } catch (err) {
    currentSyncStatus = 'error';
    currentError = err.message || 'Failed to join Family Vault';
    notifySyncListeners();
    throw err;
  }
}

/**
 * Disconnects the phone from cloud sync without erasing local medicine data.
 */
export function unlinkFamilyVault() {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  setVaultId(null);
  setLastSyncedAt(null);
  currentSyncStatus = 'unlinked';
  currentError = null;
  notifySyncListeners();
}

/**
 * Starts a real-time Firestore listener to receive live changes made on the other device.
 */
export function subscribeToVault(vaultCode, onRemoteUpdate) {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const db = getFirebaseDb();
  if (!db || !vaultCode) return () => {};

  const vaultRef = doc(db, COLLECTION_NAME, vaultCode);

  activeUnsubscribe = onSnapshot(
    vaultRef,
    (docSnap) => {
      if (!docSnap.exists()) return;

      const remote = docSnap.data();
      if (!remote?.data) return;

      // Ignore echo updates that originated from our own recent push
      if (remote.lastUpdated && remote.lastUpdated <= lastPushedTimestamp) {
        return;
      }

      setLastSyncedAt(new Date().toISOString());
      currentSyncStatus = 'synced';
      currentError = null;
      notifySyncListeners();

      onRemoteUpdate(remote.data);
    },
    (err) => {
      console.warn('Realtime sync subscription error:', err);
      currentSyncStatus = 'error';
      currentError = err.message || 'Connection lost';
      notifySyncListeners();
    }
  );

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  };
}

/**
 * Debounced push to cloud whenever local medicines, counts, or profiles change.
 */
export function pushVaultUpdate(localData) {
  const vaultId = getVaultId();
  const db = getFirebaseDb();
  if (!vaultId || !db) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  currentSyncStatus = 'syncing';
  notifySyncListeners();

  debounceTimer = setTimeout(async () => {
    try {
      const now = Date.now();
      const vaultRef = doc(db, COLLECTION_NAME, vaultId);

      await setDoc(
        vaultRef,
        {
          lastUpdated: now,
          data: {
            profiles: localData.profiles || [],
            medicines: localData.medicines || [],
            auditLogs: localData.auditLogs || [],
            settings: localData.settings || {}
          }
        },
        { merge: true }
      );

      lastPushedTimestamp = now;
      setLastSyncedAt(new Date(now).toISOString());
      currentSyncStatus = 'synced';
      currentError = null;
      notifySyncListeners();
    } catch (err) {
      console.error('Failed to sync changes to cloud:', err);
      currentSyncStatus = 'error';
      currentError = err.message;
      notifySyncListeners();
    }
  }, 700);
}
