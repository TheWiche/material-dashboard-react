/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Icon from "@mui/material/Icon";
import { CircularProgress, Tooltip, Box } from "@mui/material";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDAvatar from "components/MDAvatar";
import { FullScreenLoader } from "components/FullScreenLoader";

// Services
import {
  sendPasswordReset,
  verifyCurrentPassword,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "services/firebaseService";
import { useAuth } from "context/AuthContext";

function SettingsModal({ open, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [activeTab, setActiveTab] = useState("account"); // "password" o "account"
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setSnackbar({ open: false, color: "info", message: "" });
    // Limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const processFile = async (file) => {
    if (!file || !currentUser) return;

    setSnackbar({ open: false, color: "info", message: "" });
    setUploadingPhoto(true);

    try {
      await uploadProfilePhoto(file, currentUser.uid);
      setSnackbar({
        open: true,
        color: "success",
        message: "Foto de perfil actualizada exitosamente.",
      });
      // El perfil se actualizará automáticamente gracias al listener en AuthContext
    } catch (error) {
      console.error("Error al subir foto:", error);
      setSnackbar({
        open: true,
        color: "error",
        message: error.message || "Error al subir la foto. Por favor, inténtalo más tarde.",
      });
    } finally {
      setUploadingPhoto(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    await processFile(file);
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processFile(file);
    } else {
      setSnackbar({
        open: true,
        color: "error",
        message: "Por favor, arrastra solo archivos de imagen.",
      });
    }
  };

  const handlePhotoDelete = async () => {
    if (!currentUser) return;

    if (!window.confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) {
      return;
    }

    setSnackbar({ open: false, color: "info", message: "" });
    setUploadingPhoto(true);

    try {
      await deleteProfilePhoto(currentUser.uid);
      setSnackbar({
        open: true,
        color: "success",
        message: "Foto de perfil eliminada exitosamente.",
      });
      // El perfil se actualizará automáticamente gracias al listener en AuthContext
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      setSnackbar({
        open: true,
        color: "error",
        message: error.message || "Error al eliminar la foto. Por favor, inténtalo más tarde.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentPassword) {
      setSnackbar({
        open: true,
        color: "warning",
        message: "Por favor, ingresa tu contraseña actual.",
      });
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
      // PRIMERO: Verificar que la contraseña actual sea correcta
      await verifyCurrentPassword(currentPassword);

      // SI la contraseña es correcta, enviar email de restablecimiento
      await sendPasswordReset(currentUser.email);
      setSnackbar({
        open: true,
        color: "success",
        message:
          "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.",
      });
      // Limpiar campo después de un momento
      setTimeout(() => {
        setCurrentPassword("");
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error);
      let errorMessage =
        "Ocurrió un error al solicitar el restablecimiento. Por favor, inténtalo más tarde.";

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage =
          "La contraseña actual es incorrecta. Por favor, verifica e intenta nuevamente.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No se encontró tu cuenta.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Por favor, espera unos minutos.";
      }

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
                variant={activeTab === "account" ? "contained" : "text"}
                color={activeTab === "account" ? "info" : "secondary"}
                onClick={() => setActiveTab("account")}
                sx={{ borderRadius: 0, borderBottom: activeTab === "account" ? 2 : 0 }}
              >
                <Icon sx={{ mr: 1 }}>account_circle</Icon>
                Cuenta
              </MDButton>
              <MDButton
                variant={activeTab === "password" ? "contained" : "text"}
                color={activeTab === "password" ? "info" : "secondary"}
                onClick={() => setActiveTab("password")}
                sx={{ borderRadius: 0, borderBottom: activeTab === "password" ? 2 : 0 }}
              >
                <Icon sx={{ mr: 1 }}>lock</Icon>
                Cambiar Contraseña
              </MDButton>
            </MDBox>
          </MDBox>

          {activeTab === "password" && (
            <MDBox>
              <MDTypography variant="body2" color="text" mb={3}>
                Para cambiar tu contraseña, primero verifica tu contraseña actual. Luego te
                enviaremos un enlace a tu correo electrónico para establecer una nueva contraseña.
              </MDTypography>

              <MDBox mb={3}>
                <MDInput
                  type={showCurrentPassword ? "text" : "password"}
                  label="Contraseña Actual"
                  variant="outlined"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
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
                    Después de verificar tu contraseña actual, se enviará un enlace de
                    restablecimiento a tu correo electrónico. Haz clic en el enlace para establecer
                    una nueva contraseña.
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

              {/* Foto de Perfil con Drag & Drop */}
              <MDBox mb={4}>
                <MDTypography variant="body2" color="text" fontWeight="medium" mb={2}>
                  Foto de Perfil
                </MDTypography>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                  sx={{
                    position: "relative",
                    width: "100%",
                    minHeight: "200px",
                    border: "2px dashed",
                    borderColor: isDragging ? "info.main" : "grey.300",
                    borderRadius: 2,
                    backgroundColor: isDragging ? "info.lighter" : "grey.50",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 3,
                    cursor: uploadingPhoto ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor: uploadingPhoto ? "grey.300" : "info.main",
                      backgroundColor: uploadingPhoto ? "grey.50" : "info.lighter",
                    },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                    id="photo-upload-input"
                    disabled={uploadingPhoto || isLoading}
                  />

                  {uploadingPhoto ? (
                    <>
                      <CircularProgress size={48} color="info" sx={{ mb: 2 }} />
                      <MDTypography variant="body2" color="text" fontWeight="medium">
                        Subiendo foto...
                      </MDTypography>
                    </>
                  ) : userProfile?.photoURL ? (
                    <>
                      <MDBox position="relative" mb={2}>
                        <MDAvatar
                          src={userProfile.photoURL}
                          alt={userProfile?.name || "Usuario"}
                          size="xl"
                          shadow="md"
                        >
                          {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                        </MDAvatar>
                        {/* Botón para eliminar foto */}
                        <MDBox
                          position="absolute"
                          top={-8}
                          right={-8}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoDelete();
                          }}
                          sx={{
                            cursor: "pointer",
                            zIndex: 10,
                          }}
                        >
                          <IconButton
                            size="small"
                            disabled={uploadingPhoto || isLoading}
                            sx={{
                              bgcolor: "error.main",
                              color: "white",
                              width: 32,
                              height: 32,
                              boxShadow: 3,
                              "&:hover": {
                                bgcolor: "error.dark",
                                transform: "scale(1.1)",
                              },
                              "&:disabled": { bgcolor: "grey.400" },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      </MDBox>
                      <MDTypography variant="body2" color="text" fontWeight="medium" mb={1}>
                        {userProfile?.name || "Usuario"}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" textAlign="center">
                        Arrastra una nueva imagen aquí o haz clic para cambiar
                        <br />
                        (Máximo 5MB, formatos: JPG, PNG, GIF, WebP)
                      </MDTypography>
                    </>
                  ) : (
                    <>
                      <Icon
                        sx={{
                          fontSize: 64,
                          color: isDragging ? "info.main" : "grey.400",
                          mb: 2,
                          transition: "color 0.3s ease-in-out",
                        }}
                      >
                        {isDragging ? "cloud_upload" : "add_photo_alternate"}
                      </Icon>
                      <MDTypography variant="body2" color="text" fontWeight="medium" mb={1}>
                        {isDragging
                          ? "Suelta la imagen aquí"
                          : "Arrastra una imagen aquí o haz clic para seleccionar"}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" textAlign="center">
                        Máximo 5MB
                        <br />
                        Formatos: JPG, PNG, GIF, WebP
                      </MDTypography>
                    </>
                  )}
                </Box>
              </MDBox>

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
          <MDButton variant="outlined" color="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </MDButton>
          {activeTab === "password" && (
            <MDButton
              variant="gradient"
              color="info"
              onClick={handlePasswordReset}
              disabled={isLoading || !currentPassword}
            >
              {isLoading ? "Verificando..." : "Verificar y Enviar Enlace"}
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
