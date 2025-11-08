// src/components/GuestRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function GuestRoute({ children }) {
  const { currentUser, userProfile } = useAuth();

  // Si hay un usuario logueado, redirigir según su rol
  if (currentUser && userProfile) {
    if (userProfile.role === "cliente") {
      return <Navigate to="/canchas" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si no hay usuario, muestra la página de login/registro/reset-password.
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
