// src/layouts/privacy-policy/index.js

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import PublicLayout from "layouts/PublicLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PrivacyPolicy() {
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
      >
        <MDTypography variant="h2" color="white" fontWeight="bold">
          Política de Privacidad
        </MDTypography>
      </MDBox>

      {/* --- 2. Contenido con Superposición --- */}
      <Container sx={{ mt: -8, py: 8 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card sx={{ boxShadow: "lg" }}>
              <MDBox p={{ xs: 2, sm: 3, md: 4 }}>
                <MDTypography variant="h3" color="info" textGradient>
                  Política de Privacidad
                </MDTypography>
                <MDTypography variant="body2" color="text" mt={1}>
                  Fecha de última actualización: 13 de Octubre, 2025
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="body1" color="text" mb={2} sx={{ lineHeight: 1.8 }}>
                  Bienvenido a GoalTime. Nos comprometemos a proteger tu privacidad. Esta política
                  explica qué información recopilamos, cómo la usamos y qué derechos tienes en
                  relación con ella.
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  1. Información que Recopilamos
                </MDTypography>
                <MDTypography component="div" variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  Para operar la plataforma GoalTime, recopilamos los siguientes tipos de
                  información:
                  <ul>
                    <li>
                      <strong>Información de Registro:</strong> Cuando creas una cuenta, te pedimos
                      tu nombre, dirección de correo electrónico y una contraseña.
                    </li>
                    <li>
                      <strong>Información de Proveedores Sociales:</strong> Si te registras usando
                      Google, recibiremos la información que autorices en la pantalla de
                      consentimiento, generalmente tu nombre, correo electrónico y foto de perfil.
                    </li>
                    <li>
                      <strong>Datos de Asociado:</strong> Si solicitas ser un asociado,
                      recopilaremos información adicional sobre tu negocio, como nombre comercial y
                      teléfono de contacto.
                    </li>
                  </ul>
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  2. Cómo Usamos tu Información
                </MDTypography>
                <MDTypography component="div" variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  <ul>
                    <li>
                      <strong>Para Proveer y Mejorar el Servicio:</strong> Usamos tus datos para
                      crear y mantener tu cuenta, facilitar las reservas y personalizar tu
                      experiencia.
                    </li>

                    <li>
                      <strong>Comunicación:</strong> Podemos usar tu correo electrónico para
                      enviarte notificaciones importantes sobre tus reservas, tu cuenta o cambios en
                      nuestros términos.
                    </li>
                    <li>
                      <strong>Seguridad:</strong> Para proteger la plataforma y a nuestros usuarios
                      contra el fraude y el abuso.
                    </li>
                  </ul>
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  3. Contacto
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos
                  en{" "}
                  <MDTypography
                    component="a"
                    href="mailto:soporte@goaltime.site"
                    variant="body2"
                    color="info"
                    fontWeight="medium"
                  >
                    soporte@goaltime.site
                  </MDTypography>
                  .
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default PrivacyPolicy;
