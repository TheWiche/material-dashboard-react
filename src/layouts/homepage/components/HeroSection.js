// src/layouts/homepage/components/HeroSection.js

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Grid, Card } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import heroBgImage from "assets/images/bg-sign-in.png";
import { useAuth } from "context/AuthContext";
import { animationVariants, hoverVariants } from "hooks/useScrollAnimation";

// Variantes de animación mejoradas y más fluidas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function HeroSection() {
  const { currentUser } = useAuth();
  return (
    <MDBox
      id="hero"
      display="flex"
      alignItems="center"
      minHeight="calc(100vh - 80px)"
      sx={{
        backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
          `${linearGradient(
            rgba(gradients.dark.main, 0.6),
            rgba(gradients.dark.state, 0.6)
          )}, url(${heroBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <Grid container justifyContent="center" textAlign="center">
          <Grid item xs={12} lg={10}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={badgeVariants}>
                <MDTypography
                  variant="body2"
                  color="white"
                  fontWeight="medium"
                  sx={{
                    display: "inline-block",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    px: 2,
                    py: 1,
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(5px)",
                  }}
                >
                  La mejor plataforma de reservas deportivas
                </MDTypography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <MDTypography variant="h1" color="white" mt={3} mb={2}>
                  Tu Cancha Perfecta, A Solo un Clic
                </MDTypography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <MDTypography variant="body1" color="white" mb={4}>
                  Encuentra y reserva canchas deportivas en tu área de forma fácil y rápida...
                </MDTypography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <MDBox display="flex" justifyContent="center" gap={2}>
                  <motion.div whileHover={hoverVariants.scale} whileTap={{ scale: 0.95 }}>
                    <MDButton
                      component={Link}
                      to={currentUser ? "/canchas" : "/authentication/sign-in"}
                      variant="gradient"
                      size="large"
                      startIcon={<Icon>search</Icon>}
                      sx={{
                        backgroundColor: (theme) => theme.palette.goaltime.main,
                        color: (theme) => theme.palette.goaltime.contrastText,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.goaltime.dark,
                        },
                      }}
                    >
                      Buscar Canchas Ahora
                    </MDButton>
                  </motion.div>
                </MDBox>
              </motion.div>
              <motion.div
                variants={animationVariants.staggerContainerFast}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3} justifyContent="center" sx={{ mt: 6 }}>
                  <Grid item xs={12} sm={4}>
                    <motion.div variants={statsVariants} whileHover={hoverVariants.lift}>
                      <Card
                        sx={{
                          backdropFilter: "blur(10px)",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <MDBox p={2}>
                          <MDTypography variant="h4" color="white">
                            ???+
                          </MDTypography>
                          <MDTypography variant="body2" color="white" opacity={0.8}>
                            Canchas Disponibles
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <motion.div variants={statsVariants} whileHover={hoverVariants.lift}>
                      <Card
                        sx={{
                          backdropFilter: "blur(10px)",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <MDBox p={2}>
                          <MDTypography variant="h4" color="white">
                            ??K+
                          </MDTypography>
                          <MDTypography variant="body2" color="white" opacity={0.8}>
                            Usuarios Activos
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <motion.div variants={statsVariants} whileHover={hoverVariants.lift}>
                      <Card
                        sx={{
                          backdropFilter: "blur(10px)",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <MDBox p={2}>
                          <MDTypography variant="h4" color="white">
                            ??K+
                          </MDTypography>
                          <MDTypography variant="body2" color="white" opacity={0.8}>
                            Reservas Realizadas
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </motion.div>
                  </Grid>
                </Grid>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </MDBox>
  );
}

export default HeroSection;
