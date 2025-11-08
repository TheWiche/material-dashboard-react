/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { FullScreenLoader } from "components/FullScreenLoader";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Services
import { sendPasswordReset } from "services/firebaseService";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

function Cover() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [emailSent, setEmailSent] = useState(false);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No existe una cuenta con este correo electrónico.";
      case "auth/invalid-email":
        return "El correo electrónico no es válido.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.";
      default:
        return "Ocurrió un error. Por favor, inténtalo más tarde.";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setSnackbar({
        open: true,
        color: "warning",
        message: "Por favor, ingresa tu correo electrónico.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setEmailSent(true);
      setSnackbar({
        open: true,
        color: "success",
        message:
          "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        color: "error",
        message: getFriendlyErrorMessage(error.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      {isLoading && <FullScreenLoader />}
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Restablecer Contraseña
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            {emailSent
              ? "Revisa tu correo electrónico"
              : "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña"}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {emailSent ? (
            <MDBox>
              <MDBox textAlign="center" mb={3}>
                <Icon sx={{ fontSize: "4rem", color: "success.main", mb: 2 }}>check_circle</Icon>
                <MDTypography variant="h6" fontWeight="bold" mb={1}>
                  Correo Enviado
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Hemos enviado un correo electrónico a <strong>{email}</strong> con las
                  instrucciones para restablecer tu contraseña.
                </MDTypography>
                <MDTypography variant="body2" color="text" mt={2}>
                  Si no lo encuentras, revisa tu carpeta de spam.
                </MDTypography>
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  component={Link}
                  to="/authentication/sign-in"
                  variant="gradient"
                  color="info"
                  fullWidth
                >
                  Volver a Iniciar Sesión
                </MDButton>
              </MDBox>
            </MDBox>
          ) : (
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              <MDBox mb={4}>
                <MDInput
                  type="email"
                  label="Correo Electrónico"
                  variant="standard"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </MDBox>
              <MDBox mt={6} mb={1}>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="info"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  ¿Recordaste tu contraseña?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    Iniciar Sesión
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>

      <MDSnackbar
        color={snackbar.color}
        icon={
          snackbar.color === "success" ? "check" : snackbar.color === "error" ? "warning" : "info"
        }
        title="Restablecer Contraseña"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </CoverLayout>
  );
}

export default Cover;
