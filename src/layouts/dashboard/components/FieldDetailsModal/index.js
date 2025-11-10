// src/layouts/dashboard/components/FieldDetailsModal/index.js

import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, Grid, Card, Divider, Chip } from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import MDBadge from "components/MDBadge";

function FieldDetailsModal({ open, onClose, field }) {
  const navigate = useNavigate();
  if (!field) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "disabled":
        return "error";
      case "rejected":
        return "error";
      default:
        return "dark";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      case "disabled":
        return "Deshabilitada";
      case "rejected":
        return "Rechazada";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "check_circle";
      case "pending":
        return "schedule";
      case "disabled":
        return "block";
      case "rejected":
        return "cancel";
      default:
        return "info";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <MDBox
        component={DialogTitle}
        bgColor="info"
        variant="gradient"
        p={2.5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <MDBox display="flex" alignItems="center">
          <Icon sx={{ color: "white", mr: 1, fontSize: "1.5rem" }}>sports_soccer</Icon>
          <MDTypography variant="h5" color="white" fontWeight="bold">
            Detalles de la Cancha
          </MDTypography>
        </MDBox>
        <MDBadge
          badgeContent={getStatusText(field.status)}
          color={getStatusColor(field.status)}
          variant="gradient"
        />
      </MDBox>

      <DialogContent sx={{ p: 0 }}>
        <MDBox p={3}>
          {/* Imagen de la Cancha */}
          {field.imageUrl && (
            <MDBox mb={3}>
              <Card>
                <MDBox
                  component="img"
                  src={field.imageUrl}
                  alt={field.name}
                  sx={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "lg",
                  }}
                />
              </Card>
            </MDBox>
          )}

          {/* Estado Actual */}
          <MDBox mb={3}>
            <Card>
              <MDBox
                p={2.5}
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
                    {getStatusIcon(field.status)}
                  </Icon>
                </MDBox>
              </MDBox>
            </Card>
          </MDBox>

          <Grid container spacing={3}>
            {/* Información General */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>info</Icon>
                Información General
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Nombre de la Cancha
                </MDTypography>
                <MDTypography variant="body1" fontWeight="bold">
                  {field.name || "No especificado"}
                </MDTypography>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Estado
                </MDTypography>
                <MDBox mt={0.5}>
                  <Chip
                    label={getStatusText(field.status)}
                    color={getStatusColor(field.status)}
                    icon={<Icon>{getStatusIcon(field.status)}</Icon>}
                    size="small"
                  />
                </MDBox>
              </MDBox>
            </Grid>

            <Grid item xs={12}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                    location_on
                  </Icon>
                  Dirección
                </MDTypography>
                <MDTypography variant="body1" fontWeight="regular">
                  {field.address || "No especificada"}
                </MDTypography>
              </MDBox>
            </Grid>

            {field.description && (
              <Grid item xs={12}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    Descripción
                  </MDTypography>
                  <MDTypography variant="body2" color="text" sx={{ mt: 0.5 }}>
                    {field.description}
                  </MDTypography>
                </MDBox>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Precio y Horarios */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>attach_money</Icon>
                Precio y Horarios
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={4}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>payments</Icon>
                  Precio por Hora
                </MDTypography>
                <MDTypography variant="h6" color="success" fontWeight="bold">
                  ${field.pricePerHour?.toLocaleString() || "0"}
                </MDTypography>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={4}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>schedule</Icon>
                  Hora de Apertura
                </MDTypography>
                <MDTypography variant="body1" fontWeight="bold">
                  {field.openingTime || "No especificada"}
                </MDTypography>
              </MDBox>
            </Grid>

            <Grid item xs={12} md={4}>
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>schedule</Icon>
                  Hora de Cierre
                </MDTypography>
                <MDTypography variant="body1" fontWeight="bold">
                  {field.closingTime || "No especificada"}
                </MDTypography>
              </MDBox>
            </Grid>

            {/* Información Adicional */}
            {field.createdAt && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      calendar_today
                    </Icon>
                    Fecha de Registro
                  </MDTypography>
                  <MDTypography variant="body2" color="text" sx={{ mt: 0.5 }}>
                    {field.createdAt?.seconds
                      ? new Date(field.createdAt.seconds * 1000).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No disponible"}
                  </MDTypography>
                </Grid>
              </>
            )}
          </Grid>
        </MDBox>
      </DialogContent>

      <MDBox p={3} pt={2} display="flex" justifyContent="flex-end">
        <MDButton onClick={onClose} color="secondary" variant="outlined">
          <Icon sx={{ mr: 1 }}>close</Icon>
          Cerrar
        </MDButton>
        <MDButton
          variant="gradient"
          color="info"
          onClick={() => navigate(`/canchas?edit=${field.id}`)}
          sx={{ ml: 1 }}
        >
          <Icon sx={{ mr: 1 }}>edit</Icon>
          Gestionar Cancha
        </MDButton>
      </MDBox>
    </Dialog>
  );
}

FieldDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  field: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    pricePerHour: PropTypes.number,
    openingTime: PropTypes.string,
    closingTime: PropTypes.string,
    imageUrl: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.shape({
      seconds: PropTypes.number,
    }),
  }),
};

FieldDetailsModal.defaultProps = {
  field: null,
};

export default FieldDetailsModal;
