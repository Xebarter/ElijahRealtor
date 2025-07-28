import { initializeApp, getApps } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Debug logs to check environment variables
console.log('Firebase env vars:', {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

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
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let messaging: ReturnType<typeof getMessaging>;

// Check if Firebase is already initialized
const existingApps = getApps();
if (existingApps.length > 0) {
  console.log('Using existing Firebase app:', existingApps[0].name);
  app = existingApps[0];
  auth = getAuth(app);
  messaging = getMessaging(app);
} else {
  try {
    console.log('Initializing Firebase app with config:', firebaseConfig);
    // Initialize app first
    app = initializeApp(firebaseConfig);
    
    // Register components
    import('firebase/auth').then(() => {
      // Auth is now registered
    });
    
    import('firebase/messaging').then(() => {
      // Messaging is now registered
    });
    
    // Wait for components to register
    setTimeout(() => {
      auth = getAuth(app);
      messaging = getMessaging(app);
    }, 1000); // Small delay to ensure components are registered
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Export all components
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseMessaging = () => messaging;

// Export messaging functions directly
export { getToken, onMessage };

// Export types
export type { User } from 'firebase/auth';
