/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { FullScreenLoader } from "components/FullScreenLoader";
import SplitScreenLayout from "layouts/authentication/components/SplitScreenLayout";

// Services
import { resetPassword } from "services/firebaseService";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

function ConfirmResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [isValidCode, setIsValidCode] = useState(true);

  // Firebase puede pasar el oobCode de diferentes maneras
  const getOobCodeFromUrl = useCallback(() => {
    const fromSearchParams = searchParams.get("oobCode") || searchParams.get("oobcode");
    if (fromSearchParams) return fromSearchParams;

    const urlParams = new URLSearchParams(window.location.search);
    const fromWindow = urlParams.get("oobCode") || urlParams.get("oobcode");
    if (fromWindow) return fromWindow;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const fromHash = hashParams.get("oobCode") || hashParams.get("oobcode");
    if (fromHash) return fromHash;

    return null;
  }, [searchParams]);

  const oobCode = getOobCodeFromUrl();

  useEffect(() => {
    // Si estamos en la página de acción de Firebase, redirigir
    if (window.location.pathname === "/__/auth/action") {
      const urlParams = new URLSearchParams(window.location.search);
      const actionCode = urlParams.get("oobCode");
      const continueUrl = urlParams.get("continueUrl");

      if (actionCode) {
        let redirectUrl;
        if (continueUrl && continueUrl.startsWith("http")) {
          try {
            let decodedUrl = decodeURIComponent(continueUrl);
            if (
              decodedUrl.includes("localhost") &&
              window.location.origin.includes("goaltime.site")
            ) {
              decodedUrl = decodedUrl.replace(
                /http:\/\/localhost:\d+/,
                "https://www.goaltime.site"
              );
            } else if (decodedUrl.includes("goaltime.site") && !decodedUrl.includes("www.")) {
              decodedUrl = decodedUrl.replace("https://goaltime.site", "https://www.goaltime.site");
            }
            redirectUrl = `${decodedUrl}?oobCode=${actionCode}`;
          } catch (e) {
            redirectUrl = `${continueUrl}?oobCode=${actionCode}`;
          }
        } else {
          if (
            window.location.hostname.includes("goaltime.site") &&
            !window.location.hostname.includes("www.")
          ) {
            redirectUrl = `https://www.goaltime.site/authentication/reset-password/confirm?oobCode=${actionCode}`;
          } else {
            redirectUrl = `${window.location.origin}/authentication/reset-password/confirm?oobCode=${actionCode}`;
          }
        }
        window.location.href = redirectUrl;
        return;
      }
    }

    const currentCode = getOobCodeFromUrl();
    if (!currentCode) {
      const timer = setTimeout(() => {
        const finalCode = getOobCodeFromUrl();
        if (!finalCode) {
          setIsValidCode(false);
          setSnackbar({
            open: true,
            color: "error",
            message:
              "El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita uno nuevo.",
          });
        } else {
          setIsValidCode(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsValidCode(true);
    }
  }, [searchParams, getOobCodeFromUrl, oobCode]);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/expired-action-code":
        return "El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.";
      case "auth/invalid-action-code":
        return "El enlace de restablecimiento no es válido. Por favor, solicita uno nuevo.";
      case "auth/weak-password":
        return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
      default:
        return "Ocurrió un error al restablecer la contraseña. Por favor, inténtalo nuevamente.";
    }
  };

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setSnackbar({
        open: true,
        color: "warning",
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
      return false;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        color: "warning",
        message: "Las contraseñas no coinciden.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePassword()) {
      return;
    }

    const code = getOobCodeFromUrl();
    if (!code) {
      setSnackbar({
        open: true,
        color: "error",
        message: "El enlace de restablecimiento no es válido. Por favor, solicita uno nuevo.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(code, newPassword);
      setSnackbar({
        open: true,
        color: "success",
        message: "Tu contraseña ha sido restablecida exitosamente.",
      });

      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
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

  // Left Panel Content (40% - Image)
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
      }}
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      p={4}
    >
      <MDBox sx={{ position: "relative", zIndex: 1 }}>
        <MDTypography variant="h3" fontWeight="bold" color="white" mb={2}>
          Nueva Contraseña
        </MDTypography>
        <MDTypography variant="body1" color="white" sx={{ opacity: 0.9, maxWidth: "400px" }}>
          Ingresa tu nueva contraseña para completar el restablecimiento.
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

      {!isValidCode && !getOobCodeFromUrl() ? (
        <MDBox maxWidth="480px" mx="auto" width="100%">
          <MDTypography variant="h3" fontWeight="bold" color="error" mb={2}>
            Enlace Inválido
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={4}>
            El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita uno nuevo.
          </MDTypography>
          <MDBox mt={4} mb={2}>
            <MDButton
              component={Link}
              to="/authentication/reset-password"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: (theme) => theme.palette.goaltime.main,
                color: "white",
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "medium",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.goaltime.dark,
                },
              }}
            >
              Solicitar Nuevo Enlace
            </MDButton>
          </MDBox>
          <MDBox mb={1}>
            <MDButton
              component={Link}
              to="/authentication/sign-in"
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "grey.300",
                color: "text.primary",
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  borderColor: "grey.400",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Volver a Iniciar Sesión
            </MDButton>
          </MDBox>
        </MDBox>
      ) : (
        <MDBox maxWidth="480px" mx="auto" width="100%">
          <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
            Nueva Contraseña
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={4}>
            Ingresa tu nueva contraseña para completar el restablecimiento
          </MDTypography>

          <MDBox component="form" onSubmit={handleSubmit}>
            {/* New Password Input */}
            <MDBox mb={3}>
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="medium"
                mb={1}
                display="block"
              >
                Nueva Contraseña
              </MDTypography>
              <MDInput
                type={showPassword ? "text" : "password"}
                placeholder="********"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Confirm Password Input */}
            <MDBox mb={4}>
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="medium"
                mb={1}
                display="block"
              >
                Confirmar Contraseña
              </MDTypography>
              <MDInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
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
              {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
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
        </MDBox>
      )}

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
      leftWidth="40%"
      rightWidth="60%"
    />
  );
}

export default ConfirmResetPassword;
