/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { Email, ArrowBack, Help } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { FullScreenLoader } from "components/FullScreenLoader";
import SplitScreenLayout from "layouts/authentication/components/SplitScreenLayout";
import { sendPasswordReset } from "services/firebaseService";
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
      case "auth/unauthorized-domain":
        return "El dominio no está autorizado. Por favor, contacta al administrador.";
      case "auth/unauthorized-continue-uri":
        return "La URL de redirección no está autorizada. Verifica que el dominio esté autorizado en Firebase Console.";
      case "auth/invalid-continue-uri":
        return "La URL de redirección no es válida. Por favor, contacta al administrador.";
      case "auth/missing-continue-uri":
        return "Falta la URL de redirección. Por favor, contacta al administrador.";
      default:
        return `Ocurrió un error (${
          errorCode || "desconocido"
        }). Por favor, inténtalo más tarde o contacta al administrador.`;
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
      console.log("Iniciando solicitud de restablecimiento de contraseña para:", email);
      await sendPasswordReset(email);
      console.log("Solicitud de restablecimiento exitosa");
      setEmailSent(true);
      setSnackbar({
        open: true,
        color: "success",
        message:
          "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.",
      });
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      console.error("- Error code:", error.code);
      console.error("- Error message:", error.message);
      console.error("- Full error:", error);

      const errorMessage = getFriendlyErrorMessage(error.code);
      setSnackbar({
        open: true,
        color: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Left Panel Content (50% - Architectural Image)
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );

  // Right Panel Content (50% - White Form)
  const rightContent = (
    <MDBox
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      px={{ xs: 3, sm: 6, md: 8 }}
      py={4}
      sx={{ position: "relative" }}
    >
      {isLoading && <FullScreenLoader />}

      {/* Help Icon - Bottom Right */}
      <IconButton
        component={Link}
        to="/sobre-nosotros"
        sx={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: "grey.800",
          color: "white",
          width: 40,
          height: 40,
          "&:hover": {
            backgroundColor: "grey.700",
          },
        }}
      >
        <Help />
      </IconButton>

      {/* Form Content */}
      <MDBox maxWidth="480px" mx="auto" width="100%">
        {/* Back to Login Link */}
        <MDBox mb={4}>
          <MDTypography
            component={Link}
            to="/authentication/sign-in"
            variant="body2"
            color="text"
            sx={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "1rem" }} />
            Volver al inicio de sesión
          </MDTypography>
        </MDBox>

        <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
          Restablecer Contraseña
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={4}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </MDTypography>

        {emailSent ? (
          <MDBox>
            <MDBox textAlign="center" mb={3}>
              <MDTypography variant="h6" fontWeight="bold" mb={1} color="success.main">
                ✓ Correo Enviado
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Hemos enviado un correo electrónico a <strong>{email}</strong> con las instrucciones
                para restablecer tu contraseña.
              </MDTypography>
              <MDTypography variant="body2" color="text.secondary">
                Si no lo encuentras, revisa tu carpeta de spam.
              </MDTypography>
            </MDBox>
            <MDButton
              component={Link}
              to="/authentication/sign-in"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: (theme) => theme.palette.goaltime.main,
                color: "white",
                py: 1.5,
                mb: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "medium",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.goaltime.dark,
                },
              }}
            >
              Volver a Iniciar Sesión
            </MDButton>
          </MDBox>
        ) : (
          <MDBox component="form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <MDBox mb={4}>
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="medium"
                mb={1}
                display="block"
              >
                Correo Electrónico
              </MDTypography>
              <MDInput
                type="email"
                placeholder="nombre@ejemplo.com"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "grey.100",
                    "& fieldset": {
                      borderColor: "grey.300",
                    },
                    "&:hover fieldset": {
                      borderColor: "grey.400",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </MDBox>

            {/* Submit Button */}
            <MDButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                backgroundColor: (theme) => theme.palette.goaltime.main,
                color: "white",
                py: 1.5,
                mb: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "medium",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.goaltime.dark,
                },
                "&:disabled": {
                  backgroundColor: "grey.300",
                  color: "grey.500",
                },
              }}
            >
              {isLoading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
            </MDButton>

            {/* Sign In Link */}
            <MDBox textAlign="center">
              <MDTypography variant="body2" color="text">
                ¿Recordaste tu contraseña?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="body2"
                  sx={{
                    color: (theme) => theme.palette.goaltime.main,
                    fontWeight: "bold",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Iniciar Sesión
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        )}
      </MDBox>

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
    </MDBox>
  );

  return (
    <SplitScreenLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftWidth="50%"
      rightWidth="50%"
    />
  );
}

export default Cover;
