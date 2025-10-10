// src/layouts/about-us/index.js

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function AboutUs() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h3" color="info" textGradient gutterBottom>
                  Nuestra Misión: Conectar tu Pasión por el Fútbol
                </MDTypography>
                <MDBox mt={3} mb={2}>
                  <MDTypography variant="body1" color="text">
                    Bienvenido a <strong>GoalTime</strong>, la plataforma definitiva para los
                    amantes del fútbol en Riohacha y más allá. Nacimos de una simple pregunta: ¿por
                    qué es tan complicado encontrar y reservar una cancha para jugar un partido con
                    amigos?
                  </MDTypography>
                </MDBox>
                <MDTypography variant="h5" mt={4} mb={2}>
                  El Problema
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Llamadas interminables, mensajes sin respuesta, dudas sobre la disponibilidad y la
                  calidad de las canchas. Tanto jugadores como dueños de instalaciones deportivas
                  enfrentan día a día la fricción de un sistema de reservas anticuado. Los jugadores
                  pierden tiempo buscando, y los dueños pierden potenciales clientes.
                </MDTypography>
                <MDTypography variant="h5" mt={4} mb={2}>
                  La Solución GoalTime
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  GoalTime es el puente que une estos dos mundos. Ofrecemos una interfaz limpia,
                  moderna y en tiempo real donde los jugadores pueden ver la disponibilidad de todas
                  las canchas asociadas, elegir el horario perfecto y reservar en segundos. Para
                  nuestros asociados, proporcionamos un panel de control intuitivo para gestionar
                  sus canchas, horarios y reservas, maximizando su visibilidad y ocupación.
                </MDTypography>
                <MDTypography variant="h5" mt={4} mb={2}>
                  Nuestro Equipo
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Somos un equipo de desarrolladores y, sobre todo, apasionados por el fútbol.
                  Entendemos la emoción de organizar un partido y la frustración cuando las cosas no
                  salen bien. Por eso, hemos construido GoalTime con la tecnología más robusta y un
                  diseño centrado en el usuario, para que tu única preocupación sea disfrutar del
                  juego.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AboutUs;
