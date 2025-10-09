// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "services/firebaseService"; // Importamos el 'auth' de nuestro servicio

const AuthContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un listener de Firebase que se activa
    // cada vez que el estado de autenticación cambia (login/logout).
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Dejamos de cargar una vez que sabemos si hay usuario o no
    });

    // Cleanup: nos desuscribimos del listener cuando el componente se desmonte
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    // Aquí podrías añadir las funciones de login, register, etc. si quieres
    // llamarlas directamente desde el contexto, pero por ahora las llamaremos
    // desde las páginas de login/register directamente desde el servicio.
  };

  // No renderizamos la app hasta que termine de cargar el estado de auth
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};