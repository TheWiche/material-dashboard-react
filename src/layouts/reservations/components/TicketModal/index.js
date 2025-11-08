// src/layouts/reservations/components/TicketModal/index.js

import { useRef, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { sendTicketByEmail } from "services/firebaseService";

function TicketModal({ open, onClose, reservation, userProfile }) {
  const ticketRef = useRef(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    if (dateValue.seconds) {
      const date = new Date(dateValue.seconds * 1000);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const date = new Date(dateValue);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return "N/A";
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReservationStatusColor = (status) => {
    const statusMap = {
      pending: "warning",
      confirmed: "success",
      cancelled: "error",
      completed: "info",
    };
    return statusMap[status] || "secondary";
  };

  const getReservationStatusText = (status) => {
    const statusMap = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada",
    };
    return statusMap[status] || status;
  };

  const handleSendEmail = async () => {
    if (!reservation || !userProfile?.email) {
      setSnackbar({
        open: true,
        color: "error",
        message: "No se puede enviar el ticket. Información incompleta.",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // Generar el HTML del ticket
      const ticketHTML = generateTicketHTML();

      await sendTicketByEmail({
        email: userProfile.email,
        reservationId: reservation.id,
        reservationData: reservation,
        userProfile: userProfile,
        ticketHTML: ticketHTML,
      });

      setSnackbar({
        open: true,
        color: "success",
        message: "Ticket enviado exitosamente a tu correo electrónico.",
      });
    } catch (error) {
      console.error("Error al enviar ticket por correo:", error);
      setSnackbar({
        open: true,
        color: "error",
        message: error.message || "Error al enviar el ticket. Inténtalo de nuevo.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const generateTicketHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Reserva - ${reservation?.fieldName || "Cancha"}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 10px;
              color: #333;
            }
            .ticket-container {
              max-width: 100%;
              margin: 0 auto;
              background: white;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
            }
            .ticket-header {
              text-align: center;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .ticket-header h1 {
              color: #1976d2;
              margin: 0 0 5px 0;
              font-size: 22px;
            }
            .ticket-header p {
              color: #666;
              margin: 0;
              font-size: 12px;
            }
            .ticket-section {
              margin-bottom: 12px;
            }
            .ticket-section h3 {
              color: #1976d2;
              font-size: 14px;
              margin-bottom: 8px;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 4px;
            }
            .ticket-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              padding: 4px 0;
              font-size: 12px;
            }
            .ticket-label {
              font-weight: 600;
              color: #555;
            }
            .ticket-value {
              color: #333;
              text-align: right;
            }
            .ticket-status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-weight: 600;
              font-size: 11px;
              margin-top: 5px;
            }
            .ticket-footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 10px;
            }
            .ticket-qr-placeholder {
              width: 100px;
              height: 100px;
              border: 2px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 10px auto;
              border-radius: 6px;
              background: #f5f5f5;
              font-size: 10px;
            }
            .ticket-qr-placeholder p {
              margin: 0;
              text-align: center;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <h1>GoalTime</h1>
              <p>Ticket de Reserva Deportiva</p>
            </div>
            
            <div class="ticket-section">
              <h3>Información de la Reserva</h3>
              <div class="ticket-row">
                <span class="ticket-label">Número de Reserva:</span>
                <span class="ticket-value">#${
                  reservation?.id?.substring(0, 8).toUpperCase() || "N/A"
                }</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Fecha de Reserva:</span>
                <span class="ticket-value">${formatDate(reservation?.date)}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Hora:</span>
                <span class="ticket-value">${reservation?.startTime || "N/A"} - ${
      reservation?.endTime || "N/A"
    }</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Estado:</span>
                <span class="ticket-value">
                  <span class="ticket-status" style="background-color: ${
                    getReservationStatusColor(reservation?.status) === "success"
                      ? "#4caf50"
                      : getReservationStatusColor(reservation?.status) === "warning"
                      ? "#ff9800"
                      : getReservationStatusColor(reservation?.status) === "error"
                      ? "#f44336"
                      : "#9e9e9e"
                  }; color: white;">
                    ${getReservationStatusText(reservation?.status)}
                  </span>
                </span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información de la Cancha</h3>
              <div class="ticket-row">
                <span class="ticket-label">Nombre:</span>
                <span class="ticket-value">${reservation?.fieldName || "N/A"}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Dirección:</span>
                <span class="ticket-value">${reservation?.fieldAddress || "N/A"}</span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información del Cliente</h3>
              <div class="ticket-row">
                <span class="ticket-label">Nombre:</span>
                <span class="ticket-value">${userProfile?.name || "N/A"}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Email:</span>
                <span class="ticket-value">${userProfile?.email || "N/A"}</span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información de Pago</h3>
              <div class="ticket-row">
                <span class="ticket-label">Total Pagado:</span>
                <span class="ticket-value" style="font-size: 20px; font-weight: bold; color: #4caf50;">
                  $${reservation?.totalPrice || "0"}
                </span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Fecha de Creación:</span>
                <span class="ticket-value">${
                  reservation?.createdAt ? formatDateTime(reservation.createdAt) : "N/A"
                }</span>
              </div>
            </div>

            <div class="ticket-qr-placeholder">
              <p style="color: #999; font-size: 12px;">Código QR<br/>(${
                reservation?.id?.substring(0, 8).toUpperCase() || "N/A"
              })</p>
            </div>

            <div class="ticket-footer">
              <p>© ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.</p>
              <p>Este ticket es válido para la fecha y hora indicadas.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    if (!ticketRef.current) return;

    // Crear un nuevo contenido HTML para el PDF
    const printWindow = window.open("", "_blank");
    const ticketContent = ticketRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Reserva - ${reservation?.fieldName || "Cancha"}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 10px;
              color: #333;
            }
            .ticket-container {
              max-width: 100%;
              margin: 0 auto;
              background: white;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
            }
            .ticket-header {
              text-align: center;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .ticket-header h1 {
              color: #1976d2;
              margin: 0 0 5px 0;
              font-size: 22px;
            }
            .ticket-header p {
              color: #666;
              margin: 0;
              font-size: 12px;
            }
            .ticket-section {
              margin-bottom: 12px;
            }
            .ticket-section h3 {
              color: #1976d2;
              font-size: 14px;
              margin-bottom: 8px;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 4px;
            }
            .ticket-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              padding: 4px 0;
              font-size: 12px;
            }
            .ticket-label {
              font-weight: 600;
              color: #555;
            }
            .ticket-value {
              color: #333;
              text-align: right;
            }
            .ticket-status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-weight: 600;
              font-size: 11px;
              margin-top: 5px;
            }
            .ticket-footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 10px;
            }
            .ticket-qr-placeholder {
              width: 100px;
              height: 100px;
              border: 2px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 10px auto;
              border-radius: 6px;
              background: #f5f5f5;
              font-size: 10px;
            }
            .ticket-qr-placeholder p {
              margin: 0;
              text-align: center;
              line-height: 1.3;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .ticket-container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <h1>GoalTime</h1>
              <p>Ticket de Reserva Deportiva</p>
            </div>
            
            <div class="ticket-section">
              <h3>Información de la Reserva</h3>
              <div class="ticket-row">
                <span class="ticket-label">Número de Reserva:</span>
                <span class="ticket-value">#${
                  reservation?.id?.substring(0, 8).toUpperCase() || "N/A"
                }</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Fecha de Reserva:</span>
                <span class="ticket-value">${formatDate(reservation?.date)}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Hora:</span>
                <span class="ticket-value">${reservation?.startTime || "N/A"} - ${
      reservation?.endTime || "N/A"
    }</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Estado:</span>
                <span class="ticket-value">
                  <span class="ticket-status" style="background-color: ${
                    getReservationStatusColor(reservation?.status) === "success"
                      ? "#4caf50"
                      : getReservationStatusColor(reservation?.status) === "warning"
                      ? "#ff9800"
                      : getReservationStatusColor(reservation?.status) === "error"
                      ? "#f44336"
                      : "#9e9e9e"
                  }; color: white;">
                    ${getReservationStatusText(reservation?.status)}
                  </span>
                </span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información de la Cancha</h3>
              <div class="ticket-row">
                <span class="ticket-label">Nombre:</span>
                <span class="ticket-value">${reservation?.fieldName || "N/A"}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Dirección:</span>
                <span class="ticket-value">${reservation?.fieldAddress || "N/A"}</span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información del Cliente</h3>
              <div class="ticket-row">
                <span class="ticket-label">Nombre:</span>
                <span class="ticket-value">${userProfile?.name || "N/A"}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Email:</span>
                <span class="ticket-value">${userProfile?.email || "N/A"}</span>
              </div>
            </div>

            <div class="ticket-section">
              <h3>Información de Pago</h3>
              <div class="ticket-row">
                <span class="ticket-label">Total Pagado:</span>
                <span class="ticket-value" style="font-size: 20px; font-weight: bold; color: #4caf50;">
                  $${reservation?.totalPrice || "0"}
                </span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Fecha de Creación:</span>
                <span class="ticket-value">${
                  reservation?.createdAt ? formatDateTime(reservation.createdAt) : "N/A"
                }</span>
              </div>
            </div>

            <div class="ticket-qr-placeholder">
              <p style="color: #999; font-size: 12px;">Código QR<br/>(${
                reservation?.id?.substring(0, 8).toUpperCase() || "N/A"
              })</p>
            </div>

            <div class="ticket-footer">
              <p>© ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.</p>
              <p>Este ticket es válido para la fecha y hora indicadas.</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Esperar a que el contenido se cargue y luego imprimir/descargar
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        borderBottom="1px solid"
        borderColor="divider"
      >
        <MDTypography variant="h5" fontWeight="bold">
          Ticket de Reserva
        </MDTypography>
        <IconButton onClick={onClose} size="small">
          <Icon>close</Icon>
        </IconButton>
      </MDBox>
      <DialogContent sx={{ p: 0 }}>
        <MDBox ref={ticketRef} p={2.5}>
          {/* Header del Ticket */}
          <MDBox
            textAlign="center"
            mb={2}
            pb={1.5}
            borderBottom="2px solid"
            borderColor="info.main"
          >
            <MDTypography variant="h5" color="info" fontWeight="bold" mb={0.5}>
              GoalTime
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Ticket de Reserva Deportiva
            </MDTypography>
          </MDBox>

          {/* Información de la Reserva */}
          <MDBox mb={2}>
            <MDTypography
              variant="subtitle2"
              color="info"
              fontWeight="bold"
              mb={1}
              pb={0.5}
              borderBottom="1px solid"
              borderColor="divider"
            >
              Información de la Reserva
            </MDTypography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Número de Reserva
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold">
                  #{reservation.id?.substring(0, 8).toUpperCase() || "N/A"}
                </MDTypography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Estado
                </MDTypography>
                <MDBox mt={0.5}>
                  <Chip
                    label={getReservationStatusText(reservation.status)}
                    color={getReservationStatusColor(reservation.status)}
                    size="small"
                    variant="gradient"
                  />
                </MDBox>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Fecha
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium">
                  {formatDate(reservation.date)}
                </MDTypography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Hora
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium">
                  {reservation.startTime} - {reservation.endTime}
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>

          <Divider sx={{ my: 1.5 }} />

          {/* Información de la Cancha */}
          <MDBox mb={2}>
            <MDTypography
              variant="subtitle2"
              color="info"
              fontWeight="bold"
              mb={1}
              pb={0.5}
              borderBottom="1px solid"
              borderColor="divider"
            >
              Información de la Cancha
            </MDTypography>
            <MDBox display="flex" alignItems="center" mb={0.5}>
              <Icon color="info" sx={{ mr: 0.5, fontSize: 18 }}>
                sports_soccer
              </Icon>
              <MDTypography variant="body2" fontWeight="medium">
                {reservation.fieldName || "N/A"}
              </MDTypography>
            </MDBox>
            <MDBox display="flex" alignItems="center">
              <Icon color="action" sx={{ mr: 0.5, fontSize: 16 }}>
                location_on
              </Icon>
              <MDTypography variant="caption" color="text">
                {reservation.fieldAddress || "Dirección no disponible"}
              </MDTypography>
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 1.5 }} />

          {/* Información del Cliente */}
          <MDBox mb={2}>
            <MDTypography
              variant="subtitle2"
              color="info"
              fontWeight="bold"
              mb={1}
              pb={0.5}
              borderBottom="1px solid"
              borderColor="divider"
            >
              Información del Cliente
            </MDTypography>
            <MDBox display="flex" alignItems="center" mb={0.5}>
              <Icon color="info" sx={{ mr: 0.5, fontSize: 18 }}>
                person
              </Icon>
              <MDTypography variant="body2" fontWeight="medium">
                {userProfile?.name || "N/A"}
              </MDTypography>
            </MDBox>
            <MDBox display="flex" alignItems="center">
              <Icon color="action" sx={{ mr: 0.5, fontSize: 16 }}>
                email
              </Icon>
              <MDTypography variant="caption" color="text">
                {userProfile?.email || "N/A"}
              </MDTypography>
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 1.5 }} />

          {/* Información de Pago */}
          <MDBox mb={2}>
            <MDTypography
              variant="subtitle2"
              color="info"
              fontWeight="bold"
              mb={1}
              pb={0.5}
              borderBottom="1px solid"
              borderColor="divider"
            >
              Información de Pago
            </MDTypography>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Total Pagado
              </MDTypography>
              <MDTypography variant="h6" color="success" fontWeight="bold">
                ${reservation.totalPrice || "0"}
              </MDTypography>
            </MDBox>
            {reservation.createdAt && (
              <MDBox display="flex" alignItems="center">
                <Icon color="action" sx={{ mr: 0.5, fontSize: 16 }}>
                  access_time
                </Icon>
                <MDTypography variant="caption" color="text.secondary" fontSize="10px">
                  Reserva creada: {formatDateTime(reservation.createdAt)}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>

          {/* QR Code Placeholder */}
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
            mb={3}
            border="2px dashed"
            borderColor="divider"
            borderRadius={2}
            bgcolor="grey.50"
          >
            <MDBox textAlign="center">
              <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }}>qr_code</Icon>
              <MDTypography variant="caption" color="text.secondary">
                Código QR de Reserva
              </MDTypography>
              <MDTypography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                display="block"
                mt={0.5}
              >
                #{reservation.id?.substring(0, 8).toUpperCase() || "N/A"}
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Footer del Ticket */}
          <MDBox textAlign="center" pt={2} borderTop="2px solid" borderColor="divider">
            <MDTypography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} GoalTime. Todos los derechos reservados.
            </MDTypography>
            <MDTypography variant="caption" color="text.secondary" display="block" mt={1}>
              Este ticket es válido para la fecha y hora indicadas.
            </MDTypography>
          </MDBox>
        </MDBox>
      </DialogContent>
      <MDBox
        display="flex"
        justifyContent="space-between"
        gap={2}
        p={2}
        borderTop="1px solid"
        borderColor="divider"
      >
        <MDButton variant="outlined" color="secondary" onClick={onClose}>
          Cerrar
        </MDButton>
        <MDBox display="flex" gap={2}>
          <MDButton
            variant="outlined"
            color="info"
            onClick={handleSendEmail}
            disabled={sendingEmail}
          >
            <Icon sx={{ mr: 1 }}>{sendingEmail ? "hourglass_empty" : "email"}</Icon>
            {sendingEmail ? "Enviando..." : "Enviar por Correo"}
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={handleDownloadPDF}>
            <Icon sx={{ mr: 1 }}>download</Icon>
            Descargar Ticket
          </MDButton>
        </MDBox>
      </MDBox>

      <MDSnackbar
        color={snackbar.color}
        icon={
          snackbar.color === "success" ? "check" : snackbar.color === "error" ? "warning" : "info"
        }
        title="Ticket"
        content={snackbar.message}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        close={() => setSnackbar({ ...snackbar, open: false })}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </Dialog>
  );
}

TicketModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  userProfile: PropTypes.object,
};

export default TicketModal;
