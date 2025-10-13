// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "services/firebaseService";
import PropTypes from "prop-types";
import { FullScreenLoader } from "components/FullScreenLoader";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          } else {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
        setUserProfile(null);
      } finally {
        setInitialAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    initialAuthLoading,
    isActionLoading,
    setIsActionLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 👇 LA LÓGICA HÍBRIDA DEFINITIVA 👇 */}

      {/* 1. Muestra el loader como overlay SOLO para acciones del usuario */}
      {isActionLoading && <FullScreenLoader />}

      {/* 2. Muestra el loader de forma bloqueante en la carga inicial, 
         o muestra la app si ya terminó. */}
      {initialAuthLoading ? <FullScreenLoader /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
