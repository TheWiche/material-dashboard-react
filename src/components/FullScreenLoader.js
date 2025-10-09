// src/components/FullScreenLoader/index.js

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
// 👇 ¡OJO! Asegúrate de que la ruta a tu logo sea correcta.
// Por ejemplo, si tu logo está en 'src/assets/images/logo.png'
import logo from "assets/images/LogoRecortado.png"; // Usando un logo de la plantilla como ejemplo

function FullScreenLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="GoalTime Logo"
        sx={{
          width: 150,
          mb: 3,
        }}
      />
      <CircularProgress color="info" />
      <Typography sx={{ mt: 2, color: "text.secondary" }}>Cargando...</Typography>
    </Box>
  );
}

export default FullScreenLoader;
