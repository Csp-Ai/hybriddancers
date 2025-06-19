// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration should be provided via environment variables.
// This prevents leaking credentials in the repository.
const firebaseConfig = {
  apiKey: window.CONFIG?.FIREBASE_API_KEY || '',
  authDomain: window.CONFIG?.FIREBASE_AUTH_DOMAIN || '',
  projectId: window.CONFIG?.FIREBASE_PROJECT_ID || '',
  storageBucket: window.CONFIG?.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: window.CONFIG?.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: window.CONFIG?.FIREBASE_APP_ID || '',
  measurementId: window.CONFIG?.FIREBASE_MEASUREMENT_ID || ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

