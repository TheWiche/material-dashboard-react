// src/layouts/terms-of-service/index.js

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import PublicLayout from "layouts/PublicLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function TermsOfService() {
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
          Términos y Condiciones
        </MDTypography>
      </MDBox>

      {/* --- 2. Contenido con Superposición --- */}
      <Container sx={{ mt: -8, py: 8 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card sx={{ boxShadow: "lg" }}>
              <MDBox p={{ xs: 2, sm: 3, md: 4 }}>
                <MDTypography variant="h3" color="info" textGradient>
                  Términos y Condiciones
                </MDTypography>
                <MDTypography variant="body2" color="text" mt={1}>
                  Fecha de última actualización: 13 de Octubre, 2025
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="body1" color="text" mb={2} sx={{ lineHeight: 1.8 }}>
                  Bienvenido a GoalTime. Estos Términos y Condiciones rigen tu uso de nuestra
                  plataforma. Al acceder o usar nuestro servicio, aceptas cumplir con estos
                  términos.
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  1. Descripción del Servicio
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  GoalTime es una plataforma intermediaria que conecta a usuarios que desean
                  reservar instalaciones deportivas, con los dueños de dichas instalaciones. No
                  somos propietarios ni operamos ninguna de las canchas listadas.
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  2. Cuentas de Usuario y Roles
                </MDTypography>
                <MDTypography component="div" variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  <ul>
                    <li>
                      <strong>Cliente:</strong> Rol por defecto. Permite visualizar y solicitar
                      reservas en canchas aprobadas.
                    </li>
                    <li>
                      <strong>Asociado:</strong> Rol asignado por un administrador. Permite
                      registrar y gestionar instalaciones deportivas para que sean listadas en la
                      plataforma.
                    </li>
                    <li>
                      <strong>Responsabilidad:</strong> Eres responsable de mantener la
                      confidencialidad de tu contraseña y de toda la actividad que ocurra en tu
                      cuenta.
                    </li>
                  </ul>
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  3. Proceso de Reserva
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  Las reservas realizadas a través de GoalTime son un acuerdo entre el Cliente y el
                  Asociado. GoalTime facilita esta conexión pero no se hace responsable de
                  cancelaciones, disponibilidad o calidad de las instalaciones.
                </MDTypography>

                <MDTypography variant="h5" mt={4} mb={2}>
                  4. Limitación de Responsabilidad
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
                  El servicio se proporciona tal cual. GoalTime no será responsable por ningún daño
                  directo o indirecto que surja del uso de la plataforma.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default TermsOfService;
