// src/components/GuestRoute.js

import React from "react";
// 👇 Se elimina la importación de 'Navigate'
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";

function GuestRoute({ children }) {
  const { currentUser } = useAuth();

  // 👇 LÓGICA CORREGIDA
  if (currentUser) {
    // Si hay un usuario logueado, simplemente no renderices nada.
    // La redirección principal ya fue ordenada por firebaseService.
    return null;
  }

  // Si no hay usuario, muestra la página de login/registro.
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
