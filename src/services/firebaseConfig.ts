// src/services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA25wG0wnI6fq65-uSM0Q340t7F5iokigI",
  authDomain: "maharahtra-krida-website.firebaseapp.com",
  projectId: "maharahtra-krida-website",
  storageBucket: "maharahtra-krida-website.appspot.com",
  messagingSenderId: "951847687629",
  appId: "1:951847687629:web:99d22c29903f60f6b36084",
  measurementId: "G-5531PR6QR7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

export { db,auth };
