// src/layouts/homepage/components/TestimonialsSection.js

import React from "react";
import { motion, useInView } from "framer-motion";
import { Container, Grid, Card, Divider } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import PropTypes from "prop-types";

// Imágenes de avatar de ejemplo (reemplaza con las tuyas)
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

// Variantes de animación
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

// Datos de los testimonios
const testimonials = [
  {
    quote:
      "GoalTime me ha facilitado mucho organizar partidos con mis amigos. La reserva es instantánea y siempre encuentro canchas cerca de mi zona.",
    author: "Carlos Mendoza",
    title: "Jugador Amateur",
    avatar: team2,
  },
  {
    quote:
      "Desde que uso GoalTime, mis canchas tienen un 40% más de ocupación. La plataforma es muy fácil de usar y el soporte es excelente.",
    author: "María González",
    title: "Propietaria - Complejo Deportivo",
    avatar: team3,
  },
  {
    quote:
      "Perfecto para mis entrenamientos semanales. Puedo reservar con anticipación y sé que siempre tendré un espacio asegurado para mi equipo.",
    author: "Roberto Silva",
    title: "Entrenador de Fútbol",
    avatar: team4,
  },
];

// Componente para las estrellas de calificación
function renderStars() {
  return (
    <MDBox display="flex" color="warning.main" mb={1}>
      <Icon>star</Icon>
      <Icon>star</Icon>
      <Icon>star</Icon>
      <Icon>star</Icon>
      <Icon>star</Icon>
    </MDBox>
  );
}

function TestimonialsSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <MDBox
      id="testimonios"
      ref={ref}
      component="section"
      py={8}
      sx={{
        background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, #F0F2F5 100%)",
      }}
    >
      <Container>
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Cabecera de la Sección */}
          <MDBox textAlign="center" mb={6}>
            <motion.div variants={itemVariants}>
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
                Historias de Éxito
              </MDTypography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <MDTypography variant="h3" mt={2} mb={1}>
                Opiniones Reales, Resultados Reales
              </MDTypography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <MDTypography variant="body1" color="text">
                Descubre cómo GoalTime transforma la experiencia de jugadores y dueños de canchas en
                toda la comunidad deportiva.
              </MDTypography>
            </motion.div>
          </MDBox>

          {/* Grid de Testimonios */}
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.author}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ height: "100%", boxShadow: "lg" }}>
                    <MDBox p={3}>
                      {renderStars()}
                      {/* --- CORRECCIÓN DE COMILLAS --- */}
                      <MDTypography variant="body2" color="text" sx={{ minHeight: "100px" }}>
                        &ldquo;{testimonial.quote}&rdquo;
                      </MDTypography>
                      <Divider sx={{ my: 2 }} />
                      <MDBox display="flex" alignItems="center">
                        <MDAvatar src={testimonial.avatar} alt={testimonial.author} size="sm" />
                        <MDBox ml={2}>
                          <MDTypography variant="button" fontWeight="bold">
                            {testimonial.author}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {testimonial.title}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Calificación Promedio */}
          <motion.div variants={itemVariants}>
            <MDBox display="flex" justifyContent="center" alignItems="center" gap={1} mt={6}>
              <Icon color="warning">stars</Icon>
              <MDTypography variant="body2" color="text">
                Calificación promedio: <strong>4.9/5</strong> de 2,500+ reseñas
              </MDTypography>
            </MDBox>
          </motion.div>
        </motion.div>
      </Container>
    </MDBox>
  );
}

export default TestimonialsSection;
