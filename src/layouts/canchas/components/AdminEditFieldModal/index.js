// src/layouts/canchas/components/AdminEditFieldModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "services/firebaseService";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Icon from "@mui/material/Icon";

function AdminEditFieldModal({ open, onClose, onSubmit, loading, field }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [status, setStatus] = useState("pending");
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  // Cargar datos del campo y del dueño cuando se abre el modal
  useEffect(() => {
    if (field && open) {
      setName(field.name || "");
      setAddress(field.address || "");
      setDescription(field.description || "");
      setPricePerHour(field.pricePerHour?.toString() || "");
      setImageUrl(field.imageUrl || "");
      setOpeningTime(field.openingTime || "08:00");
      setClosingTime(field.closingTime || "22:00");
      setStatus(field.status || "pending");

      // Cargar información del dueño
      if (field.ownerId) {
        setLoadingOwner(true);
        getDoc(doc(db, "users", field.ownerId))
          .then((ownerDoc) => {
            if (ownerDoc.exists()) {
              setOwnerInfo(ownerDoc.data());
            }
            setLoadingOwner(false);
          })
          .catch((error) => {
            console.error("Error al cargar información del dueño:", error);
            setLoadingOwner(false);
          });
      }
    } else {
      setOwnerInfo(null);
    }
  }, [field, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && field) {
      onSubmit(field.id, {
        name,
        address,
        description,
        pricePerHour: parseFloat(pricePerHour) || 0,
        imageUrl: imageUrl || null,
        openingTime,
        closingTime,
        status, // El admin puede cambiar el estado
      });
    }
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    if (status === "disabled") return "secondary";
    return "dark";
  };

  if (!field) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <MDBox
        component={DialogTitle}
        bgColor="info"
        variant="gradient"
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <MDTypography variant="h5" color="white" fontWeight="bold">
          <Icon sx={{ verticalAlign: "middle", mr: 1 }}>edit</Icon>
          Editar Cancha
        </MDTypography>
      </MDBox>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información del Dueño - Tarjeta Mejorada */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2.5} borderRadius="lg" bgColor="info" variant="gradient" mb={2}>
                  <MDTypography variant="h6" color="white" fontWeight="bold" mb={1}>
                    <Icon sx={{ verticalAlign: "middle", mr: 1 }}>person</Icon>
                    Información del Dueño
                  </MDTypography>
                </MDBox>
                <MDBox p={2.5}>
                  {loadingOwner ? (
                    <MDBox display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} color="info" />
                    </MDBox>
                  ) : ownerInfo ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1.5}>
                          <Icon color="action" sx={{ mr: 1 }}>
                            badge
                          </Icon>
                          <MDBox>
                            <MDTypography variant="caption" color="text" fontWeight="medium">
                              Nombre
                            </MDTypography>
                            <MDTypography variant="body2" color="text" fontWeight="bold">
                              {ownerInfo.name || "No disponible"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1.5}>
                          <Icon color="action" sx={{ mr: 1 }}>
                            email
                          </Icon>
                          <MDBox>
                            <MDTypography variant="caption" color="text" fontWeight="medium">
                              Correo
                            </MDTypography>
                            <MDTypography variant="body2" color="text" fontWeight="bold">
                              {ownerInfo.email || "No disponible"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <MDBox display="flex" alignItems="center">
                          <Icon color="action" sx={{ mr: 1 }}>
                            vpn_key
                          </Icon>
                          <MDBox>
                            <MDTypography variant="caption" color="text" fontWeight="medium">
                              ID de Usuario
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              color="text"
                              sx={{ wordBreak: "break-all" }}
                            >
                              {field.ownerId}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                    </Grid>
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No se pudo cargar la información del dueño
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Información de la Cancha */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>stadium</Icon>
                Información de la Cancha
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <MDInput
                autoFocus
                label="Nombre de la Cancha"
                type="text"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Dirección"
                type="text"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Descripción"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Precio por Hora ($)"
                type="number"
                fullWidth
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MDInput
                label="Hora de Apertura"
                type="time"
                fullWidth
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MDInput
                label="Hora de Cierre"
                type="time"
                fullWidth
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="URL de la Imagen (opcional)"
                type="url"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                helperText="Pega la URL de una imagen de la cancha"
              />
            </Grid>

            {/* Sección de Estado */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>settings</Icon>
                Estado de la Cancha
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="status-select-label">Estado</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="approved">Aprobada</MenuItem>
                  <MenuItem value="rejected">Rechazada</MenuItem>
                  <MenuItem value="disabled">Deshabilitada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDBox
                p={2}
                borderRadius="lg"
                bgColor={getStatusColor(status)}
                variant="gradient"
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <MDTypography variant="button" color="white" fontWeight="bold">
                  <Icon sx={{ verticalAlign: "middle", mr: 1 }}>info</Icon>
                  Estado: {status.toUpperCase()}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton onClick={onClose} color="secondary" disabled={loading} variant="outlined">
            Cancelar
          </MDButton>
          <MDButton type="submit" variant="gradient" color="info" disabled={loading}>
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Guardando...
              </>
            ) : (
              <>
                <Icon sx={{ mr: 1 }}>save</Icon>
                Guardar Cambios
              </>
            )}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

AdminEditFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

AdminEditFieldModal.defaultProps = {
  loading: false,
  field: null,
};

export default AdminEditFieldModal;
