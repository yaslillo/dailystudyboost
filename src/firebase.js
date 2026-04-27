// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdWkHadPAcC4ofxOEf2kmifiHjkPm_nhg",
  authDomain: "dailystudyboost-f5160.firebaseapp.com",
  projectId: "dailystudyboost-f5160",
  storageBucket: "dailystudyboost-f5160.firebasestorage.app",
  messagingSenderId: "848138886017",
  appId: "1:848138886017:web:abcc95f3cfca3b48262680"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);