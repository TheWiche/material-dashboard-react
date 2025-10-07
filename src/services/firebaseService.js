// src/services/firebaseService.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Tu configuración de la aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAYNTJFFdA7pPR3WGJv0mUTc328FRZ3gg8",
  authDomain: "goaltime-68101.firebaseapp.com",
  projectId: "goaltime-68101",
  storageBucket: "goaltime-68101.firebasestorage.app",
  messagingSenderId: "208497272561",
  appId: "1:208497272561:web:38bc4f42784da077dbeb50",
  measurementId: "G-66L288MXFS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que necesitarás en tu aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Aquí centralizarás todas tus funciones de API, por ejemplo:
// export const login = (email, password) => { ... }
// export const register = (email, password) => { ... }
// etc.