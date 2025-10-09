/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom"; // 👈 1. Se importa useNavigate

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem"; // 👈 2. Se importa MenuItem
import Icon from "@mui/material/Icon";
import { Divider } from "@mui/material"; // Para el separador

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge";
import MDTypography from "components/MDTypography"; // 👈 3. Se importa MDTypography
import { useAuth } from "context/AuthContext"; // Para obtener los datos del usuario

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// 👈 4. Se importa la función de logout
import { logoutUser } from "services/firebaseService";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  // Estados para el menú de notificaciones
  const [openMenu, setOpenMenu] = useState(false);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // 👈 5. Se añaden estados y manejadores para el NUEVO menú de cuenta
  const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const handleOpenAccountMenu = (event) => setOpenAccountMenu(event.currentTarget);
  const handleCloseAccountMenu = () => setOpenAccountMenu(false);

  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate(); // 👈 6. Se inicializa el hook de navegación

  // 👈 7. Se crea la función para manejar el logout
  const handleLogout = async () => {
    handleCloseAccountMenu(); // Cierra el menú primero
    try {
      await logoutUser();
      navigate("/authentication/sign-in");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Menú de notificaciones (sin cambios)
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  // 👈 8. Se crea la función para renderizar el NUEVO menú de cuenta
  const renderAccountMenu = () => {
    const { userProfile } = useAuth(); // Obtenemos el perfil del usuario desde el contexto

    return (
      <Menu
        anchorEl={openAccountMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(openAccountMenu)}
        onClose={handleCloseAccountMenu}
        sx={{ mt: 2 }}
      >
        {/* Sección de Información del Usuario */}
        <MDBox px={2} py={1}>
          <MDTypography variant="h6">{userProfile ? userProfile.name : "Usuario"}</MDTypography>
          <MDTypography variant="button" color="text">
            {userProfile ? userProfile.email : ""}
          </MDTypography>

          {/* 👇 1. Se añade la lógica condicional para mostrar el rol */}
          {userProfile && (userProfile.role === "admin" || userProfile.role === "asociado") && (
            <MDBox mt={1}>
              <MDBadge
                badgeContent={userProfile.role}
                color={userProfile.role === "admin" ? "info" : "dark"}
                variant="gradient"
                size="sm"
              />
            </MDBox>
          )}
        </MDBox>

        <Divider sx={{ my: 1 }} />

        {/* Sección de Acciones */}
        <MenuItem component={Link} to="/profile" onClick={handleCloseAccountMenu}>
          <Icon>person</Icon>
          <MDTypography variant="button" sx={{ ml: 1 }}>
            Mi Perfil
          </MDTypography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout}>
          <Icon>logout</Icon>
          <MDTypography variant="button" color="error" sx={{ ml: 1 }}>
            Cerrar Sesión
          </MDTypography>
        </MenuItem>
      </Menu>
    );
  };

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <MDInput label="Busca aquí" />
            </MDBox>
            <MDBox color={light ? "white" : "inherit"}>
              {/* 👇 9. Se modifica el botón de cuenta para que abra el menú */}
              <IconButton
                sx={navbarIconButton}
                size="small"
                disableRipple
                onClick={handleOpenAccountMenu} // Se le asigna el manejador correcto
              >
                <Icon sx={iconsStyle}>account_circle</Icon>
              </IconButton>
              {/* Fin de la modificación */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
              {renderAccountMenu()} {/* 👈 10. Se renderiza el nuevo menú */}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// ... (defaultProps y propTypes sin cambios)
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
