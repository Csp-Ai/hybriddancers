// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "7aA5rC8pB0OmIo6ps81bT2WqWNuBalnmur",
  authDomain: "hybriddancers.firebaseapp.com",
  projectId: "hybriddancers",
  storageBucket: "hybriddancers.appspot.com",
  messagingSenderId: "715829602062",
  appId: "1:715829602062:web:3b390d4f4cc1918b7701e1",
  measurementId: "G-RPBEMBX93F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

