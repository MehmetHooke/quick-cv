// Import the functions you need from the SDKs you need

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8dd1kpBGdjNHIsW45lLfPMH7jORMkXFk",
  authDomain: "quicklycv-be1bb.firebaseapp.com",
  projectId: "quicklycv-be1bb",
  storageBucket: "quicklycv-be1bb.firebasestorage.app",
  messagingSenderId: "839374465991",
  appId: "1:839374465991:web:80fb88397cfb2a0d1e07e2",
  measurementId: "G-M76LYQZE6L"
};

// Initialize Firebase
// 🔹 Firebase'i başlat
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };