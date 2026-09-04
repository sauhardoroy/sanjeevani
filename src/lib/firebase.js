import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

const FIREBASE_CONFIG_KEY = 'sanjeevani_firebase_config';

/**
 * Retrieve Firebase Configuration from either:
 * 1. Stored in localStorage (entered via Settings UI)
 * 2. Vite environment variables (.env)
 */
export function getFirebaseConfig() {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.apiKey && parsed?.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored Firebase config:', err);
  }

  // Fallback to Vite environment variables if configured
  const env = import.meta?.env || {};
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('Invalid Firebase configuration. apiKey and projectId are required.');
  }

  const cleanConfig = {
    apiKey: config.apiKey.trim(),
    authDomain: (config.authDomain || `${config.projectId}.firebaseapp.com`).trim(),
    projectId: config.projectId.trim(),
    storageBucket: (config.storageBucket || `${config.projectId}.appspot.com`).trim(),
    messagingSenderId: (config.messagingSenderId || '').trim(),
    appId: (config.appId || '').trim(),
  };

  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cleanConfig));

  // Reset singleton so next access reinitializes with the new config
  cachedDb = null;
  return cleanConfig;
}

export function clearFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  cachedDb = null;
}

export function isFirebaseConfigured() {
  return getFirebaseConfig() !== null;
}

let cachedDb = null;

/**
 * Get or initialize the Firestore Database singleton with offline persistence
 */
export function getFirebaseDb() {
  if (cachedDb) return cachedDb;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    let app;
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    // Try modern multi-tab offline persistence cache
    try {
      cachedDb = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      // If already initialized, fallback to default getFirestore
      cachedDb = getFirestore(app);
    }

    return cachedDb;
  } catch (err) {
    console.error('Error initializing Firebase / Firestore:', err);
    return null;
  }
}
