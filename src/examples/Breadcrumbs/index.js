/**
=========================================================
* GoalTime App - v2.2.0
=========================================================

* Product Page: https://www.goaltime.site/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Mapeo de nombres amigables para las rutas
const routeNameMap = {
  dashboard: "Dashboard",
  admin: "Administración",
  users: "Usuarios",
  fields: "Canchas",
  associate: "Asociado",
  canchas: "Canchas",
  profile: "Perfil",
  tables: "Tablas",
  billing: "Facturación",
  notifications: "Notificaciones",
  reservations: "Mis Reservaciones",
};

function Breadcrumbs({ icon, title, route, light }) {
  // Asegurar que route sea un array
  const routeArray = Array.isArray(route) ? route : route.split("/").filter(Boolean);
  const routes = routeArray.slice(0, -1);
  const currentTitle = title.replace("-", " ");
  const displayTitle = routeNameMap[currentTitle.toLowerCase()] || currentTitle;

  // Formatear nombres de rutas para mostrar
  const formatRouteName = (routeName) => {
    return routeNameMap[routeName.toLowerCase()] || routeName;
  };

  return (
    <MDBox>
      {/* Breadcrumb Navigation - Más sutil y elegante */}
      {routes.length > 0 && (
        <MuiBreadcrumbs
          sx={{
            mb: 1,
            "& .MuiBreadcrumbs-separator": {
              color: ({ palette: { white, grey } }) => (light ? white.main : grey[400]),
              fontSize: "0.875rem",
              mx: 0.5,
            },
            "& .MuiBreadcrumbs-ol": {
              alignItems: "center",
            },
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            <MDBox
              display="flex"
              alignItems="center"
              sx={{
                opacity: light ? 0.7 : 0.6,
                transition: "opacity 0.2s",
                "&:hover": {
                  opacity: 1,
                },
              }}
            >
              <Icon
                sx={{
                  fontSize: "1rem",
                  color: light ? "white" : "text.secondary",
                  mr: 0.5,
                }}
              >
                {icon}
              </Icon>
              <MDTypography
                variant="caption"
                color={light ? "white" : "text.secondary"}
                fontWeight="medium"
                sx={{ textTransform: "none" }}
              >
                Inicio
              </MDTypography>
            </MDBox>
          </Link>
          {routes.map((el, index) => (
            <Link to={`/${el}`} key={el} style={{ textDecoration: "none" }}>
              <MDTypography
                component="span"
                variant="caption"
                fontWeight="medium"
                color={light ? "white" : "text.secondary"}
                sx={{
                  opacity: light ? 0.7 : 0.6,
                  transition: "opacity 0.2s",
                  textTransform: "none",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                {formatRouteName(el)}
              </MDTypography>
            </Link>
          ))}
        </MuiBreadcrumbs>
      )}

      {/* Título Principal - Más prominente y elegante */}
      <MDBox display="flex" alignItems="center" gap={1}>
        <MDTypography
          variant="h4"
          fontWeight="bold"
          color={light ? "white" : "dark"}
          sx={{
            letterSpacing: "-0.01562em",
            lineHeight: 1.2,
          }}
        >
          {displayTitle}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
