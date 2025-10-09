// src/services/firebaseService.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Tu configuración de la aplicación web de Firebase (que ya tenías)
const firebaseConfig = {
  apiKey: "AIzaSyAYNTJFFdA7pPR3WGJv0mUTc328FRZ3gg8",
  authDomain: "goaltime-68101.firebaseapp.com",
  projectId: "goaltime-68101",
  storageBucket: "goaltime-68101.firebasestorage.app",
  messagingSenderId: "208497272561",
  appId: "1:208497272561:web:38bc4f42784da077dbeb50",
  measurementId: "G-66L288MXFS",
};

// Inicializar servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Registra un nuevo usuario en Firebase Auth y crea su documento en Firestore.
 * @param {string} name - Nombre del usuario.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 */
export const registerUser = async (name, email, password) => {
  try {
    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Crear el documento del usuario en la colección "users" de Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "cliente", // Rol por defecto al registrarse
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    // Manejo de errores (ej. email ya en uso)
    console.error("Error al registrar usuario:", error.code, error.message);
    throw error;
  }
};

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // Manejo de errores (ej. contraseña incorrecta)
    console.error("Error al iniciar sesión:", error.code, error.message);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logoutUser = () => {
  return signOut(auth);
};

// Exportamos 'auth' por si lo necesitamos para otras cosas, como onAuthStateChanged
export { auth, db };
