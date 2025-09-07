// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBnJ7AOWggzZeVE-i4zZCq7R3sOvnhEVM",
  authDomain: "labs-463322.firebaseapp.com",
  projectId: "labs-463322",
  storageBucket: "labs-463322.firebasestorage.app",
  messagingSenderId: "137748040614",
  appId: "1:137748040614:web:2fc4b0d06f6c37ec109d67",
  measurementId: "G-WBX85GDG8C"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
