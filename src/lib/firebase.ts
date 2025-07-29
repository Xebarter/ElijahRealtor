import { app, auth, messaging } from './firebase/init';
import { getToken, onMessage } from 'firebase/messaging';

// Debug logs to check environment variables
console.log('Firebase env vars:', {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

// Export all components
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseMessaging = () => messaging;

// Export messaging functions directly
export { getToken, onMessage };

// Export types
export type { User } from 'firebase/auth';
