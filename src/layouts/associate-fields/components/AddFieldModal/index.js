// src/layouts/associate-fields/components/AddFieldModal/index.js

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

function AddFieldModal({ open, onClose, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setName("");
      setAddress("");
      setDescription("");
      setPricePerHour("");
      setImageUrl("");
      setOpeningTime("08:00");
      setClosingTime("22:00");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) {
      onSubmit({
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
          <Icon sx={{ verticalAlign: "middle", mr: 1 }}>add_circle</Icon>
          Registrar Nueva Cancha
        </MDTypography>
      </MDBox>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
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
                helperText="Pega la URL de una imagen de tu cancha para que los clientes la vean"
              />
            </Grid>

            {/* Nota Informativa */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2} borderRadius="lg" bgColor="warning" variant="gradient" opacity={0.9}>
                  <MDBox display="flex" alignItems="center" mb={1}>
                    <Icon color="white" sx={{ mr: 1 }}>
                      info
                    </Icon>
                    <MDTypography variant="body2" color="white" fontWeight="bold">
                      Nota Importante
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="caption" color="white">
                    Tu cancha será revisada por un administrador antes de ser publicada. Recibirás
                    una notificación cuando sea aprobada.
                  </MDTypography>
                </MDBox>
              </Card>
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
                Registrando...
              </>
            ) : (
              <>
                <Icon sx={{ mr: 1 }}>add</Icon>
                Registrar Cancha
              </>
            )}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

AddFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AddFieldModal.defaultProps = {
  loading: false,
};

export default AddFieldModal;
