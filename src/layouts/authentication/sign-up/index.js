// src/layouts/authentication/sign-up/index.js

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Box, Divider, Checkbox, Button } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import {
  Facebook,
  Google,
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Help,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import FullScreenLoader from "components/FullScreenLoader";
import SplitScreenLayout from "layouts/authentication/components/SplitScreenLayout";
import bgImage from "assets/images/bg-sign-up-cover.png";
import { registerUser, signInWithFacebook } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

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

// Función para calcular la fuerza de la contraseña
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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [jokeSB, setJokeSB] = useState(false);
  const { userProfile, initialAuthLoading } = useAuth();

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
    setRegistrationSuccess(false);
    try {
      await registerUser(name, email, password);
      // Redirigir inmediatamente después del registro exitoso
      // No usar useEffect porque GuestRoute puede interferir
      setIsLoading(false);
      navigate("/authentication/verify-email", { replace: true });
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
      openErrorSB();
      setIsLoading(false);
      setRegistrationSuccess(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      const userProfile = await signInWithFacebook();
      if (userProfile.role === "cliente") {
        navigate("/canchas");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        setErrorMessage(
          "Ya existe una cuenta con este email. Inicia sesión con tu método original."
        );
      } else {
        setErrorMessage(getFriendlyErrorMessage(error.code));
      }
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

  // Right Panel Content (40% - Image with Overlay)
  const rightContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        p: 4,
      }}
    >
      <MDBox sx={{ position: "relative", zIndex: 1 }}>
        <MDTypography variant="h3" fontWeight="bold" color="white" mb={2}>
          Únete a nuestra comunidad
        </MDTypography>
        <MDTypography variant="body1" color="white" sx={{ opacity: 0.9, maxWidth: "300px" }}>
          Miles de usuarios ya confían en nosotros. Crea tu cuenta y descubre todas las ventajas.
        </MDTypography>
      </MDBox>
      {/* Help Icon */}
      <IconButton
        component={Link}
        to="/sobre-nosotros"
        sx={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "white",
          width: 40,
          height: 40,
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <Help />
      </IconButton>
    </MDBox>
  );

  // Left Panel Content (60% - White Form)
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      px={{ xs: 3, sm: 6, md: 8 }}
      py={4}
    >
      {isLoading && <FullScreenLoader />}

      {/* Form Content */}
      <MDBox maxWidth="480px" mx="auto" width="100%">
        <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
          Crear Cuenta
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={4}>
          Regístrate para comenzar tu experiencia
        </MDTypography>

        {/* Social Login Buttons */}
        <MDBox display="flex" gap={2} mb={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              textTransform: "none",
              py: 1.5,
              "&:hover": {
                borderColor: "grey.400",
                backgroundColor: "grey.50",
              },
            }}
            startIcon={<Google />}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleFacebookSignIn}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              textTransform: "none",
              py: 1.5,
              "&:hover": {
                borderColor: "grey.400",
                backgroundColor: "grey.50",
              },
            }}
            startIcon={<Facebook />}
          >
            Facebook
          </Button>
        </MDBox>

        {/* Divider */}
        <MDBox position="relative" mb={3}>
          <Divider />
          <MDBox
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              px: 2,
            }}
          >
            <MDTypography variant="caption" color="text.secondary">
              O regístrate con email
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Form */}
        <MDBox component="form" onSubmit={handleRegister}>
          {/* Full Name Input */}
          <MDBox mb={3}>
            <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
              Nombre Completo
            </MDTypography>
            <MDInput
              type="text"
              placeholder="Juan Pérez"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                    <Person sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>

          {/* Email Input */}
          <MDBox mb={3}>
            <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
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

          {/* Password Input */}
          <MDBox mb={2}>
            <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
              Contraseña
            </MDTypography>
            <MDInput
              type={showPassword ? "text" : "password"}
              placeholder="********"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                    <Lock sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "text.secondary" }} />
                      ) : (
                        <Visibility sx={{ color: "text.secondary" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>

          {/* Password Strength Indicator */}
          {password && (
            <MDBox mb={3}>
              <LinearProgress
                variant="determinate"
                value={strength.value}
                color={strength.color}
                sx={{ height: 6, borderRadius: 1 }}
              />
              {strength.label && (
                <MDTypography variant="caption" color={strength.color} mt={0.5} display="block">
                  {strength.label}
                </MDTypography>
              )}
            </MDBox>
          )}

          {/* Confirm Password Input */}
          <MDBox mb={3}>
            <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
              Confirmar Contraseña
            </MDTypography>
            <MDInput
              type={showPassword ? "text" : "password"}
              placeholder="********"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={confirmPassword !== "" && password !== confirmPassword}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "grey.100",
                  "& fieldset": {
                    borderColor:
                      confirmPassword !== "" && password !== confirmPassword
                        ? "error.main"
                        : "grey.300",
                  },
                  "&:hover fieldset": {
                    borderColor: "grey.400",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "text.secondary" }} />
                      ) : (
                        <Visibility sx={{ color: "text.secondary" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>

          {/* Terms and Conditions */}
          <MDBox display="flex" alignItems="center" mb={4}>
            <Checkbox
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              sx={{ p: 0, mr: 1 }}
            />
            <MDTypography variant="body2" color="text">
              Acepto los{" "}
              <MDTypography
                component="span"
                variant="body2"
                fontWeight="bold"
                sx={{
                  color: (theme) => theme.palette.goaltime.main,
                  cursor: "pointer",
                }}
                onClick={openJokeSB}
              >
                Términos y Condiciones
              </MDTypography>
            </MDTypography>
          </MDBox>

          {/* Register Button */}
          <MDButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={!agreeTerms}
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
            Crear Cuenta
          </MDButton>

          {/* Sign In Link */}
          <MDBox textAlign="center">
            <MDTypography variant="body2" color="text">
              ¿Ya tienes una cuenta?{" "}
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
      </MDBox>
      {renderErrorSB}
      {renderJokeSB}
    </MDBox>
  );

  return (
    <SplitScreenLayout
      leftContent={rightContent}
      rightContent={leftContent}
      leftWidth="40%"
      rightWidth="60%"
    />
  );
}

export default Cover;
