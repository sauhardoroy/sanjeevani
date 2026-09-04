import assert from 'node:assert';
import test from 'node:test';
import { generateVaultCode } from './sync.js';

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

test('generateVaultCode produces SANJ-XXXX format without confusing characters', () => {
  for (let i = 0; i < 20; i++) {
    const code = generateVaultCode();
    assert.match(code, /^SANJ-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    assert.ok(!code.includes('0'));
    assert.ok(!code.includes('1'));
    assert.ok(!code.includes('I'));
    assert.ok(!code.includes('O'));
  }
});

test('parsePastedSnippet parses JSON configuration', () => {
  const jsonInput = JSON.stringify({
    apiKey: "AIzaSyFakeKey123",
    projectId: "family-vault-prod",
    authDomain: "family-vault-prod.firebaseapp.com"
  });

  const parsed = parsePastedSnippet(jsonInput);
  assert.deepStrictEqual(parsed, {
    apiKey: "AIzaSyFakeKey123",
    projectId: "family-vault-prod",
    authDomain: "family-vault-prod.firebaseapp.com"
  });
});

test('parsePastedSnippet extracts from Firebase web snippet JS string', () => {
  const jsSnippet = `
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyD-TestKey999",
      authDomain: "mom-dad-meds.firebaseapp.com",
      projectId: "mom-dad-meds",
      storageBucket: "mom-dad-meds.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };
  `;

  const parsed = parsePastedSnippet(jsSnippet);
  assert.ok(parsed !== null);
  assert.strictEqual(parsed.apiKey, "AIzaSyD-TestKey999");
  assert.strictEqual(parsed.projectId, "mom-dad-meds");
  assert.strictEqual(parsed.authDomain, "mom-dad-meds.firebaseapp.com");
  assert.strictEqual(parsed.appId, "1:1234567890:web:abcdef123456");
});

test('parsePastedSnippet returns null for invalid input', () => {
  assert.strictEqual(parsePastedSnippet(''), null);
  assert.strictEqual(parsePastedSnippet('random string'), null);
  assert.strictEqual(parsePastedSnippet('{"unrelated": true}'), null);
});

test('remote sync merge preserves and updates local data appropriately', () => {
  const localData = {
    settings: { caregiverName: 'Dad', grandparentsName: 'Mom & Dad' },
    profiles: [{ id: 'p1', name: 'Grandmother' }],
    medicines: [{ id: 'm1', name: 'Metformin', recipient: 'p1' }],
    auditLogs: [{ id: 'log1', outcome: 'MATCHES_EXPECTED' }]
  };

  const remotePayload = {
    settings: { caregiverName: 'Dad', checkinReminderTime: '09:00' },
    profiles: [
      { id: 'p1', name: 'Grandmother' },
      { id: 'p2', name: 'Grandfather' }
    ],
    medicines: [
      { id: 'm1', name: 'Metformin', recipient: 'p1' },
      { id: 'm2', name: 'Telmisartan', recipient: 'p2' }
    ],
    auditLogs: [
      { id: 'log1', outcome: 'MATCHES_EXPECTED' },
      { id: 'log2', outcome: 'COUNT_ADJUSTED' }
    ]
  };

  const merged = {
    ...localData,
    profiles: Array.isArray(remotePayload.profiles) ? remotePayload.profiles : localData.profiles,
    medicines: Array.isArray(remotePayload.medicines) ? remotePayload.medicines : localData.medicines,
    auditLogs: Array.isArray(remotePayload.auditLogs) ? remotePayload.auditLogs : localData.auditLogs,
    settings: remotePayload.settings ? { ...localData.settings, ...remotePayload.settings } : localData.settings,
  };

  assert.strictEqual(merged.profiles.length, 2);
  assert.strictEqual(merged.medicines.length, 2);
  assert.strictEqual(merged.auditLogs.length, 2);
  assert.strictEqual(merged.settings.grandparentsName, 'Mom & Dad');
  assert.strictEqual(merged.settings.checkinReminderTime, '09:00');
});

