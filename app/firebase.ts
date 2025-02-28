import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCh2J1qppeeRFbnkISUwWbcaMe-u4OmCCA",
  authDomain: "lammarktrading-3513f.firebaseapp.com",
  projectId: "lammarktrading-3513f",
  storageBucket: "lammarktrading-3513f.firebasestorage.app",
  messagingSenderId: "466560423472",
  appId: "1:466560423472:web:f85b36bec8806f26e7fff5",
  measurementId: "G-2FCL9QJLH7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Conditionally initialize Analytics
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized.");
  } else {
    console.log("Firebase Analytics not supported in this environment.");
  }
});

export { analytics };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
