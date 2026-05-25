
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase Project: smile-platform-de93e
const firebaseConfig = {
  apiKey: "AIzaSyCC1zwvORT6_fOXjZeSpgrIzZHq5DwZYv0",
  authDomain: "smile-platform-de93e.firebaseapp.com",
  projectId: "smile-platform-de93e",
  storageBucket: "smile-platform-de93e.firebasestorage.app",
  messagingSenderId: "488557912136",
  appId: "1:488557912136:web:628ea4e47d724c543bb87d",
  measurementId: "G-ZQ6J6WN05L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
// This allows the app to work even if the network is disconnected, preventing "client is offline" errors
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firestore persistence not supported in this browser");
  }
});

export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Safe check for browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
