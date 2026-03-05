import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAxe1tG4hLXOfiQdLBsEcx66k4jKe_7-VA",
  authDomain: "work-life-balance-analyser.firebaseapp.com",
  projectId: "work-life-balance-analyser",
  appId: "1:320894889344:web:4eb33137865f8d71de6565",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserSessionPersistence);