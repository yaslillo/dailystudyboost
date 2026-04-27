import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Configuración REAL de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdWkHadPAcC4ofxOEf2kmifiHjkPm_nhg",
  authDomain: "dailystudyboost-f5160.firebaseapp.com",
  projectId: "dailystudyboost-f5160",
  storageBucket: "dailystudyboost-f5160.appspot.com",
  messagingSenderId: "848138886017",
  appId: "1:848138886017:web:abcc95f3cfca3b48262680"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Autenticación
export const auth = getAuth(app);

// 🧠 Base de datos (Firestore)
export const db = getFirestore(app);