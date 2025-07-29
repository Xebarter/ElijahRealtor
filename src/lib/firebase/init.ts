import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

// Ensure environment variables are available
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error('Firebase API key is not configured');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
let firebaseApp: ReturnType<typeof initializeApp>;
let firebaseAuth: ReturnType<typeof getAuth>;
let firebaseMessaging: ReturnType<typeof getMessaging>;

// Check if Firebase is already initialized
const existingApps = getApps();
if (existingApps.length > 0) {
  console.log('Using existing Firebase app:', existingApps[0].name);
  firebaseApp = existingApps[0];
  firebaseAuth = getAuth(firebaseApp);
  firebaseMessaging = getMessaging(firebaseApp);
} else {
  try {
    console.log('Initializing Firebase app with config:', firebaseConfig);
    // Initialize app first
    firebaseApp = initializeApp(firebaseConfig);
    
    // Register components
    import('firebase/auth').then((authModule) => {
      // Auth is now registered
      firebaseAuth = getAuth(firebaseApp);
    });
    
    import('firebase/messaging').then((messagingModule) => {
      // Messaging is now registered
      firebaseMessaging = getMessaging(firebaseApp);
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Export all components
export { firebaseApp as app, firebaseAuth as auth, firebaseMessaging as messaging };
