/**
 * Project Sanjeevani — Storage Layer (LocalStorage + Reactive Pub-Sub)
 * Zero login required. Stores state directly on Dad's device.
 */

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

export const INITIAL_DEMO_DATA = {
  settings: {
    caregiverName: 'Dad',
    grandparentsName: 'Mom & Dad',
    grandmotherName: 'Grandmother',
    grandfatherName: 'Grandfather',
    grandparentsPhone: '+91 98765 43210',
    checkinReminderTime: '09:00',
  },
  medicines: [
    {
      id: 'med-01',
      name: 'Metformin 500mg',
      recipient: 'GRANDMOTHER',
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
      recipient: 'GRANDFATHER',
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
      recipient: 'GRANDFATHER',
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
    if (Array.isArray(parsed.medicines)) {
      parsed.medicines = parsed.medicines.map(m => ({
        ...m,
        imageUrl: m.imageUrl || getMedicineImage(m),
        recipient: m.recipient || (m.name?.toLowerCase().includes('metformin') ? 'GRANDMOTHER' : 'GRANDFATHER')
      }));
    }
    if (Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs = parsed.auditLogs.map(log => {
        if (!log.recipient) {
          const med = parsed.medicines?.find(m => m.id === log.medicineId);
          return {
            ...log,
            recipient: med?.recipient || (log.medicineName?.toLowerCase().includes('metformin') ? 'GRANDMOTHER' : 'GRANDFATHER')
          };
        }
        return log;
      });
    }
    if (parsed.settings) {
      parsed.settings = {
        grandmotherName: 'Grandmother',
        grandfatherName: 'Grandfather',
        ...parsed.settings
      };
    }
    return parsed;
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return INITIAL_DEMO_DATA;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

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
