// src/examples/Footer/index.js

import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom"; // Se importa para enlaces internos

// @mui material components
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// GoalTime App base styles
import typography from "assets/theme/base/typography";

function Footer({ company, links }) {
  const { href, name } = company;
  const { size } = typography;

  const renderLinks = () =>
    links.map((link) => (
      <MDBox key={link.name} component="li" px={2} lineHeight={1}>
        {/* Lógica para diferenciar enlaces internos y externos */}
        {link.isInternal ? (
          <Link component={RouterLink} to={link.href}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              {link.name}
            </MDTypography>
          </Link>
        ) : (
          <Link href={link.href} target="_blank">
            <MDTypography variant="button" fontWeight="regular" color="text">
              {link.name}
            </MDTypography>
          </Link>
        )}
      </MDBox>
    ));

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
    >
      {/* 👇 SECCIÓN DE COPYRIGHT ACTUALIZADA */}
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={size.sm}
        px={1.5}
      >
        &copy; {new Date().getFullYear()}
        <Link href={home} target="_blank">
          <MDTypography variant="button" fontWeight="medium">
            &nbsp;{name}&nbsp;
          </MDTypography>
        </Link>
        . Todos los derechos reservados.
      </MDBox>
      <MDBox
        component="ul"
        sx={({ breakpoints }) => ({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          mt: 3,
          mb: 0,
          p: 0,
          [breakpoints.up("lg")]: {
            mt: 0,
          },
        })}
      >
        {renderLinks()}
      </MDBox>
    </MDBox>
  );
}

// 👇 VALORES POR DEFECTO ACTUALIZADOS
Footer.defaultProps = {
  company: { href: "#", name: "GoalTime" },
  links: [
    { href: "/about-us", name: "Sobre Nosotros", isInternal: true },
    { href: "/blog", name: "Blog", isInternal: true },
    { href: "/license", name: "Licencia", isInternal: true },
  ],
};

Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
