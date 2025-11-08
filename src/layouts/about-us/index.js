// src/layouts/about-us/index.js
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import PublicLayout from "layouts/PublicLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar"; // 👈 Importar Avatar
import Icon from "@mui/material/Icon"; // 👈 Importar Icon
import PropTypes from "prop-types"; // 👈 Importar PropTypes

// --- (Opcional) Reemplaza esto con las fotos reales de tu equipo ---
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";

// --- Componente para las tarjetas de valores ---
function ValueCard({ icon, title, description }) {
  return (
    <Card sx={{ height: "100%", p: 2, boxShadow: "lg" }}>
      <MDBox display="flex" alignItems="center">
        <MDBox
          variant="gradient"
          bgColor="info"
          color="white"
          width="3rem"
          height="3rem"
          borderRadius="lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
          shadow="md"
          mr={2}
        >
          <Icon fontSize="medium">{icon}</Icon>
        </MDBox>
        <MDTypography variant="h5" fontWeight="bold">
          {title}
        </MDTypography>
      </MDBox>
      <MDTypography variant="body2" color="text" mt={2}>
        {description}
      </MDTypography>
    </Card>
  );
}

// PropTypes para ValueCard
ValueCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

// --- Componente para las tarjetas de equipo ---
function TeamCard({ image, name, title }) {
  return (
    <Card sx={{ textAlign: "center", p: 2, boxShadow: "md" }}>
      <MDAvatar src={image} alt={name} size="xl" shadow="md" sx={{ mx: "auto" }} />
      <MDTypography variant="h6" fontWeight="bold" mt={2} mb={0.5}>
        {name}
      </MDTypography>
      <MDTypography variant="body2" color="info" textGradient>
        {title}
      </MDTypography>
    </Card>
  );
}

// PropTypes para TeamCard
TeamCard.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

function AboutUs() {
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
          Sobre Nosotros
        </MDTypography>
      </MDBox>

      {/* --- 2. Contenido con Superposición --- */}
      <Container sx={{ mt: -8, py: 8 }}>
        {/* --- Tarjeta de Misión --- */}
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card sx={{ p: 3, mb: 6, boxShadow: "lg" }}>
              <MDTypography variant="h3" color="info" textGradient gutterBottom>
                Nuestra Misión: Conectar tu Pasión por el Fútbol
              </MDTypography>
              <MDTypography variant="body1" color="text" mt={2} sx={{ lineHeight: 1.8 }}>
                Bienvenido a <strong>GoalTime</strong>, la plataforma definitiva para los amantes
                del fútbol en Riohacha y más allá. Nacimos de una simple pregunta: ¿por qué es tan
                complicado encontrar y reservar una cancha para jugar un partido con amigos?
              </MDTypography>
            </Card>
          </Grid>
        </Grid>

        {/* --- Sección de Problema / Solución --- */}
        <Grid container spacing={3} mb={6}>
          <Grid item xs={12} md={6}>
            <ValueCard
              icon="error_outline"
              title="El Problema"
              description="Llamadas interminables, mensajes sin respuesta y dudas sobre la disponibilidad. Los jugadores pierden tiempo buscando, y los dueños pierden potenciales clientes."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ValueCard
              icon="check_circle_outline"
              title="La Solución GoalTime"
              description="Un puente que une ambos mundos. Ofrecemos una interfaz limpia y en tiempo real para reservar en segundos, y un panel de control intuitivo para que los dueños gestionen su negocio."
            />
          </Grid>
        </Grid>

        {/* --- Sección de Nuestro Equipo --- */}
        <MDTypography variant="h3" color="dark" mb={3} textAlign="center">
          Conoce al Equipo
        </MDTypography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} lg={3}>
            <TeamCard image={team1} name="Juan Pérez" title="Co-Fundador & CEO" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <TeamCard image={team2} name="Ana García" title="Co-Fundadora & CTO" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <TeamCard image={team3} name="Luis Mendoza" title="Diseñador UI/UX" />
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default AboutUs;
