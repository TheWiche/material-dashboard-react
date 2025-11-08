// src/layouts/PublicLayout.js
/**
 * Este layout envuelve todas las páginas públicas (Homepage, About, Blog, etc.)
 * para asegurar que tengan el mismo Header y Footer.
 * Reemplaza al 'HomepageLayout.js' y al 'PublicLayout.js' básico que tenías.
 */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import MDBox from "components/MDBox";
import HomepageHeader from "layouts/homepage/components/HomepageHeader";
import HomepageFooter from "layouts/homepage/components/HomepageFooter";
import { useMaterialUIController, setLayout } from "context";

function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const [, dispatch] = useMaterialUIController();

  // Establecer el layout a "page" para que no se muestre el sidebar
  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname, dispatch]);

  const isHeaderLight = pathname !== "/";

  return (
    <MDBox
      width="100%"
      minHeight="100vh"
      // 👇 CAMBIO AQUÍ: Fondo gris claro para que las tarjetas resalten
      sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}
    >
      <HomepageHeader light={isHeaderLight} />
      {children}
      <HomepageFooter />
    </MDBox>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicLayout;
