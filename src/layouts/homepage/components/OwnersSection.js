// src/layouts/homepage/components/OwnersSection.js

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Grid, Card, Divider } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";
import ownersImage from "assets/images/bg-sign-up-cover.png";
import { useScrollAnimation, animationVariants, hoverVariants } from "hooks/useScrollAnimation";

// --- Componente FeatureIcon ---
function FeatureIcon({ color, children }) {
  return (
    <MDBox
      display="inline-flex"
      justifyContent="center"
      alignItems="center"
      width="4rem"
      height="4rem"
      bgColor={color}
      color="white"
      variant="gradient"
      borderRadius="lg"
      mb={2}
      sx={{
        transition: "transform 0.3s ease",
      }}
    >
      <Icon fontSize="large">{children}</Icon>
    </MDBox>
  );
}

FeatureIcon.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
// --- Fin del Componente FeatureIcon ---

// Datos para las características de dueños
const ownerFeatures = [
  {
    icon: "visibility",
    title: "Aumenta tu Visibilidad",
    description: "Llega a miles de jugadores activos buscando canchas en tu área.",
    color: "primary",
  },
  {
    icon: "event",
    title: "Gestión de Reservas",
    description: "Administra todas tus reservas desde un panel intuitivo y centralizado.",
    color: "info",
  },
  {
    icon: "bar_chart",
    title: "Estadísticas en Tiempo Real",
    description: "Analiza el rendimiento de tu negocio con reportes detallados.",
    color: "dark",
  },
  {
    icon: "devices",
    title: "Acceso Móvil",
    description: "Gestiona tu negocio desde cualquier lugar con nuestra app móvil.",
    color: "success",
  },
  {
    icon: "attach_money",
    title: "Maximiza Ingresos",
    description: "Reduce espacios vacíos y optimiza la ocupación de tus canchas.",
    color: "warning",
  },
  {
    icon: "sync_alt",
    title: "Automatización",
    description: "Confirma reservas automáticamente y reduce el trabajo manual.",
    color: "error",
  },
];

function OwnersSection() {
  const { ref, isInView } = useScrollAnimation({ once: true, amount: 0.15 });

  // Variantes diferentes para cada tarjeta
  const getCardVariants = (index) => {
    const variants = [
      animationVariants.fadeRight,
      animationVariants.scaleIn,
      animationVariants.fadeLeft,
      animationVariants.rotateIn,
      animationVariants.slideUp,
      animationVariants.fadeUp,
    ];
    return variants[index % variants.length];
  };

  return (
    <MDBox id="duenos" ref={ref} component="section" py={8} bgColor="white">
      <Container>
        <motion.div
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Parte 1: Introducción para Dueños */}
          <Grid container spacing={4} alignItems="center" mb={8}>
            <Grid item xs={12} md={6}>
              <motion.div variants={animationVariants.fadeLeft}>
                <MDTypography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    display: "inline-block",
                    backgroundColor: (theme) => theme.palette.goaltimeOrange.light,
                    color: (theme) => theme.palette.goaltimeOrange.dark,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "16px",
                  }}
                >
                  Soluciones para Dueños
                </MDTypography>
              </motion.div>
              <motion.div variants={animationVariants.fadeLeft}>
                <MDTypography variant="h3" mt={2} mb={3}>
                  Impulsa tu Negocio Deportivo
                </MDTypography>
              </motion.div>
              <motion.div variants={animationVariants.fadeLeft}>
                <MDTypography variant="body1" color="text" mb={3}>
                  Simplifica la administración de tus instalaciones deportivas y atrae más clientes
                  con nuestra plataforma todo en uno.
                </MDTypography>
              </motion.div>
              {/* Lista de beneficios */}
              <motion.div variants={animationVariants.fadeLeft}>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <MDBox color="goaltime.main" mr={1}>
                    <Icon>check_circle</Icon>
                  </MDBox>
                  <MDTypography variant="body2" color="text">
                    Sin comisiones iniciales - Empieza gratis
                  </MDTypography>
                </MDBox>
              </motion.div>
              <motion.div variants={animationVariants.fadeLeft}>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <MDBox color="goaltime.main" mr={1}>
                    <Icon>check_circle</Icon>
                  </MDBox>
                  <MDTypography variant="body2" color="text">
                    Configuración rápida en menos de 24 horas
                  </MDTypography>
                </MDBox>
              </motion.div>
              <motion.div variants={animationVariants.fadeLeft}>
                <MDBox display="flex" alignItems="center" mb={3}>
                  <MDBox color="goaltime.main" mr={1}>
                    <Icon>check_circle</Icon>
                  </MDBox>
                  <MDTypography variant="body2" color="text">
                    Soporte dedicado para tu negocio
                  </MDTypography>
                </MDBox>
              </motion.div>
              <motion.div variants={animationVariants.fadeLeft}>
                <motion.div
                  whileHover={hoverVariants.scale}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: "inline-block" }}
                >
                  <MDButton
                    variant="gradient"
                    component={Link}
                    to="/become-associate"
                    sx={{
                      backgroundColor: (theme) => theme.palette.goaltimeOrange.main,
                      color: (theme) => theme.palette.goaltimeOrange.contrastText,
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.goaltimeOrange.dark,
                      },
                    }}
                  >
                    Conoce Más para Dueños
                  </MDButton>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div variants={animationVariants.fadeRight} whileHover={hoverVariants.scale}>
                <Card sx={{ overflow: "hidden", position: "relative" }}>
                  <MDBox
                    component="img"
                    src={ownersImage}
                    alt="Panel de control de GoalTime"
                    width="100%"
                    height="25rem"
                    sx={{ objectFit: "cover" }}
                  />
                  <MDBox
                    position="absolute"
                    bottom={0}
                    left={0}
                    width="100%"
                    sx={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      backdropFilter: "blur(2px)",
                    }}
                    p={3}
                  >
                    <MDTypography variant="h6" color="white">
                      Panel de Control Intuitivo
                    </MDTypography>
                    <MDTypography variant="body2" color="white" opacity={0.8}>
                      Reseñas | Analytics
                    </MDTypography>
                  </MDBox>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Parte 2: Grid de Características */}
          <Grid container spacing={4}>
            {ownerFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  variants={getCardVariants(index)}
                  whileHover={hoverVariants.lift}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: "none",
                      border: "1px solid #E0E1E3",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: 4,
                        borderColor: "transparent",
                      },
                    }}
                  >
                    <MDBox p={3} textAlign="left">
                      <FeatureIcon color={feature.color}>{feature.icon}</FeatureIcon>
                      <MDTypography variant="h5" fontWeight="medium" mb={1}>
                        {feature.title}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {feature.description}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </MDBox>
  );
}

export default OwnersSection;
