import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBG-G_cth5sGHPKMVzo9Ef81uZq5xxCtzU",
  authDomain: "holiday-a99.firebaseapp.com",
  projectId: "holiday-a99",
  storageBucket: "holiday-a99.firebasestorage.app",
  messagingSenderId: "630879654044",
  appId: "1:630879654044:web:aeaa0918b95fb55eb15d59",
  measurementId: "G-JEMDJJV5NJ"
};

// Singleton Pattern: Mencegah inisialisasi ulang saat hot-reload di Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (Client-side only)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };