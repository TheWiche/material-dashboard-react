// src/layouts/homepage/components/HomepageFooter.js

import { Link as RouterLink } from "react-router-dom";
import { Container, Grid, Link as MuiLink, Divider } from "@mui/material"; // Se añade Divider
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import logo from "assets/images/Logo.png";
import { useAuth } from "context/AuthContext";

function HomepageFooter() {
  const socialLinks = [
    { icon: "facebook", link: "#" },
    { icon: "instagram", link: "#" },
    { icon: "twitter", link: "#" },
  ];

  const { currentUser } = useAuth();

  return (
    <MDBox component="footer" py={4} bgColor="dark">
      <Container>
        <Grid container spacing={4} alignItems="center">
          {/* Columna 1: Logo y Redes */}
          <Grid item xs={12} md={6}>
            <MDBox display="flex" alignItems="center" mb={1.5}>
              <MDBox component="img" src={logo} alt="GoalTime Logo" width="2rem" />
              <MDTypography variant="h6" color="white" sx={{ ml: 1 }}>
                GoalTime
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="white" opacity={0.7} mb={1.5} fontSize="0.875rem">
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
        </Grid>
        <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.2)" }} />
        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <MDTypography variant="caption" color="white" opacity={0.7} fontSize="0.75rem">
            © {new Date().getFullYear()} GoalTime. Todos los derechos reservados.
          </MDTypography>
          <MDBox display="flex" gap={3}>
            <MDTypography
              component={RouterLink}
              to="/politica-de-privacidad"
              variant="caption"
              color="white"
              opacity={0.7}
              fontSize="0.75rem"
              sx={{
                cursor: "pointer",
                transition: "opacity 0.2s ease-in-out",
                "&:hover": {
                  opacity: 1,
                  textDecoration: "underline",
                },
              }}
            >
              Política de Privacidad
            </MDTypography>
            <MDTypography
              component={RouterLink}
              to="/terminos-y-condiciones"
              variant="caption"
              color="white"
              opacity={0.7}
              fontSize="0.75rem"
              sx={{
                cursor: "pointer",
                transition: "opacity 0.2s ease-in-out",
                "&:hover": {
                  opacity: 1,
                  textDecoration: "underline",
                },
              }}
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
