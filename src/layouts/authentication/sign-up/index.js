// src/layouts/authentication/sign-up/index.js

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import LinearProgress from "@mui/material/LinearProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import FullScreenLoader from "components/FullScreenLoader";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.png";

// Importamos nuestra función de registro desde el servicio
import { registerUser } from "services/firebaseService";

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

// 👈 Función para calcular la fuerza de la contraseña
const calculatePasswordStrength = (password) => {
  let score = 0;
  if (!password) return { value: 0, color: "error", label: "" };

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { value: 25, color: "error", label: "Muy Débil" };
    case 2:
      return { value: 50, color: "warning", label: "Media" };
    case 3:
      return { value: 75, color: "info", label: "Fuerte" };
    case 4:
      return { value: 100, color: "success", label: "Muy Fuerte" };
    default:
      return { value: 0, color: "error", label: "Débil" };
  }
};

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ value: 0, color: "error", label: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [jokeSB, setJokeSB] = useState(false);

  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);
  const openJokeSB = () => setJokeSB(true);
  const closeJokeSB = () => setJokeSB(false);

  useEffect(() => {
    setStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      openErrorSB();
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Debes aceptar los términos y condiciones.");
      openErrorSB();
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(name, email, password);
      navigate("/canchas");
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
      openErrorSB();
    } finally {
      setIsLoading(false);
    }
  };

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

  // 👈 Se renderiza la notificación de broma
  const renderJokeSB = (
    <MDSnackbar
      color="dark"
      icon="sentiment_satisfied_alt"
      title="Términos y Condiciones"
      content="Si te hackeo es bajo tu propia responsabilidad. 😎"
      dateTime="justo ahora"
      open={jokeSB}
      onClose={closeJokeSB}
      close={closeJokeSB}
    />
  );

  return (
    <CoverLayout image={bgImage}>
      {isLoading && <FullScreenLoader />}
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
            Ingresa tus datos para registrarte
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
                required
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
                required
              />
            </MDBox>
            <MDBox mb={1}>
              <MDInput
                type={showPassword ? "text" : "password"} // 👈 Tipo de input dinámico
                label="Contraseña"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // 👇 Se añade el ícono del ojo
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Icon fontSize="small">
                          {showPassword ? "visibility" : "visibility_off"}
                        </Icon>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MDBox>
            {/* 👇 Barra de progreso para la fuerza de la contraseña */}
            {password && (
              <MDBox mt={0.75} display="flex" alignItems="center">
                <LinearProgress
                  variant="determinate"
                  value={strength.value}
                  color={strength.color}
                  sx={{ flexGrow: 1 }}
                />
                <MDTypography
                  variant="caption"
                  color={strength.color}
                  sx={{ ml: 1, minWidth: "80px" }}
                >
                  {strength.label}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={2} mb={2}>
              {/* 👇 Nuevo campo para repetir la contraseña */}
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Confirmar Contraseña"
                variant="standard"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={confirmPassword !== "" && password !== confirmPassword}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              {/* 👇 Checkbox ahora es funcional */}
              <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={(e) => setAgreeTerms(!agreeTerms)}
              >
                &nbsp;&nbsp;Acepto los&nbsp;
              </MDTypography>
              <MDTypography
                component="span" // Se cambia a 'span' para que no actúe como link
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
                onClick={openJokeSB} // 👈 Se activa la broma al hacer clic
                sx={{ cursor: "pointer" }}
              >
                Términos y Condiciones
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              {/* 👇 El botón se deshabilita si los términos no son aceptados */}
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
                disabled={!agreeTerms}
              >
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
      {renderErrorSB}
      {renderJokeSB} {/* 👈 Se renderiza la nueva notificación */}
    </CoverLayout>
  );
}

export default Cover;
