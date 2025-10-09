// src/services/firebaseService.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYNTJFFdA7pPR3WGJv0mUTc328FRZ3gg8",
  authDomain: "goaltime-68101.firebaseapp.com",
  projectId: "goaltime-68101",
  storageBucket: "goaltime-68101.appspot.com",
  messagingSenderId: "208497272561",
  appId: "1:208497272561:web:38bc4f42784da077dbeb50",
  measurementId: "G-66L288MXFS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const registerUser = async (name, email, password, navigate, setIsActionLoading) => {
  try {
    setIsActionLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "cliente",
      createdAt: serverTimestamp(),
    });
    navigate("/canchas");
  } catch (error) {
    console.error("Error al registrar usuario:", error.code, error.message);
    throw error;
  } finally {
    setIsActionLoading(false);
  }
};

// 👇 FUNCIÓN LOGINUSER CORREGIDA
export const loginUser = async (email, password, navigate, setIsActionLoading) => {
  let userCredential;
  try {
    setIsActionLoading(true);
    // 1. Intenta solo la autenticación primero
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (authError) {
    // Si esto falla, es un error de autenticación real
    console.error("Error de Autenticación:", authError.code);
    setIsActionLoading(false); // Detiene el loader
    throw authError; // Lanza el error para que la UI lo muestre
  }

  // Si la autenticación fue exitosa, el usuario ya está logueado.
  // Ahora, intenta obtener el perfil y navegar.
  try {
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userProfile = userDocSnap.data();
      if (userProfile.role === "cliente") {
        navigate("/canchas");
      } else {
        navigate("/dashboard");
      }
    } else {
      console.warn("Login exitoso, pero usuario sin perfil en Firestore.");
      navigate("/canchas"); // Navega a un lugar seguro por defecto
    }
  } catch (profileError) {
    // Si obtener el perfil falla, el login YA FUE EXITOSO.
    // No mostramos un error, solo un aviso en consola y navegamos a un lugar seguro.
    console.warn("Login exitoso, pero falló la obtención del perfil:", profileError);
    navigate("/canchas");
  } finally {
    // Esto se ejecuta después de la navegación
    setIsActionLoading(false);
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export { auth, db };
