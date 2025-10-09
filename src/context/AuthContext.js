// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "services/firebaseService";
import PropTypes from "prop-types";
import FullScreenLoader from "components/FullScreenLoader";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true); // Renombrado para claridad

  // 👇 1. Se añade un nuevo estado para cargas iniciadas por el usuario
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ... (lógica para obtener el perfil de usuario no cambia)
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
        setInitialAuthLoading(false); // Solo se desactiva la carga inicial
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    initialAuthLoading,
    isActionLoading,
    setIsActionLoading, // 👈 2. Se exporta la función para poder activarla
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 👇 3. El loader se muestra si la carga inicial O una acción están activas */}
      {initialAuthLoading || isActionLoading ? <FullScreenLoader /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
