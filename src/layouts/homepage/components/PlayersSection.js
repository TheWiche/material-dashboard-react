// src/layouts/homepage/components/PlayersSection.js

import React from "react";
import { motion } from "framer-motion";
import { Container, Grid, Card } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import { useScrollAnimation, animationVariants, hoverVariants } from "hooks/useScrollAnimation";

// Componente reutilizable para los íconos de características
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

// Datos de las tarjetas
const features = [
  {
    icon: "search",
    title: "Búsqueda Fácil",
    description: "Encuentra canchas por deporte, ubicación y disponibilidad en segundos.",
    color: "info",
  },
  {
    icon: "event_available",
    title: "Reserva Instantánea",
    description: "Confirma tu reserva al instante sin llamadas ni esperas.",
    color: "success",
  },
  {
    icon: "location_on",
    title: "Cerca de Ti",
    description: "Descubre las mejores canchas en tu área con mapas integrados.",
    color: "primary",
  },
  {
    icon: "schedule",
    title: "Horarios Flexibles",
    description: "Reserva en el horario que mejor se adapte a tu agenda.",
    color: "secondary",
  },
  {
    icon: "sports_soccer",
    title: "Múltiples Deportes",
    description: "Fútbol, pádel, baloncesto, tenis y más en una sola plataforma.",
    color: "warning",
  },
  {
    icon: "verified_user",
    title: "Reseñas Verificadas",
    description: "Lee opiniones de otros jugadores para elegir la mejor opción.",
    color: "error",
  },
];

function PlayersSection() {
  const { currentUser } = require("context/AuthContext");
  const { ref, isInView } = useScrollAnimation({ once: true, amount: 0.15 });

  // Variantes diferentes para cada tarjeta (alternando)
  const getCardVariants = (index) => {
    const variants = [
      animationVariants.fadeUp,
      animationVariants.scaleIn,
      animationVariants.fadeLeft,
      animationVariants.fadeRight,
      animationVariants.rotateIn,
      animationVariants.slideUp,
    ];
    return variants[index % variants.length];
  };

  return (
    <MDBox id="jugadores" ref={ref} component="section" py={8} bgColor="white">
      <Container>
        <motion.div
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Cabecera de la Sección */}
          <MDBox textAlign="center" mb={6}>
            <motion.div variants={animationVariants.fadeDown}>
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
                Soluciones para Jugadores
              </MDTypography>
            </motion.div>
            <motion.div variants={animationVariants.fadeUp}>
              <MDTypography variant="h3" mt={2} mb={1}>
                Juega, Reserva y Disfruta
              </MDTypography>
            </motion.div>
            <motion.div variants={animationVariants.fadeUp}>
              <MDTypography variant="body1" color="text">
                Encuentra, reserva y juega en las mejores canchas deportivas cerca de ti. ¡Tu
                partido ideal comienza aquí!
              </MDTypography>
            </motion.div>
          </MDBox>

          {/* Grid de Características */}
          <Grid container spacing={4}>
            {features.map((feature, index) => (
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
                    <MDBox p={3} textAlign="center">
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

          {/* Botón "Explora Canchas" */}
          <motion.div variants={animationVariants.fadeUp}>
            <MDBox display="flex" justifyContent="center" mt={6}>
              <motion.div whileHover={hoverVariants.scale} whileTap={{ scale: 0.95 }}>
                <MDButton
                  component={require("react-router-dom").Link}
                  to={currentUser ? "/canchas" : "/authentication/sign-in"}
                  variant="gradient"
                  startIcon={<Icon>explore</Icon>}
                  sx={{
                    backgroundColor: (theme) => theme.palette.goaltime.main,
                    color: (theme) => theme.palette.goaltime.contrastText,
                    "&:hover": {
                      backgroundColor: (theme) => theme.palette.goaltime.dark,
                    },
                  }}
                >
                  Explora Canchas
                </MDButton>
              </motion.div>
            </MDBox>
          </motion.div>
        </motion.div>
      </Container>
    </MDBox>
  );
}

export default PlayersSection;
