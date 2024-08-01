// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdzFzYaMEuq00XGkHOKF6q9HXp82yj784",
  authDomain: "pantrytracker-3dcb1.firebaseapp.com",
  projectId: "pantrytracker-3dcb1",
  storageBucket: "pantrytracker-3dcb1.appspot.com",
  messagingSenderId: "447095093352",
  appId: "1:447095093352:web:27fd5c5d8128a8164da3dd",
  measurementId: "G-ZXJH6E2YV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {app, firestore}