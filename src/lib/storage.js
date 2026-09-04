/**
 * Project Sanjeevani — Storage Layer (LocalStorage + Reactive Pub-Sub)
 * Zero login required. Stores state directly on Dad's device.
 * Supports dynamic multi-profile architecture with robust backward compatibility.
 */

import { pushVaultUpdate } from './sync.js';

const STORAGE_KEY = 'sanjeevani_data';

export const DEFAULT_MEDICINE_IMAGES = {
  'med-01': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000', // Metformin (Pills & blister)
  'med-02': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=1000', // Telmisartan (Capsules)
  'med-03': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=1000', // Eco-sprin (Blister strip)
  default: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=1000'
};

export function getMedicineImage(medicine) {
  if (medicine?.imageUrl) return medicine.imageUrl;
  if (medicine?.id && DEFAULT_MEDICINE_IMAGES[medicine.id]) {
    return DEFAULT_MEDICINE_IMAGES[medicine.id];
  }
  return DEFAULT_MEDICINE_IMAGES.default;
}

export const INITIAL_PROFILES = [
  {
    id: 'prof-grandmother',
    name: 'Grandmother',
    phone: '+91 98765 43210'
  },
  {
    id: 'prof-grandfather',
    name: 'Grandfather',
    phone: '+91 98765 43210'
  }
];

export const INITIAL_DEMO_DATA = {
  settings: {
    caregiverName: 'Dad',
    grandparentsName: 'Mom & Dad',
    checkinReminderTime: '09:00',
  },
  profiles: INITIAL_PROFILES,
  medicines: [
    {
      id: 'med-01',
      name: 'Metformin 500mg',
      recipient: 'prof-grandmother',
      purpose: 'Sugar / Diabetes',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000',
      schedule: {
        timeOfDay: ['MORNING', 'NIGHT'],
        pillsPerDose: 1.0,
        foodRelation: 'AFTER_MEAL'
      },
      stripConfig: {
        tabletsPerStrip: 10,
        abandonmentBuffer: 3
      },
      stock: {
        fullStripsDelivered: 2,
        currentStripPillsLeft: 6,
        lastAuditDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0] // 1 day ago
      }
    },
    {
      id: 'med-02',
      name: 'Telmisartan 40mg',
      recipient: 'prof-grandfather',
      purpose: 'Blood Pressure',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=1000',
      schedule: {
        timeOfDay: ['MORNING'],
        pillsPerDose: 1.0,
        foodRelation: 'AFTER_MEAL'
      },
      stripConfig: {
        tabletsPerStrip: 14,
        abandonmentBuffer: 3
      },
      stock: {
        fullStripsDelivered: 1,
        currentStripPillsLeft: 3, // In critical drop zone (<= 4 pills)
        lastAuditDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: 'med-03',
      name: 'Eco-sprin 75mg',
      recipient: 'prof-grandfather',
      purpose: 'Heart & Circulation',
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=1000',
      schedule: {
        timeOfDay: ['NIGHT'],
        pillsPerDose: 1.0,
        foodRelation: 'AFTER_MEAL'
      },
      stripConfig: {
        tabletsPerStrip: 14,
        abandonmentBuffer: 3
      },
      stock: {
        fullStripsDelivered: 0,
        currentStripPillsLeft: 1, // Only 1 pill left! Red
        lastAuditDate: new Date().toISOString().split('T')[0]
      }
    }
  ],
  auditLogs: []
};

// Simple event-emitter for reactive updates across components
const listeners = new Set();

function notifyListeners() {
  const currentData = getData();
  listeners.forEach(fn => fn(currentData));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    const parsed = JSON.parse(raw);

    // Backward compatibility: Ensure profiles list exists
    if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      parsed.profiles = [
        {
          id: 'prof-grandmother',
          name: parsed.settings?.grandmotherName || 'Grandmother',
          phone: parsed.settings?.grandparentsPhone || '+91 98765 43210'
        },
        {
          id: 'prof-grandfather',
          name: parsed.settings?.grandfatherName || 'Grandfather',
          phone: parsed.settings?.grandparentsPhone || '+91 98765 43210'
        }
      ];
    } else {
      // Validate all profiles have id and name
      parsed.profiles = parsed.profiles.map((p, idx) => ({
        id: p.id || `prof-${idx + 1}`,
        name: p.name?.trim() || `Person ${idx + 1}`,
        phone: p.phone || ''
      }));
    }

    const defaultProfileId = parsed.profiles[0]?.id || 'prof-grandmother';
    const profileIdSet = new Set(parsed.profiles.map(p => p.id));

    // Normalize medicines and resolve recipient to valid profile id
    if (Array.isArray(parsed.medicines)) {
      parsed.medicines = parsed.medicines.map(m => {
        let recipientId = m.recipient || m.profileId;
        if (recipientId === 'GRANDMOTHER') recipientId = 'prof-grandmother';
        else if (recipientId === 'GRANDFATHER') recipientId = 'prof-grandfather';
        else if (!recipientId || !profileIdSet.has(recipientId)) {
          // If profile no longer exists or unspecified, fallback safely
          recipientId = defaultProfileId;
        }

        return {
          ...m,
          recipient: recipientId,
          imageUrl: m.imageUrl || getMedicineImage(m)
        };
      });
    } else {
      parsed.medicines = [];
    }

    // Normalize auditLogs
    if (Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs = parsed.auditLogs.map(log => {
        let recipientId = log.recipient || log.medicineRecipient;
        if (recipientId === 'GRANDMOTHER') recipientId = 'prof-grandmother';
        else if (recipientId === 'GRANDFATHER') recipientId = 'prof-grandfather';
        else if (!recipientId || !profileIdSet.has(recipientId)) {
          const med = parsed.medicines?.find(m => m.id === log.medicineId);
          recipientId = med?.recipient || defaultProfileId;
        }

        return {
          ...log,
          recipient: recipientId,
          medicineRecipient: recipientId
        };
      });
    } else {
      parsed.auditLogs = [];
    }

    if (!parsed.settings) {
      parsed.settings = INITIAL_DEMO_DATA.settings;
    }

    return parsed;
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return INITIAL_DEMO_DATA;
  }
}

export function saveData(data, shouldPushToCloud = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
    if (shouldPushToCloud) {
      pushVaultUpdate(data);
    }
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

/**
 * Apply remote updates received from Firebase Firestore live listener.
 * Merges cloud data into local storage without triggering an echo loop.
 */
export function applyRemoteData(remoteData) {
  if (!remoteData || typeof remoteData !== 'object') return null;
  const current = getData();

  const merged = {
    ...current,
    profiles: Array.isArray(remoteData.profiles) ? remoteData.profiles : current.profiles,
    medicines: Array.isArray(remoteData.medicines) ? remoteData.medicines : current.medicines,
    auditLogs: Array.isArray(remoteData.auditLogs) ? remoteData.auditLogs : current.auditLogs,
    settings: remoteData.settings ? { ...current.settings, ...remoteData.settings } : current.settings,
  };

  saveData(merged, false);
  return merged;
}

// ---------------------------------------------------------------------------
// Profiles CRUD
// ---------------------------------------------------------------------------

export function getProfiles() {
  return getData().profiles || INITIAL_PROFILES;
}

export function getProfileById(id) {
  const profiles = getProfiles();
  return profiles.find(p => p.id === id) || null;
}

export function addProfile(name, phone = '') {
  const trimmedName = name.trim();
  if (!trimmedName) return null;

  const data = getData();
  const newProfile = {
    id: 'prof-' + Date.now(),
    name: trimmedName,
    phone: phone.trim()
  };

  data.profiles.push(newProfile);
  saveData(data);
  return newProfile;
}

export function updateProfile(id, updates) {
  const data = getData();
  const index = data.profiles.findIndex(p => p.id === id);
  if (index === -1) return null;

  data.profiles[index] = {
    ...data.profiles[index],
    ...updates,
    name: updates.name ? updates.name.trim() : data.profiles[index].name,
    phone: updates.phone !== undefined ? updates.phone.trim() : data.profiles[index].phone
  };

  saveData(data);
  return data.profiles[index];
}

export function deleteProfile(id, reassignToProfileId = null) {
  const data = getData();
  // Guardrail: Cannot delete if only 1 profile left
  if (data.profiles.length <= 1) {
    return false;
  }

  // Handle linked medicines: reassign or remove
  if (reassignToProfileId && data.profiles.some(p => p.id === reassignToProfileId)) {
    data.medicines = data.medicines.map(m => {
      if (m.recipient === id || m.profileId === id) {
        return { ...m, recipient: reassignToProfileId, profileId: reassignToProfileId };
      }
      return m;
    });
    data.auditLogs = data.auditLogs.map(l => {
      if (l.recipient === id || l.medicineRecipient === id) {
        return { ...l, recipient: reassignToProfileId, medicineRecipient: reassignToProfileId };
      }
      return l;
    });
  } else {
    // Prune orphaned medicines and logs
    data.medicines = data.medicines.filter(m => m.recipient !== id && m.profileId !== id);
    data.auditLogs = data.auditLogs.filter(l => l.recipient !== id && l.medicineRecipient !== id);
  }

  // Remove profile
  data.profiles = data.profiles.filter(p => p.id !== id);
  saveData(data);
  return true;
}

// ---------------------------------------------------------------------------
// Medicines CRUD
// ---------------------------------------------------------------------------

export function getMedicines() {
  return getData().medicines || [];
}

export function getMedicineById(id) {
  const meds = getMedicines();
  return meds.find(m => m.id === id) || null;
}

export function saveMedicine(medicine) {
  const data = getData();
  const index = data.medicines.findIndex(m => m.id === medicine.id);
  const medWithImg = {
    ...medicine,
    imageUrl: medicine.imageUrl || getMedicineImage(medicine)
  };
  if (index >= 0) {
    data.medicines[index] = medWithImg;
  } else {
    data.medicines.push(medWithImg);
  }
  saveData(data);
  return medWithImg;
}

export function deleteMedicine(id) {
  const data = getData();
  data.medicines = data.medicines.filter(m => m.id !== id);
  saveData(data);
}

// ---------------------------------------------------------------------------
// Audit Logs & Settings
// ---------------------------------------------------------------------------

export function getAuditLogs() {
  return getData().auditLogs || [];
}

export function addAuditLog(logRecord) {
  const data = getData();
  data.auditLogs = [logRecord, ...(data.auditLogs || [])];
  saveData(data);
}

export function getSettings() {
  return getData().settings || INITIAL_DEMO_DATA.settings;
}

export function updateSettings(newSettings) {
  const data = getData();
  data.settings = { ...data.settings, ...newSettings };
  saveData(data);
}

export function resetToDemoData() {
  saveData(INITIAL_DEMO_DATA);
}
