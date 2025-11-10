// src/components/GuestRoute.js

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function GuestRoute({ children }) {
  const { currentUser, userProfile, emailVerified, initialAuthLoading } = useAuth();
  const location = useLocation();

  // Esperar a que termine la carga inicial
  if (initialAuthLoading) {
    return null;
  }

  // Si estamos en la página de verificación, permitir acceso incluso si hay usuario
  const isVerifyEmailPage = location.pathname === "/authentication/verify-email";
  const isSignUpPage = location.pathname === "/authentication/sign-up";

  // Si hay un usuario logueado y NO estamos en la página de verificación ni en sign-up
  // (permitir que sign-up redirija por sí mismo)
  if (currentUser && !isVerifyEmailPage && !isSignUpPage) {
    // Excluir usuarios que se autenticaron con Google/Facebook (ya vienen verificados)
    const isSocialAuth = currentUser.providerData?.some(
      (provider) => provider.providerId === "google.com" || provider.providerId === "facebook.com"
    );

    // IMPORTANTE: Verificar directamente desde currentUser.emailVerified para obtener el valor más reciente
    const isEmailVerified = currentUser.emailVerified || emailVerified;

    // Si el email no está verificado Y no es autenticación social, redirigir a verificación
    if (!isEmailVerified && !isSocialAuth) {
      return <Navigate to="/authentication/verify-email" replace />;
    }

    // Solo redirigir según rol si el email está verificado o es autenticación social
    // IMPORTANTE: Esperar a que el perfil se cargue antes de redirigir para evitar redirecciones incorrectas
    if (isEmailVerified || isSocialAuth) {
      // Si tenemos el perfil, redirigir según el rol
      if (userProfile) {
        if (userProfile.role === "cliente") {
          return <Navigate to="/canchas" replace />;
        } else {
          return <Navigate to="/dashboard" replace />;
        }
      }
      // Si no tenemos el perfil aún pero el email está verificado, NO redirigir
      // Permitir que la página se muestre y esperar a que el perfil se cargue
      // Esto evita la doble redirección (inicio -> dashboard -> canchas)
      return null; // O simplemente no hacer nada, dejar que se muestre la página
    }
  }

  // Si no hay usuario o estamos en la página de verificación, muestra la página
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
