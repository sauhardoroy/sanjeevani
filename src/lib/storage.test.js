import { 
  getData, 
  getProfiles, 
  getProfileById, 
  addProfile, 
  updateProfile, 
  deleteProfile, 
  saveMedicine 
} from './storage.js';
import { buildReminderMessage, getWhatsAppUrl } from './whatsapp.js';

// Setup Mock LocalStorage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {};

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
  console.log('  [PASS]', message);
}

console.log('Testing multi-profile storage & guardrails...');

// Test 1: Initial Default Data has profiles
localStorage.clear();
const initialData = getData();
assert(Array.isArray(initialData.profiles), 'Profiles array initialized');
assert(initialData.profiles.length === 2, 'Default profiles count is 2 (Grandmother & Grandfather)');
assert(initialData.profiles[0].id === 'prof-grandmother', 'First profile is prof-grandmother');

// Test 2: Add New Profile
const newProf = addProfile('Father (Ramesh)', '+919876543210');
assert(newProf !== null, 'addProfile returns created profile');
assert(newProf.name === 'Father (Ramesh)', 'Profile name matches');
assert(getProfiles().length === 3, 'Total profiles increased to 3');
assert(getProfileById(newProf.id)?.name === 'Father (Ramesh)', 'getProfileById returns new profile');

// Test 3: Update Profile
const updated = updateProfile(newProf.id, { name: 'Dad (Ramesh)', phone: '+919999988888' });
assert(updated.name === 'Dad (Ramesh)', 'Profile name updated');
assert(updated.phone === '+919999988888', 'Profile phone updated');

// Test 4: Add Medicine for New Profile
const medForDad = {
  id: 'med-dad-bp',
  name: 'Amlodipine 5mg',
  recipient: newProf.id,
  profileId: newProf.id,
  purpose: 'Blood Pressure',
  schedule: { timeOfDay: ['MORNING'], pillsPerDose: 1 },
  stripConfig: { tabletsPerStrip: 10, abandonmentBuffer: 3 },
  stock: { fullStripsDelivered: 2, currentStripPillsLeft: 8, lastAuditDate: new Date().toISOString() }
};
saveMedicine(medForDad);
const medCheck = getData().medicines.find(m => m.id === 'med-dad-bp');
assert(medCheck !== undefined, 'Medicine saved for dad');
assert(medCheck.recipient === newProf.id, 'Recipient ID matches dad profile');

// Test 5: WhatsApp Message reflects new profile name
const mockStatus = {
  color: 'amber',
  safeDays: 8,
  warningLine: 'Only 3 pills remaining on active strip',
  actionRequired: 'Monitor blister'
};
const waMessage = buildReminderMessage(medCheck, mockStatus, {}, 'DEFAULT', getProfiles());
assert(waMessage.includes('Dad (Ramesh)'), 'WhatsApp reminder dynamically names Dad (Ramesh)');
assert(waMessage.includes('Amlodipine 5mg'), 'WhatsApp reminder includes medicine name');

const waUrl = getWhatsAppUrl(medCheck, mockStatus, {}, getProfiles());
assert(waUrl.includes('919999988888'), 'WhatsApp URL targets profile custom phone number');

// Test 6: Delete Profile with Reassign Guardrail
const gmotherId = 'prof-grandmother';

// Reassign Dad's medicine to Grandmother upon deleting Dad
deleteProfile(newProf.id, gmotherId);
const reassignedMed = getData().medicines.find(m => m.id === 'med-dad-bp');
assert(reassignedMed !== undefined, 'Medicine was not deleted');
assert(reassignedMed.recipient === gmotherId, 'Medicine recipient reassigned to Grandmother');
assert(reassignedMed.profileId === gmotherId, 'Medicine profileId reassigned to Grandmother');

// Test 7: Delete Profile with Pruning (no reassign)
const tempProf = addProfile('Uncle Suresh');
saveMedicine({
  id: 'med-uncle-temp',
  name: 'Vitamin D',
  recipient: tempProf.id,
  profileId: tempProf.id,
  schedule: { timeOfDay: ['MORNING'], pillsPerDose: 1 },
  stripConfig: { tabletsPerStrip: 10, abandonmentBuffer: 3 },
  stock: { fullStripsDelivered: 1, currentStripPillsLeft: 10, lastAuditDate: new Date().toISOString() }
});
deleteProfile(tempProf.id, null); // delete and prune linked meds
const prunedMed = getData().medicines.find(m => m.id === 'med-uncle-temp');
assert(prunedMed === undefined, 'Medicine was pruned when profile deleted without reassign');

// Test 8: Last Profile Deletion Guardrail (Minimum 1 profile)
const remaining = getProfiles();
assert(remaining.length === 2, '2 profiles left');
deleteProfile(remaining[0].id, remaining[1].id);
assert(getProfiles().length === 1, '1 profile left');
const lastDeleteAttempt = deleteProfile(getProfiles()[0].id);
assert(lastDeleteAttempt === false, 'Cannot delete the only remaining profile');
assert(getProfiles().length === 1, 'Profile count remains 1');

// Test 9: Legacy Data Migration (GRANDMOTHER / GRANDFATHER string IDs)
mockStorage['sanjeevani_data'] = JSON.stringify({
  medicines: [
    { id: 'legacy-1', name: 'Legacy Pill A', recipient: 'GRANDMOTHER' },
    { id: 'legacy-2', name: 'Legacy Pill B', recipient: 'GRANDFATHER' }
  ],
  auditLogs: [
    { id: 'log-1', medicineRecipient: 'GRANDMOTHER' }
  ],
  settings: {
    grandmotherName: 'Amma',
    grandfatherName: 'Appa',
    whatsappNumber: '+911234567890'
  }
});
const migrated = getData();
assert(Array.isArray(migrated.profiles), 'Migrated data created profiles');
assert(migrated.profiles.find(p => p.id === 'prof-grandmother')?.name === 'Amma', 'Grandmother renamed to Amma from settings');
assert(migrated.profiles.find(p => p.id === 'prof-grandfather')?.name === 'Appa', 'Grandfather renamed to Appa from settings');
assert(migrated.medicines[0].recipient === 'prof-grandmother', 'Legacy medicine recipient normalized to prof-grandmother');
assert(migrated.medicines[1].recipient === 'prof-grandfather', 'Legacy medicine recipient normalized to prof-grandfather');
assert(migrated.auditLogs[0].medicineRecipient === 'prof-grandmother', 'Legacy audit log recipient normalized to prof-grandmother');

console.log('All multi-profile storage & guardrail tests passed successfully!');
