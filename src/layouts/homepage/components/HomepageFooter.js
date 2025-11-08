// src/layouts/homepage/components/HomepageFooter.js

import { Link as RouterLink } from "react-router-dom";
import { Container, Grid, Link as MuiLink, Divider } from "@mui/material"; // Se añade Divider
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import logo from "assets/images/Logo.png";

function HomepageFooter() {
  const socialLinks = [
    { icon: "facebook", link: "#" },
    { icon: "instagram", link: "#" },
    { icon: "twitter", link: "#" },
  ];

  const { currentUser } = require("context/AuthContext");

  return (
    <MDBox component="footer" py={6} bgColor="dark">
      <Container>
        <Grid container spacing={4}>
          {/* Columna 1: Logo y Redes */}
          <Grid item xs={12} md={4}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <MDBox component="img" src={logo} alt="GoalTime Logo" width="2.5rem" />
              <MDTypography variant="h5" color="white" sx={{ ml: 1 }}>
                GoalTime
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="white" opacity={0.7} mb={2}>
              Tu plataforma de confianza para encontrar y gestionar canchas deportivas.
            </MDTypography>
            <MDBox display="flex" gap={2}>
              {socialLinks.map((social) => (
                <MuiLink key={social.icon} href={social.link} target="_blank" color="white">
                  <Icon baseClassName="fab" className={`fa-${social.icon}`} fontSize="small" />
                </MuiLink>
              ))}
            </MDBox>
          </Grid>

          {/* Columna 2: Para Jugadores */}
          <Grid item xs={6} md={2}>
            <MDTypography variant="h6" color="white" mb={2}>
              Para Jugadores
            </MDTypography>
            <MDTypography
              component={RouterLink}
              to={currentUser ? "/canchas" : "/authentication/sign-in"}
              variant="body2"
              color="white"
              opacity={0.7}
              display="block"
              mb={1}
            >
              Buscar Canchas
            </MDTypography>
            <MDTypography
              component="a"
              href="#"
              variant="body2"
              color="white"
              opacity={0.7}
              display="block"
              mb={1}
            >
              Cómo funciona
            </MDTypography>
          </Grid>

          {/* Columna 3: Para Dueños */}
          <Grid item xs={6} md={2}>
            <MDTypography variant="h6" color="white" mb={2}>
              Para Dueños
            </MDTypography>
            <MDTypography
              component={RouterLink}
              to="/become-associate"
              variant="body2"
              color="white"
              opacity={0.7}
              display="block"
              mb={1}
            >
              Registra tu Cancha
            </MDTypography>
            <MDTypography
              component="a"
              href="#"
              variant="body2"
              color="white"
              opacity={0.7}
              display="block"
              mb={1}
            >
              Panel de Control
            </MDTypography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: "rgba(255, 255, 255, 0.2)" }} />
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="caption" color="white" opacity={0.7}>
            © {new Date().getFullYear()} GoalTime. Todos los derechos reservados.
          </MDTypography>
          <MDBox display="flex" gap={3}>
            <MDTypography
              component={RouterLink}
              to="/politica-de-privacidad"
              variant="caption"
              color="white"
              opacity={0.7}
            >
              Política de Privacidad
            </MDTypography>
            <MDTypography
              component={RouterLink}
              to="/terminos-y-condiciones"
              variant="caption"
              color="white"
              opacity={0.7}
            >
              Términos y Condiciones
            </MDTypography>
          </MDBox>
        </MDBox>
      </Container>
    </MDBox>
  );
}

export default HomepageFooter;
