// src/layouts/blog/index.js

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import PublicLayout from "layouts/PublicLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { motion } from "framer-motion"; // 👈 Importar Motion

// Datos de ejemplo para los posts del blog
const blogPosts = [
  {
    title: "5 Consejos para Elegir la Cancha Sintética Perfecta",
    excerpt:
      "Aprende a identificar el tipo de césped, la iluminación y otros factores clave para que tu próximo partido sea inolvidable.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha1.jpg?alt=media&token=8540445f-4a00-4a81-9878-0d0505876402",
    date: "05 de Octubre, 2025",
  },
  {
    title: "Conviértete en Asociado GoalTime: Digitaliza tus Reservas",
    excerpt:
      "Descubre cómo nuestra plataforma te ayuda a maximizar la ocupación de tus canchas y reducir las llamadas.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha2.jpg?alt=media&token=d14605e5-f481-4b13-a444-245842817d33",
    date: "28 de Septiembre, 2025",
  },
  {
    // 👇 Añadí un post más para que se vea mejor la grilla
    title: "Beneficios del Fútbol para la Salud",
    excerpt:
      "No es solo un juego. Conoce los beneficios físicos y mentales de jugar fútbol regularmente con tus amigos.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha3.jpg?alt=media&token=98a3c89b-1e24-425b-a7e8-8a8d1681a9c3",
    date: "15 de Septiembre, 2025",
  },
];

function Blog() {
  return (
    <PublicLayout>
      {/* --- 1. Hero Oscuro para el Título --- */}
      <MDBox
        bgColor="dark"
        variant="gradient"
        minHeight="25vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <MDTypography variant="h2" color="white" fontWeight="bold">
          Blog de GoalTime
        </MDTypography>
      </MDBox>

      {/* --- 2. Contenido con Superposición --- */}
      <Container sx={{ mt: -8, py: 8 }}>
        <Grid container spacing={4}>
          {blogPosts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.title}>
              {/* --- 👇 Animación "Bacana" --- */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ height: "100%" }} // 👈 Asegura que el div de motion ocupe toda la altura
              >
                <Card
                  sx={{
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Contenedor para el efecto de zoom de la imagen */}
                  <MDBox sx={{ overflow: "hidden" }}>
                    <MDBox
                      component="img"
                      src={post.image}
                      alt={post.title}
                      width="100%"
                      height="14rem"
                      sx={{
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                  </MDBox>
                  <MDBox p={3} display="flex" flexDirection="column" flexGrow={1}>
                    <MDTypography variant="caption" color="text" mb={1}>
                      {post.date}
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                      {post.title}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={3}>
                      {post.excerpt}
                    </MDTypography>
                    {/* Empuja el botón al final */}
                    <MDBox mt="auto">
                      <MDButton variant="gradient" color="info" href="#" fullWidth>
                        Leer Más
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default Blog;
