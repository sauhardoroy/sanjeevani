import { 
  calculateDailyBurnRate, 
  evaluateMedicineStatus, 
  reconcileAudit 
} from './depletion.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
  console.log('  [PASS]', message);
}

console.log('Testing depletion.js math engine...');

// Test 1: Daily Burn Rate
const burn1 = calculateDailyBurnRate(['MORNING', 'NIGHT'], 1.0);
assert(burn1 === 2, 'Burn rate for 2 doses of 1 pill = 2 pills/day');

const burn2 = calculateDailyBurnRate(['MORNING'], 0.5);
assert(burn2 === 0.5, 'Burn rate for half pill once daily = 0.5 pills/day');

// Test 2: Early Abandonment Trigger (<= 4 pills remaining on active strip)
const testMedAmber = {
  id: 'med-amber',
  name: 'Telmisartan 40mg',
  schedule: { timeOfDay: ['MORNING'], pillsPerDose: 1 },
  stripConfig: { tabletsPerStrip: 10, abandonmentBuffer: 3 },
  stock: { fullStripsDelivered: 1, currentStripPillsLeft: 3, lastAuditDate: new Date().toISOString() }
};

const statusAmber = evaluateMedicineStatus(testMedAmber);
assert(statusAmber.color === 'amber', 'Active strip with 3 pills triggers AMBER');
assert(statusAmber.type === 'ABANDONMENT_RISK', 'Type is ABANDONMENT_RISK');
assert(statusAmber.warningLine.includes('Only 3 pills left'), 'Warning includes exact remaining count');

// Test 3: Refill Trigger (<= 2 days)
const testMedRed = {
  id: 'med-red',
  name: 'Eco-sprin 75mg',
  schedule: { timeOfDay: ['MORNING'], pillsPerDose: 1 },
  stripConfig: { tabletsPerStrip: 10, abandonmentBuffer: 3 },
  stock: { fullStripsDelivered: 0, currentStripPillsLeft: 1, lastAuditDate: new Date().toISOString() }
};

const statusRed = evaluateMedicineStatus(testMedRed);
assert(statusRed.color === 'red', 'Total pills <= 2 days triggers RED');
assert(statusRed.type === 'REFILL_NOW', 'Type is REFILL_NOW');

// Test 4: Safe Stock (Green)
const testMedGreen = {
  id: 'med-green',
  name: 'Metformin 500mg',
  schedule: { timeOfDay: ['MORNING', 'NIGHT'], pillsPerDose: 1 },
  stripConfig: { tabletsPerStrip: 10, abandonmentBuffer: 3 },
  stock: { fullStripsDelivered: 3, currentStripPillsLeft: 8, lastAuditDate: new Date().toISOString() }
};

const statusGreen = evaluateMedicineStatus(testMedGreen);
assert(statusGreen.color === 'green', 'Stock with > 7 safe days is GREEN');
assert(statusGreen.safeDays >= 10, 'Safe days calculation accounts for abandonment buffer');

// Test 5: Reconcile Strip Discarded Early
const { updatedMedicine, auditRecord } = reconcileAudit(testMedAmber, 'STRIP_DISCARDED_EARLY');
assert(updatedMedicine.stock.fullStripsDelivered === 0, 'Full strips decremented from 1 to 0');
assert(updatedMedicine.stock.currentStripPillsLeft === 10, 'New strip opened with 10 pills');
assert(auditRecord.wastedPillsCount === 3, 'Logged 3 pills wasted');
assert(auditRecord.outcome === 'STRIP_DISCARDED_EARLY', 'Audit outcome logged correctly');

console.log('All depletion math engine tests passed successfully!');
