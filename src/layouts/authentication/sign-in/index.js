// src/layouts/authentication/sign-in/index.js

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Box, Divider, Checkbox, Button } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import {
  Facebook,
  Google,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Help,
  Close,
} from "@mui/icons-material";
import { keyframes } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { FullScreenLoader } from "components/FullScreenLoader";
import SplitScreenLayout from "layouts/authentication/components/SplitScreenLayout";
import bgImage from "assets/images/bg-sign-in.png";
import { loginUser, signInWithGoogle, signInWithFacebook } from "services/firebaseService";

const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "Credenciales incorrectas. Verifica tu correo y contraseña.";
    case "auth/email-not-verified":
      return "Por favor, verifica tu email antes de iniciar sesión.";
    default:
      return "Ocurrió un error. Por favor, inténtalo más tarde.";
  }
};

// Animación sutil para destacar el enlace de recuperación
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
`;

const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPasswordResetHint, setShowPasswordResetHint] = useState(false);

  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);
  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleShowPassword = () => setShowPassword(!showPassword);

  // Resetear intentos fallidos cuando el email cambia (podría ser otro usuario)
  useEffect(() => {
    setFailedAttempts(0);
    setShowPasswordResetHint(false);
  }, [email]);

  // Mostrar sugerencia después de 2 intentos fallidos
  useEffect(() => {
    if (failedAttempts >= 2) {
      setShowPasswordResetHint(true);
    } else {
      setShowPasswordResetHint(false);
    }
  }, [failedAttempts]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password, rememberMe);
      // Resetear contador en caso de éxito
      setFailedAttempts(0);
      setShowPasswordResetHint(false);
      if (userProfile.role === "cliente") {
        navigate("/canchas");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Si el email no está verificado, redirigir a la página de verificación
      if (error.code === "auth/email-not-verified") {
        navigate("/authentication/verify-email");
        return;
      }
      // Incrementar contador de intentos fallidos solo para errores de credenciales
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setFailedAttempts((prev) => prev + 1);
      }
      setErrorMessage(getFriendlyErrorMessage(error.code));
      openErrorSB();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userProfile = await signInWithGoogle();
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
      title="Error de Autenticación"
      content={errorMessage}
      dateTime="justo ahora"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  // Left Panel Content (40% - Dark Image with Text)
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        p: 4,
      }}
    >
      <MDBox>
        <MDTypography variant="h3" fontWeight="bold" color="white" mb={2}>
          Bienvenido de nuevo
        </MDTypography>
        <MDTypography variant="body1" color="white" sx={{ opacity: 0.9, maxWidth: "400px" }}>
          Gestiona tu cuenta y accede a todas las funcionalidades de nuestra plataforma.
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  // Right Panel Content (60% - White Form)
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

      {/* Close Button - Top Right */}
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "transparent",
          color: "text.secondary",
          width: 40,
          height: 40,
          zIndex: 10,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "grey.100",
            color: "text.primary",
            transform: "scale(1.1)",
          },
        }}
      >
        <Close />
      </IconButton>

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
        <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
          Iniciar Sesión
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={4}>
          Ingresa tus credenciales para continuar
        </MDTypography>

        {/* Social Login Buttons */}
        <MDBox display="flex" gap={2} mb={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignIn}
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
              O continúa con email
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Form */}
        <MDBox component="form" onSubmit={handleLogin}>
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
          <MDBox mb={3}>
            <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
              Contraseña
            </MDTypography>
            <MDInput
              type={showPassword ? "text" : "password"}
              placeholder="********"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                    <IconButton onClick={handleShowPassword} edge="end" size="small">
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

          {/* Remember Me and Forgot Password */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <MDBox display="flex" alignItems="center">
              <Checkbox checked={rememberMe} onChange={handleSetRememberMe} sx={{ p: 0, mr: 1 }} />
              <MDTypography
                variant="body2"
                color="text"
                sx={{ cursor: "pointer" }}
                onClick={handleSetRememberMe}
              >
                Recordarme
              </MDTypography>
            </MDBox>
            <MDTypography
              component={Link}
              to="/authentication/reset-password"
              variant="body2"
              color="text"
              sx={{
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
                ...(showPasswordResetHint && {
                  color: "warning.main",
                  fontWeight: "medium",
                  animation: `${pulseAnimation} 2s ease-in-out infinite`,
                }),
              }}
            >
              ¿Olvidaste tu contraseña?
            </MDTypography>
          </MDBox>

          {/* Sugerencia de recuperación de contraseña después de intentos fallidos */}
          {showPasswordResetHint && (
            <MDBox
              mb={3}
              p={1.5}
              borderRadius="md"
              sx={{
                background:
                  "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)",
                border: "1px solid rgba(255, 152, 0, 0.2)",
                animation: `${shakeAnimation} 0.5s ease-in-out`,
              }}
            >
              <MDTypography variant="caption" color="text" fontWeight="medium">
                ¿Olvidaste tu contraseña? Puedes recuperarla fácilmente.
              </MDTypography>
            </MDBox>
          )}

          {/* Login Button */}
          <MDButton
            type="submit"
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
            Iniciar Sesión
          </MDButton>

          {/* Sign Up Link */}
          <MDBox textAlign="center">
            <MDTypography variant="body2" color="text">
              ¿No tienes una cuenta?{" "}
              <MDTypography
                component={Link}
                to="/authentication/sign-up"
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
                Regístrate
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      {renderErrorSB}
    </MDBox>
  );

  return (
    <SplitScreenLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftWidth="40%"
      rightWidth="60%"
    />
  );
}

export default Basic;
