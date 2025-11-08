// src/App.js

import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes"; // Asegúrate que 'routes.js' incluya tu ruta para "homepage" en "/"
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import { useAuth } from "context/AuthContext";
import brandWhite from "assets/images/Logo.png";
import brandDark from "assets/images/Logo.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const { userProfile } = useAuth(); // AuthContext maneja el estado de carga inicial

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Tu lógica de filteredRoutes está PERFECTA. No la cambiamos.
  const filteredRoutes = useMemo(() => {
    const publicKeys = [
      "homepage", // Asegúrate de que tu ruta "/" tenga key: "homepage" en routes.js
      "about-us",
      "blog",
      "license",
      "become-associate",
      "privacy-policy",
      "terms-of-service",
    ];

    if (!userProfile) {
      return routes.filter(
        (route) =>
          publicKeys.includes(route.key) ||
          route.key === "sign-in" ||
          route.key === "sign-up" ||
          route.key === "reset-password" ||
          route.key === "confirm-reset-password"
      );
    }

    let userRoutes = routes.filter(
      (route) =>
        route.key !== "sign-in" &&
        route.key !== "sign-up" &&
        route.key !== "rtl" &&
        route.key !== "reset-password" &&
        route.key !== "confirm-reset-password"
    );

    if (userProfile.role === "cliente") {
      userRoutes = userRoutes.filter(
        (route) =>
          route.key !== "dashboard" &&
          route.key !== "admin-users" &&
          route.key !== "admin-fields" &&
          route.key !== "associate-fields" &&
          route.key !== "associate-reservations"
      );
    } else if (userProfile.role === "asociado") {
      userRoutes = userRoutes.filter(
        (route) => route.key !== "admin-users" && route.key !== "admin-fields"
      );
    } else if (userProfile.role === "admin") {
      // admin-fields ya no se muestra en el menú, la funcionalidad está en "Canchas"
      userRoutes = userRoutes.filter(
        (route) =>
          route.key !== "associate-fields" &&
          route.key !== "admin-fields" &&
          route.key !== "associate-reservations"
      );
    }

    return userRoutes;
  }, [userProfile]); // El 'userProfile' es provisto por AuthContext después de la carga inicial

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        // React Router v6 no usa 'exact', las rutas se hacen coincidir automáticamente
        return <Route path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  // Esta lógica también está PERFECTA.
  const showSidenav =
    layout === "dashboard" && !pathname.includes("/authentication") && pathname !== "/";

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {showSidenav && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brandDark}
            brandName="GoalTime"
            routes={filteredRoutes.filter((route) => route.type === "collapse")}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(filteredRoutes)}

        {/* 👇 LA CORRECCIÓN ESTÁ AQUÍ 👇 */}
        {/*
          En lugar de una redirección condicional, hacemos que cualquier ruta
          no encontrada simplemente redirija a la página de inicio.
          La lógica de 'filteredRoutes' y 'GuestRoute'/'ProtectedRoute'
          ya se encarga de decidir si el usuario debe estar en el login o en canchas.
        */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}
