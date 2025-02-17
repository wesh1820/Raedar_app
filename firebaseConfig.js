// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // For authentication
import { getFirestore } from "firebase/firestore";  // For Firestore


// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANdc5fvrC_YL0JAjWmFpd2_WIO3YcIzOA",
  authDomain: "raedar-e3b27.firebaseapp.com",
  projectId: "raedar-e3b27",
  storageBucket: "raedar-e3b27.firebasestorage.app",
  messagingSenderId: "885235949663",
  appId: "1:885235949663:web:d94bdad57b28147d1a3bea",
  measurementId: "G-4H5KSLG8WC"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Export auth and firestore for usage in your app
export { auth, firestore };
