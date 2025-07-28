import { initializeApp } from 'firebase/app';
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
const app = initializeApp(firebaseConfig);

// Register Auth component
import 'firebase/auth';

// Register Messaging component
import 'firebase/messaging';

// Initialize Auth
const auth = getAuth(app);

// Initialize Messaging
const messaging = getMessaging(app);

export { app, auth, messaging };
