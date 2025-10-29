// src/services/firebaseService.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken, // Se mantiene para las funciones de fetch
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

// --- INICIALIZACIÓN SIMPLE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// --- FIN DE LA INICIALIZACIÓN ---

// 👇 FUNCIÓN registerUser SIMPLIFICADA
// Ya no acepta 'navigate' ni 'setIsActionLoading'
export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userProfile = {
    uid: user.uid,
    name,
    email,
    role: "cliente",
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", user.uid), userProfile);
  return userProfile; // Devuelve el perfil
};

// 👇 FUNCIÓN loginUser SIMPLIFICADA
// Ya no acepta 'navigate' ni 'setIsActionLoading'
export const loginUser = async (email, password, rememberMe) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data(); // Devuelve el perfil
  }
  // Si no hay perfil, devuelve uno básico.
  return { uid: user.uid, email: user.email, name: user.email, role: "cliente" };
};

// --- EL RESTO DE FUNCIONES YA ESTÁN CORRECTAS ---

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      role: "cliente",
      createdAt: serverTimestamp(),
    });
  }
  const finalProfileSnap = await getDoc(userDocRef);
  return finalProfileSnap.data();
};

export const logoutUser = () => {
  return signOut(auth);
};

export const callCreateUserRequest = async (userData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay un usuario autenticado.");
    }
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/createUser";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a createUser (onRequest):", error);
    throw new Error(error.message || "Error al conectar con la función.");
  }
};

export const callCheckAuthContextRequest = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay un usuario autenticado.");
    }
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/checkAuthContext";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a checkAuthContext (onRequest):", error);
    throw new Error(error.message || "Error al verificar contexto (onRequest).");
  }
};

export const callToggleUserStatusRequest = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/toggleUserStatus";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }), // Envía el ID del usuario a modificar
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a toggleUserStatus:", error);
    throw new Error(error.message || "Error al cambiar estado del usuario.");
  }
};

export const callSetUserRoleRequest = async (userId, newRole) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/setUserRole";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, newRole }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a setUserRole:", error);
    throw new Error(error.message || "Error al cambiar rol del usuario.");
  }
};

export { auth, db };
