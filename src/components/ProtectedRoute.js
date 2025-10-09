// src/components/ProtectedRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Si NO hay un usuario logueado, no le muestres la página protegida,
    // redirígelo a la página de inicio de sesión.
    return <Navigate to="/authentication/sign-in" />;
  }

  // Si hay un usuario, muestra la página que corresponde (dashboard, profile, etc.).
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
