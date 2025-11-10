// src/layouts/homepage/HomepageLayout.js
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import HomepageHeader from "layouts/homepage/components/HomepageHeader";
import HomepageFooter from "layouts/homepage/components/HomepageFooter";
import { useLocation } from "react-router-dom";
import { useMaterialUIController, setLayout } from "context";

function HomepageLayout({ children }) {
  const { pathname } = useLocation();
  const [, dispatch] = useMaterialUIController();

  // Establecer el layout a "page" para que no se muestre el sidebar
  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname, dispatch]);

  // Agregar smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // El header debe ser 'light' (fondo blanco) en todas las páginas
  // EXCEPTO en la homepage (/) que tiene la imagen hero.
  const isHeaderLight = pathname !== "/";

  return (
    <MDBox
      width="100%"
      minHeight="100vh"
      sx={{
        scrollBehavior: "smooth",
        // Mejorar el rendimiento del scroll
        willChange: "scroll-position",
        // Suavizar el scroll en iOS
        WebkitOverflowScrolling: "touch",
      }}
    >
      <HomepageHeader light={isHeaderLight} />
      {children}
      <HomepageFooter />
    </MDBox>
  );
}

HomepageLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HomepageLayout;
