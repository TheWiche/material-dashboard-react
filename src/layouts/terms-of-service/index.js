// src/layouts/terms-of-service/index.js

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function TermsOfService() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3" color="info" textGradient>
              Términos y Condiciones
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={1}>
              Fecha de última actualización: 13 de Octubre, 2025
            </MDTypography>

            <Divider sx={{ my: 2 }} />

            <MDTypography variant="body1" color="text" mb={2}>
              Bienvenido a GoalTime. Estos Términos y Condiciones rigen tu uso de nuestra
              plataforma. Al acceder o usar nuestro servicio, aceptas cumplir con estos términos.
            </MDTypography>

            <MDTypography variant="h5" mt={4} mb={2}>
              1. Descripción del Servicio
            </MDTypography>
            <MDTypography variant="body2" color="text">
              GoalTime es una plataforma intermediaria que conecta a usuarios que desean reservar
              instalaciones deportivas, con los dueños de dichas instalaciones. No somos
              propietarios ni operamos ninguna de las canchas listadas.
            </MDTypography>

            <MDTypography variant="h5" mt={4} mb={2}>
              2. Cuentas de Usuario y Roles
            </MDTypography>
            <MDTypography variant="body2" color="text">
              <ul>
                <li>
                  <strong>Cliente:</strong> Rol por defecto. Permite visualizar y solicitar reservas
                  en canchas aprobadas.
                </li>
                <li>
                  <strong>Asociado:</strong> Rol asignado por un administrador. Permite registrar y
                  gestionar instalaciones deportivas para que sean listadas en la plataforma.
                </li>
                <li>
                  <strong>Responsabilidad:</strong> Eres responsable de mantener la confidencialidad
                  de tu contraseña y de toda la actividad que ocurra en tu cuenta.
                </li>
              </ul>
            </MDTypography>

            <MDTypography variant="h5" mt={4} mb={2}>
              3. Proceso de Reserva
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Las reservas realizadas a través de GoalTime son un acuerdo entre el Cliente y el
              Asociado. GoalTime facilita esta conexión pero no se hace responsable de
              cancelaciones, disponibilidad o calidad de las instalaciones.
            </MDTypography>

            <MDTypography variant="h5" mt={4} mb={2}>
              4. Limitación de Responsabilidad
            </MDTypography>
            <MDTypography variant="body2" color="text">
              El servicio se proporciona tal cual. GoalTime no será responsable por ningún daño
              directo o indirecto que surja del uso de la plataforma.
            </MDTypography>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TermsOfService;
