import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBokR7WzMT-gE9qno1VEeLkxx3Ob1yC66Y",
  authDomain: "aurameter-5953d.firebaseapp.com",
  databaseURL:
    "https://aurameter-5953d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aurameter-5953d",
  storageBucket: "aurameter-5953d.firebasestorage.app",
  messagingSenderId: "597392055580",
  appId: "1:597392055580:web:111d4fc99556cc59a76ed9",
  measurementId: "G-SFL9W9DDRS",
};

// Prevent re-initialization during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
