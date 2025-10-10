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
    setIsActionLoading(true); // Activa el loader
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
    throw error; // Lanza el error para que la UI lo atrape
  } finally {
    setIsActionLoading(false); // Siempre desactiva el loader
  }
};

export const loginUser = async (email, password, navigate, setIsActionLoading) => {
  try {
    setIsActionLoading(true); // Activa el loader
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      navigate("/canchas");
    }
  } catch (error) {
    throw error; // Lanza el error para que la UI lo atrape
  } finally {
    setIsActionLoading(false); // Siempre desactiva el loader
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export { auth, db };
