/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

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
  // También puede venir directamente en la URL cuando el usuario accede desde el email
  const getOobCodeFromUrl = useCallback(() => {
    // Intentar obtener de searchParams (React Router)
    const fromSearchParams = searchParams.get("oobCode") || searchParams.get("oobcode");
    if (fromSearchParams) return fromSearchParams;

    // Intentar obtener directamente de window.location (por si Firebase redirige)
    const urlParams = new URLSearchParams(window.location.search);
    const fromWindow = urlParams.get("oobCode") || urlParams.get("oobcode");
    if (fromWindow) return fromWindow;

    // Intentar obtener del hash (algunos casos de Firebase)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const fromHash = hashParams.get("oobCode") || hashParams.get("oobcode");
    if (fromHash) return fromHash;

    return null;
  }, [searchParams]);

  const oobCode = getOobCodeFromUrl();

  useEffect(() => {
    // Debug: verificar qué parámetros están llegando
    const allParams = Object.fromEntries(searchParams.entries());
    const windowParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    console.log("Parámetros de URL (React Router):", allParams);
    console.log("Parámetros de URL (window.location):", windowParams);
    console.log("oobCode encontrado:", oobCode);
    console.log("URL completa:", window.location.href);
    console.log("Hash:", window.location.hash);

    // Obtener el código actualizado
    const currentCode = getOobCodeFromUrl();

    if (!currentCode) {
      // Esperar un momento para que Firebase complete la redirección
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

    // Intentar obtener el código de diferentes formas
    const getCode = () => {
      if (oobCode) return oobCode;
      const fromSearch = searchParams.get("oobCode") || searchParams.get("oobcode");
      if (fromSearch) return fromSearch;
      const fromWindow =
        new URLSearchParams(window.location.search).get("oobCode") ||
        new URLSearchParams(window.location.search).get("oobcode");
      if (fromWindow) return fromWindow;
      const fromHash =
        new URLSearchParams(window.location.hash.substring(1)).get("oobCode") ||
        new URLSearchParams(window.location.hash.substring(1)).get("oobcode");
      return fromHash || null;
    };

    const code = getCode();

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

      // Redirigir al login después de 2 segundos
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

  // Verificar si tenemos un código válido
  const hasValidCode = getOobCodeFromUrl();

  if (!isValidCode && !hasValidCode) {
    return (
      <CoverLayout coverHeight="50vh" image={bgImage}>
        <Card>
          <MDBox
            variant="gradient"
            bgColor="error"
            borderRadius="lg"
            coloredShadow="error"
            mx={2}
            mt={-3}
            py={2}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
              Enlace Inválido
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              El enlace de restablecimiento no es válido o ha expirado
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox textAlign="center" mb={3}>
              <Icon sx={{ fontSize: "4rem", color: "error.main", mb: 2 }}>error</Icon>
              <MDTypography variant="body2" color="text">
                Por favor, solicita un nuevo enlace de restablecimiento.
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/reset-password"
                variant="gradient"
                color="info"
                fullWidth
              >
                Solicitar Nuevo Enlace
              </MDButton>
            </MDBox>
            <MDBox mt={2} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/sign-in"
                variant="outlined"
                color="info"
                fullWidth
              >
                Volver a Iniciar Sesión
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </CoverLayout>
    );
  }

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
            Nueva Contraseña
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingresa tu nueva contraseña
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Nueva Contraseña"
                variant="standard"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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
            <MDBox mb={4}>
              <MDInput
                type={showConfirmPassword ? "text" : "password"}
                label="Confirmar Contraseña"
                variant="standard"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        <Icon fontSize="small">
                          {showConfirmPassword ? "visibility" : "visibility_off"}
                        </Icon>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
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

export default ConfirmResetPassword;
