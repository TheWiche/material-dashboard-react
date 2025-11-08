// src/layouts/associate-fields/components/EditFieldModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Card,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Icon from "@mui/material/Icon";
import MDBadge from "components/MDBadge";

function EditFieldModal({ open, onClose, onSubmit, loading, field }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");

  // Cargar datos del campo cuando se abre el modal
  useEffect(() => {
    if (field && open) {
      setName(field.name || "");
      setAddress(field.address || "");
      setDescription(field.description || "");
      setPricePerHour(field.pricePerHour?.toString() || "");
      setImageUrl(field.imageUrl || "");
      setOpeningTime(field.openingTime || "08:00");
      setClosingTime(field.closingTime || "22:00");
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

  const getStatusText = (status) => {
    const statusMap = {
      approved: "Aprobada",
      pending: "Pendiente",
      rejected: "Rechazada",
      disabled: "Deshabilitada",
    };
    return statusMap[status] || status;
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
        <MDBadge
          badgeContent={getStatusText(field.status)}
          color={getStatusColor(field.status)}
          variant="gradient"
        />
      </MDBox>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Estado Actual */}
            <Grid item xs={12}>
              <Card>
                <MDBox
                  p={2}
                  borderRadius="lg"
                  bgColor={getStatusColor(field.status)}
                  variant="gradient"
                  opacity={0.9}
                >
                  <MDBox display="flex" alignItems="center" justifyContent="space-between">
                    <MDBox>
                      <MDTypography variant="caption" color="white" fontWeight="medium">
                        Estado Actual
                      </MDTypography>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        {getStatusText(field.status)}
                      </MDTypography>
                    </MDBox>
                    <Icon color="white" fontSize="large">
                      {field.status === "approved"
                        ? "check_circle"
                        : field.status === "pending"
                        ? "schedule"
                        : field.status === "rejected"
                        ? "cancel"
                        : "block"}
                    </Icon>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Información General */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>info</Icon>
                Información General
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
                label="Dirección Completa"
                type="text"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Descripción (opcional)"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText="Describe las características de tu cancha"
              />
            </Grid>

            {/* Precio y Horarios */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2} mt={1}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>attach_money</Icon>
                Precio y Horarios
              </MDTypography>
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

            {/* Imagen */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2} mt={1}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>image</Icon>
                Imagen de la Cancha
              </MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="URL de la Imagen (opcional)"
                type="url"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                helperText="Pega la URL de una imagen de tu cancha"
              />
            </Grid>

            {/* Nota Informativa */}
            {field.status === "approved" && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={2} borderRadius="lg" bgColor="warning" variant="gradient" opacity={0.9}>
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <Icon color="white" sx={{ mr: 1 }}>
                        warning
                      </Icon>
                      <MDTypography variant="body2" color="white" fontWeight="bold">
                        Nota Importante
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="caption" color="white">
                      Al editar una cancha aprobada, volverá a estado &quot;Pendiente&quot; y
                      necesitará ser revisada nuevamente por un administrador.
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            )}
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

EditFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

EditFieldModal.defaultProps = {
  loading: false,
  field: null,
};

export default EditFieldModal;
