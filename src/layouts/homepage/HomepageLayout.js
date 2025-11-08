// src/layouts/homepage/HomepageLayout.js
import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import HomepageHeader from "layouts/homepage/components/HomepageHeader";
import HomepageFooter from "layouts/homepage/components/HomepageFooter";
import { useLocation } from "react-router-dom";

function HomepageLayout({ children }) {
  const { pathname } = useLocation();
  // El header debe ser 'light' (fondo blanco) en todas las páginas
  // EXCEPTO en la homepage (/) que tiene la imagen hero.
  const isHeaderLight = pathname !== "/";

  return (
    <MDBox
      width="100%"
      minHeight="100vh"
      // El fondo lo controla cada sección (Hero, PlayersSection, etc.)
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
