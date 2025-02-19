// // firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For Firestore
import { getStorage } from "firebase/storage"; // For Cloud Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6nQqo1D2NjD6yY4WgKJyOGTTn-qFVAvg",
  authDomain: "uploadvideos-9a8fc.firebaseapp.com",
  projectId: "uploadvideos-9a8fc",
  storageBucket: "uploadvideos-9a8fc.firebasestorage.app",
  messagingSenderId: "969899440176",
  appId: "1:969899440176:web:17bd1a80ca51e1681ad5f5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize the services you plan to use
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export the initialized Firebase app, Firestore, and Storage instances
export { app, firestore, storage };
