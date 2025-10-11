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
import routes from "routes";
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
  const { userProfile } = useAuth();

  // ... (funciones handle... no cambian)
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

  const filteredRoutes = useMemo(() => {
    // Estas son las rutas que SIEMPRE deben existir, sea cual sea el estado de autenticación.
    const publicKeys = ["about-us", "blog", "license", "become-associate"];

    if (!userProfile) {
      // Si no hay usuario, solo permite las rutas públicas y las de autenticación.
      return routes.filter(
        (route) =>
          publicKeys.includes(route.key) || route.key === "sign-in" || route.key === "sign-up"
      );
    }

    // Si hay un usuario logueado, empieza con todas las rutas...
    let userRoutes = routes.filter(
      (route) => route.key !== "sign-in" && route.key !== "sign-up" && route.key !== "rtl"
    );

    if (userProfile.role === "cliente") {
      // El cliente no ve el dashboard ni la gestión de usuarios
      userRoutes = userRoutes.filter(
        (route) => route.key !== "dashboard" && route.key !== "admin-users"
      );
    } else if (userProfile.role === "asociado") {
      // Un asociado (por ahora) tampoco ve la gestión de usuarios
      userRoutes = userRoutes.filter((route) => route.key !== "admin-users");
    }

    // El admin ve todo lo que no se filtró antes.
    return userRoutes;
  }, [userProfile]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
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

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && !pathname.includes("/authentication") && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brandDark}
            brandName="GoalTime"
            // 👇 Le pasamos al Sidenav solo las rutas que tienen 'type: "collapse"' para que no muestre las públicas
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
        <Route
          path="*"
          element={<Navigate to={userProfile ? "/canchas" : "/authentication/sign-in"} />}
        />
      </Routes>
    </ThemeProvider>
  );
}
