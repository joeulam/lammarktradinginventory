// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh2J1qppeeRFbnkISUwWbcaMe-u4OmCCA",
  authDomain: "lammarktrading-3513f.firebaseapp.com",
  projectId: "lammarktrading-3513f",
  storageBucket: "lammarktrading-3513f.firebasestorage.app",
  messagingSenderId: "466560423472",
  appId: "1:466560423472:web:f85b36bec8806f26e7fff5",
  measurementId: "G-2FCL9QJLH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);