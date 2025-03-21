// This file would contain your Firebase configuration and utility functions
// For example:

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
// In a real app, you would use environment variables for these values
const firebaseConfig = {
  apiKey: "AIzaSyBxd5A9RQH3olweqLAEdvvMZLMU_IV8v0o",
  authDomain: "attendance-774a8.firebaseapp.com",
  projectId: "attendance-774a8",
  storageBucket: "attendance-774a8.firebasestorage.app",
  messagingSenderId: "425279990265",
  appId: "1:425279990265:web:1a7dc8babcd2a6a165b528",
  measurementId: "G-Y7T8XG6FE3",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }

