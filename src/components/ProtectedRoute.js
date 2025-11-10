// src/components/ProtectedRoute.js

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function ProtectedRoute({ children }) {
  const { currentUser, emailVerified, initialAuthLoading } = useAuth();
  const location = useLocation();

  // Esperar a que termine la carga inicial
  if (initialAuthLoading) {
    return null;
  }

  if (!currentUser) {
    // Si NO hay un usuario logueado, no le muestres la página protegida,
    // redirígelo a la página de inicio de sesión.
    return <Navigate to="/authentication/sign-in" state={{ from: location }} replace />;
  }

  // Verificar si es autenticación social (Google/Facebook ya vienen verificados)
  const isSocialAuth = currentUser.providerData?.some(
    (provider) => provider.providerId === "google.com" || provider.providerId === "facebook.com"
  );

  // IMPORTANTE: Verificar directamente desde currentUser.emailVerified para obtener el valor más reciente
  const isEmailVerified = currentUser.emailVerified || emailVerified;

  // Si hay un usuario pero el email NO está verificado Y no es autenticación social,
  // redirigir a la página de verificación
  if (!isEmailVerified && !isSocialAuth) {
    return <Navigate to="/authentication/verify-email" state={{ from: location }} replace />;
  }

  // Si hay un usuario y el email está verificado (o es autenticación social), muestra la página
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
