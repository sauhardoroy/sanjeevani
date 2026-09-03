/**
 * Project Sanjeevani — Storage Layer (LocalStorage + Reactive Pub-Sub)
 * Zero login required. Stores state directly on Dad's device.
 */

const STORAGE_KEY = 'sanjeevani_data';

export const INITIAL_DEMO_DATA = {
  settings: {
    caregiverName: 'Dad',
    grandparentsName: 'Mom & Dad',
    grandparentsPhone: '+91 98765 43210',
    checkinReminderTime: '09:00',
  },
  medicines: [
    {
      id: 'med-01',
      name: 'Metformin 500mg',
      purpose: 'Sugar / Diabetes',
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
      purpose: 'Blood Pressure',
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
      purpose: 'Heart & Circulation',
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
  auditLogs: [
    {
      id: 'log-01',
      medicineId: 'med-01',
      medicineName: 'Metformin 500mg',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      outcome: 'MATCHES_EXPECTED',
      wastedPillsCount: 0,
      fullStripsRemaining: 3,
      pillsOnActiveStrip: 8,
      note: 'Weekend visit: count matched expected consumption'
    },
    {
      id: 'log-02',
      medicineId: 'med-02',
      medicineName: 'Telmisartan 40mg',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      outcome: 'STRIP_DISCARDED_EARLY',
      wastedPillsCount: 4,
      fullStripsRemaining: 2,
      pillsOnActiveStrip: 14,
      note: 'Found silver strip discarded with 4 pills remaining; opened fresh strip'
    }
  ]
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
    return JSON.parse(raw);
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
  if (index >= 0) {
    data.medicines[index] = medicine;
  } else {
    data.medicines.push(medicine);
  }
  saveData(data);
  return medicine;
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
