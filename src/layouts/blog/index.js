// src/layouts/blog/index.js

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Datos de ejemplo para los posts del blog
const blogPosts = [
  {
    title: "5 Consejos para Elegir la Cancha Sintética Perfecta",
    excerpt:
      "No todas las canchas son iguales. Aprende a identificar el tipo de césped, la iluminación y otros factores clave para que tu próximo partido sea inolvidable.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha1.jpg?alt=media&token=8540445f-4a00-4a81-9878-0d0505876402",
    date: "05 de Octubre, 2025",
  },
  {
    title: "Conviértete en Asociado GoalTime: Digitaliza tus Reservas",
    excerpt:
      "Descubre cómo nuestra plataforma puede ayudarte a maximizar la ocupación de tus canchas, reducir las llamadas y gestionar tu negocio de forma más eficiente.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/goaltime-334a0.appspot.com/o/cancha2.jpg?alt=media&token=d14605e5-f481-4b13-a444-245842817d33",
    date: "28 de Septiembre, 2025",
  },
];

function Blog() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h3" color="info" textGradient>
            Blog de GoalTime
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Noticias, consejos y todo sobre el mundo del fútbol amateur.
          </MDTypography>
        </MDBox>
        <Grid container spacing={3}>
          {blogPosts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.title}>
              <Card>
                <MDBox
                  component="img"
                  src={post.image}
                  alt={post.title}
                  borderRadius="lg"
                  shadow="md"
                  width="100%"
                  height="12rem"
                  sx={{ objectFit: "cover" }}
                />
                <MDBox p={3}>
                  <MDTypography variant="caption" color="text">
                    {post.date}
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" gutterBottom mt={1}>
                    {post.title}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    {post.excerpt}
                  </MDTypography>
                  <MDButton variant="gradient" color="info" href="#" fullWidth>
                    Leer Más
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Blog;
