import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyCEFp5k2K9rBAEq0HhPwgq3pp2M5ZdM9lk",
  authDomain: "lms-mobile-ce2d3.firebaseapp.com",
  projectId: "lms-mobile-ce2d3",
  storageBucket: "lms-mobile-ce2d3.firebasestorage.app",
  messagingSenderId: "312650134580",
  appId: "1:312650134580:web:908fe23bd92e72dcef8661"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
