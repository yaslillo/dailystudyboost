import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdwKHadpACC4oXoEF2kmifHjKpM_nhg",
  authDomain: "dailystudyboost-f5160.firebaseapp.com",
  projectId: "dailystudyboost-f5160",
  storageBucket: "dailystudyboost-f5160.appspot.com",
  messagingSenderId: "848138886017",
  appId: "1:848138886017:web:abc..."
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);