import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeIZl0BhzO11jHME_DQglX2Ojtno_oU6c",
  authDomain: "musi-deo.firebaseapp.com",
  projectId: "musi-deo",
  storageBucket: "musi-deo.firebasestorage.app",
  messagingSenderId: "226146893891",
  appId: "1:226146893891:web:dcb2677b05c7192e1454f6",
  measurementId: "G-MRJX6FSHKV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
