// src/layouts/homepage/components/HomepageHeader.js

import { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
// import DefaultNavbarLink from "examples/Navbars/DefaultNavbar/DefaultNavbarLink"; // (No se estaba usando, lo comento)
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import logo from "assets/images/Logo.png";
import { useAuth } from "context/AuthContext";
import { logoutUser } from "services/firebaseService";

function HomepageHeader({ light: initialLight }) {
  const { userProfile, currentUser } = useAuth();
  const [navbar, setNavbar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(null);

  const { pathname } = useLocation();
  const isHomepage = pathname === "/"; // 👈 Esta es la variable clave
  const light = initialLight || navbar;

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const openAccountMenu = (event) => setAccountMenu(event.currentTarget);
  const closeAccountMenu = () => setAccountMenu(null);

  const handleLogout = () => {
    closeAccountMenu();
    logoutUser();
  };

  const changeBackground = () => {
    if (isHomepage) {
      window.scrollY >= 80 ? setNavbar(true) : setNavbar(false);
    } else {
      setNavbar(true);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    // Si estamos en móvil, cerramos el menú después de hacer scroll
    if (mobileMenuOpen) {
      handleMobileMenuToggle();
    }
  };

  useEffect(() => {
    changeBackground();
    window.addEventListener("scroll", changeBackground);
    return () => window.removeEventListener("scroll", changeBackground);
  }, [isHomepage, pathname]);

  // Contenido del menú deslizable mejorado
  const mobileMenu = (
    <Drawer anchor="left" open={mobileMenuOpen} onClose={handleMobileMenuToggle}>
      <MDBox px={2} py={3} width="260px">
        {/* Logo y nombre */}
        <MDBox display="flex" alignItems="center" mb={2}>
          <MDBox
            component={RouterLink}
            to="/"
            onClick={handleMobileMenuToggle}
            display="flex"
            alignItems="center"
          >
            <MDBox component="img" src={logo} alt="GoalTime Logo" width="2rem" />
            <MDTypography variant="h6" fontWeight="bold" color="dark" sx={{ ml: 1 }}>
              GoalTime
            </MDTypography>
          </MDBox>
        </MDBox>
        {/* Usuario autenticado */}
        {currentUser && (
          <MDBox display="flex" alignItems="center" mb={2}>
            <Avatar
              src={userProfile?.photoURL || ""}
              alt={userProfile?.name || "Usuario"}
              sx={{ width: 32, height: 32 }}
            >
              {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
            </Avatar>
            <MDTypography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
              {userProfile?.name || "Usuario"}
            </MDTypography>
          </MDBox>
        )}

        {/* 👇 --- MODIFICACIÓN 1: Ocultar enlaces de sección si NO es la homepage --- 👇 */}
        {isHomepage && (
          <>
            <MDBox mb={2}>
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="bold"
                sx={{ letterSpacing: 0.1 }}
              >
                Navegación
              </MDTypography>
            </MDBox>
            <List>
              <ListItem button onClick={() => scrollToSection("jugadores")}>
                <ListItemText primary="Jugadores" />
              </ListItem>
              <ListItem button onClick={() => scrollToSection("duenos")}>
                <ListItemText primary="Dueños" />
              </ListItem>
              <ListItem button onClick={() => scrollToSection("testimonios")}>
                <ListItemText primary="Testimonios" />
              </ListItem>
              <ListItem button onClick={() => scrollToSection("contacto")}>
                <ListItemText primary="Contáctanos" />
              </ListItem>
            </List>
          </>
        )}
        {/* 👇 --- Fin de la Modificación 1 --- 👇 */}

        <MDBox mt={3} display="flex" flexDirection="column" gap={1}>
          {currentUser ? (
            <MDButton
              variant="contained"
              color="error"
              fullWidth
              onClick={handleLogout}
              sx={{ fontWeight: 700 }}
            >
              <Icon sx={{ mr: 1 }}>logout</Icon>
              Cerrar Sesión
            </MDButton>
          ) : (
            <>
              <MDButton
                component={RouterLink}
                to="/authentication/sign-in"
                variant="outlined"
                color="success"
                fullWidth
                sx={{ fontWeight: 700, borderWidth: 2 }}
              >
                INICIAR SESIÓN
              </MDButton>
              <MDButton
                component={RouterLink}
                to="/authentication/sign-up"
                variant="contained"
                color="success"
                fullWidth
                sx={{ fontWeight: 700 }}
              >
                REGISTRARSE
              </MDButton>
            </>
          )}
        </MDBox>
      </MDBox>
    </Drawer>
  );

  // Menú desplegable del avatar del usuario
  const renderAccountMenu = (
    <Menu
      anchorEl={accountMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(accountMenu)}
      onClose={closeAccountMenu}
      sx={{ mt: 2 }}
    >
      <MenuItem
        component={RouterLink}
        to={userProfile?.role === "cliente" ? "/canchas" : "/dashboard"}
      >
        <Icon>dashboard</Icon>
        <MDTypography variant="button" sx={{ ml: 1 }}>
          Mi Panel
        </MDTypography>
      </MenuItem>
      <MenuItem component={RouterLink} to="/profile">
        <Icon>person</Icon>
        <MDTypography variant="button" sx={{ ml: 1 }}>
          Mi Perfil
        </MDTypography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Icon>logout</Icon>
        <MDTypography variant="button" color="error" sx={{ ml: 1 }}>
          Cerrar Sesión
        </MDTypography>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position="static" // Cambiado de "sticky" a "static" si usas PublicLayout
      elevation={navbar ? 4 : 0}
      sx={{
        backgroundColor: "white", // Fondo blanco por defecto
        backdropFilter: "none",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        // Si estás en la homepage (isHomepage=false) y el header NO es 'light',
        // el layout 'HeroSection' se encargará de poner el fondo oscuro.
        // Si el header es 'light' (isHomepage=true), se queda blanco.
        ...(isHomepage &&
          !light && {
            backgroundColor: "transparent", // Transparente solo en el Hero
            boxShadow: "none",
          }),
      }}
    >
      <Toolbar>
        <Container>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" py={1}>
            {/* Botón de Hamburguesa (Solo en móvil) */}
            <MDBox display={{ xs: "block", md: "none" }}>
              <IconButton onClick={handleMobileMenuToggle}>
                <Icon sx={{ color: "#222" }}>menu</Icon>
              </IconButton>
            </MDBox>

            {/* Logo */}
            <MDBox component={RouterLink} to="/" display="flex" alignItems="center">
              <MDBox component="img" src={logo} alt="GoalTime Logo" width="2rem" />
              <MDTypography
                variant="h6"
                fontWeight="bold"
                color="dark" // Siempre oscuro para el logo
                sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
              >
                GoalTime
              </MDTypography>
            </MDBox>

            {/* 👇 --- MODIFICACIÓN 2: Ocultar enlaces de sección si NO es la homepage --- 👇 */}
            {isHomepage && (
              <MDBox display={{ xs: "none", lg: "flex" }} alignItems="center" gap={2}>
                <MDButton onClick={() => scrollToSection("jugadores")}>Jugadores</MDButton>
                <MDButton onClick={() => scrollToSection("duenos")}>Dueños</MDButton>
                <MDButton onClick={() => scrollToSection("testimonios")}>Testimonios</MDButton>
                <MDButton onClick={() => scrollToSection("contacto")}>Contáctanos</MDButton>
              </MDBox>
            )}
            {/* 👇 --- Fin de la Modificación 2 --- 👇 */}

            {/* Botones de Autenticación O Avatar de Usuario */}
            <MDBox display={{ xs: "none", md: "flex" }} alignItems="center" gap={1}>
              {currentUser ? (
                <IconButton onClick={openAccountMenu} sx={{ p: 0 }}>
                  <Avatar
                    src={userProfile?.photoURL || ""}
                    alt={userProfile?.name || "Usuario"}
                    sx={{ width: 32, height: 32 }}
                  >
                    {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                  </Avatar>
                </IconButton>
              ) : (
                <>
                  <MDButton
                    component={RouterLink}
                    to="/authentication/sign-in"
                    variant="outlined"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700, borderWidth: 2 }}
                  >
                    INICIAR SESIÓN
                  </MDButton>
                  <MDButton
                    component={RouterLink}
                    to="/authentication/sign-up"
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  >
                    REGISTRARSE
                  </MDButton>
                </>
              )}
            </MDBox>
          </MDBox>
        </Container>
      </Toolbar>
      {mobileMenu}
      {renderAccountMenu}
    </AppBar>
  );
}

HomepageHeader.defaultProps = { light: false };
HomepageHeader.propTypes = { light: PropTypes.bool };

export default HomepageHeader;
