// src/components/FullScreenLoader/index.js

import React from "react";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";
import logo from "assets/images/Logo.png";

export function FullScreenLoader() {
  return (
    // 👇 Usamos Fade para una transición de entrada y salida suave
    <Fade in timeout={300}>
      <Box
        sx={{
          // --- Estilos clave para el Overlay ---
          position: "fixed", // Se posiciona sobre toda la ventana
          top: 0,
          left: 0,
          width: "100vw", // Ocupa el 100% del ancho de la ventana
          height: "100vh", // Ocupa el 100% de la altura de la ventana
          zIndex: 9999, // Un z-index muy alto para estar siempre encima de todo

          // --- Estilos visuales ---
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semi-transparente
          backdropFilter: "blur(5px)", // Efecto de desenfoque para el fondo
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
    </Fade>
  );
}

export default FullScreenLoader;
