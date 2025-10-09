// src/components/GuestRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function GuestRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    // Si hay un usuario logueado, no le muestres esta página,
    // redirígelo al dashboard.
    return <Navigate to="/dashboard" />;
  }

  // Si no hay usuario, muestra la página que corresponde (login, register).
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
