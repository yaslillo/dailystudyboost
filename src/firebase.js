import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AQUI_TU_API_KEY",
  authDomain: "AQUI_TU_DOMAIN",
  projectId: "AQUI_TU_PROJECT_ID",
  storageBucket: "AQUI_TU_BUCKET",
  messagingSenderId: "AQUI_TU_ID",
  appId: "AQUI_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);