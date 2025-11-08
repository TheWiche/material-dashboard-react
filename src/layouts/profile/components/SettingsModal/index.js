/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { FullScreenLoader } from "components/FullScreenLoader";

// Services
import { sendPasswordReset } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

function SettingsModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [activeTab, setActiveTab] = useState("password"); // "password" o "account"

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSnackbar({ open: false, color: "info", message: "" });
    onClose();
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

  const handlePasswordReset = async () => {
    if (!validatePassword()) {
      return;
    }

    if (!currentUser?.email) {
      setSnackbar({
        open: true,
        color: "error",
        message: "No se pudo obtener tu correo electrónico.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Enviar email de restablecimiento
      await sendPasswordReset(currentUser.email);
      setSnackbar({
        open: true,
        color: "success",
        message:
          "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.",
      });
      // Limpiar campos después de un momento
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error);
      const errorMessage =
        error.code === "auth/user-not-found"
          ? "No se encontró tu cuenta."
          : error.code === "auth/too-many-requests"
          ? "Demasiados intentos. Por favor, espera unos minutos."
          : "Ocurrió un error al solicitar el restablecimiento. Por favor, inténtalo más tarde.";
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

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="bold">
              Configuración
            </MDTypography>
            <IconButton onClick={handleClose} size="small">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
        </DialogTitle>

        <DialogContent>
          {isLoading && <FullScreenLoader />}

          {/* Tabs */}
          <MDBox mb={3}>
            <MDBox display="flex" gap={1} borderBottom={1} borderColor="divider">
              <MDButton
                variant={activeTab === "password" ? "contained" : "text"}
                color={activeTab === "password" ? "info" : "secondary"}
                onClick={() => setActiveTab("password")}
                sx={{ borderRadius: 0, borderBottom: activeTab === "password" ? 2 : 0 }}
              >
                <Icon sx={{ mr: 1 }}>lock</Icon>
                Cambiar Contraseña
              </MDButton>
              <MDButton
                variant={activeTab === "account" ? "contained" : "text"}
                color={activeTab === "account" ? "info" : "secondary"}
                onClick={() => setActiveTab("account")}
                sx={{ borderRadius: 0, borderBottom: activeTab === "account" ? 2 : 0 }}
              >
                <Icon sx={{ mr: 1 }}>account_circle</Icon>
                Cuenta
              </MDButton>
            </MDBox>
          </MDBox>

          {activeTab === "password" && (
            <MDBox>
              <MDTypography variant="body2" color="text" mb={3}>
                Para cambiar tu contraseña, te enviaremos un enlace a tu correo electrónico.
              </MDTypography>

              <MDBox mb={2}>
                <MDInput
                  type={showCurrentPassword ? "text" : "password"}
                  label="Contraseña Actual"
                  variant="outlined"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          <Icon fontSize="small">
                            {showCurrentPassword ? "visibility" : "visibility_off"}
                          </Icon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>

              <MDBox mb={2}>
                <MDInput
                  type={showNewPassword ? "text" : "password"}
                  label="Nueva Contraseña"
                  variant="outlined"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          <Icon fontSize="small">
                            {showNewPassword ? "visibility" : "visibility_off"}
                          </Icon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>

              <MDBox mb={2}>
                <MDInput
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmar Nueva Contraseña"
                  variant="outlined"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <MDBox
                p={2}
                borderRadius={1}
                sx={{
                  backgroundColor: "info.lighter",
                  border: "1px solid",
                  borderColor: "info.main",
                }}
              >
                <MDBox display="flex" alignItems="flex-start">
                  <Icon color="info" sx={{ mr: 1, mt: 0.5 }}>
                    info
                  </Icon>
                  <MDTypography variant="caption" color="text">
                    Se enviará un enlace de restablecimiento a tu correo electrónico. Haz clic en el
                    enlace para completar el cambio de contraseña.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          )}

          {activeTab === "account" && (
            <MDBox>
              <MDTypography variant="body2" color="text" mb={3}>
                Información de tu cuenta
              </MDTypography>

              <MDBox mb={2}>
                <MDInput
                  label="Correo Electrónico"
                  variant="outlined"
                  fullWidth
                  value={currentUser?.email || ""}
                  disabled
                />
              </MDBox>

              <MDBox
                p={2}
                borderRadius={1}
                sx={{
                  backgroundColor: "grey.100",
                }}
              >
                <MDTypography variant="caption" color="text">
                  El correo electrónico no se puede cambiar desde aquí. Contacta al administrador si
                  necesitas cambiar tu correo.
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton variant="outlined" color="secondary" onClick={handleClose}>
            Cancelar
          </MDButton>
          {activeTab === "password" && (
            <MDButton
              variant="gradient"
              color="info"
              onClick={handlePasswordReset}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
            </MDButton>
          )}
        </DialogActions>
      </Dialog>

      <MDSnackbar
        color={snackbar.color}
        icon={
          snackbar.color === "success" ? "check" : snackbar.color === "error" ? "warning" : "info"
        }
        title="Configuración"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsModal;
