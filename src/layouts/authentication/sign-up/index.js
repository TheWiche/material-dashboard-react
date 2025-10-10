/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/
// src/layouts/authentication/sign-up/index.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar"; // 👈 1. Importamos el componente de notificación
import { useAuth } from "context/AuthContext";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.png"; //bg-sign-up-cover.jpeg

// Importamos nuestra función de registro desde el servicio
import { registerUser } from "services/firebaseService";

// 👈 Función para obtener un mensaje de error amigable
const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    default:
      return "Ocurrió un error inesperado. Por favor, inténtalo más tarde.";
  }
};

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsActionLoading } = useAuth();

  // 👈 2. Estados para manejar la notificación
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      // Llama al servicio pasándole todo lo necesario
      await registerUser(name, email, password, navigate, setIsActionLoading);
    } catch (error) {
      // Si el servicio lanza un error, lo atrapamos aquí y mostramos la notificación
      setErrorMessage(getFriendlyErrorMessage(error.code));
      openErrorSB();
    }
  };

  // 👈 4. Definimos cómo se verá la notificación de error
  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Error de Registro"
      content={errorMessage}
      dateTime="justo ahora"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Regístrate hoy
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingresa tu correo y contraseña para registrarte
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleRegister}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nombre"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Correo electrónico"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Acepto los&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Términos y Condiciones
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Crear cuenta
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿Ya tienes una cuenta?{" "}
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
        </MDBox>
      </Card>
      {/* 👈 5. Renderizamos la notificación para que esté lista para mostrarse */}
      {renderErrorSB}
    </CoverLayout>
  );
}

export default Cover;
