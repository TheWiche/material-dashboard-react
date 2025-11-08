// src/layouts/canchas/components/ReservationModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ReservationModal({ open, onClose, onSubmit, loading, field }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
      setSelectedTime("");
      setDuration("1");
    } else if (open && !selectedDate) {
      // Establecer fecha mínima como mañana
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [open, selectedDate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && selectedDate && selectedTime) {
      // Calcular hora de fin basada en la duración
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(duration));

      const endTime = `${endDateTime.getHours().toString().padStart(2, "0")}:${endDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      onSubmit({
        fieldId: field.id,
        fieldName: field.name,
        date: selectedDate,
        startTime: selectedTime,
        endTime: endTime,
        duration: parseInt(duration),
        totalPrice: field.pricePerHour * parseInt(duration),
      });
    }
  };

  // Generar opciones de hora basadas en el horario de la cancha
  const generateTimeOptions = () => {
    if (!field?.openingTime || !field?.closingTime) return [];

    const [openHour, openMin] = field.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = field.closingTime.split(":").map(Number);

    const options = [];
    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}`;
      options.push(timeString);

      currentMin += 30; // Intervalos de 30 minutos
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();
  const totalPrice = field ? field.pricePerHour * parseInt(duration) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reservar Cancha: {field?.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <MDBox mb={2}>
                <MDTypography variant="body2" color="text">
                  <strong>Dirección:</strong> {field?.address}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>Precio por hora:</strong> ${field?.pricePerHour || 0}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>Horario:</strong> {field?.openingTime} - {field?.closingTime}
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="date"
                label="Fecha de Reserva"
                type="date"
                fullWidth
                variant="standard"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date(new Date().setDate(new Date().getDate() + 1))
                    .toISOString()
                    .split("T")[0],
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="time"
                label="Hora de Inicio"
                type="time"
                fullWidth
                variant="standard"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: field?.openingTime || "08:00",
                  max: field?.closingTime || "22:00",
                }}
                helperText={`Horario disponible: ${field?.openingTime} - ${field?.closingTime}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="duration"
                label="Duración (horas)"
                type="number"
                fullWidth
                variant="standard"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                inputProps={{ min: 1, max: 8, step: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <MDBox
                p={2}
                borderRadius="lg"
                bgColor="info"
                variant="gradient"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Total a Pagar:
                </MDTypography>
                <MDTypography variant="h5" color="white" fontWeight="bold">
                  ${totalPrice.toFixed(2)}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={onClose} color="secondary" disabled={loading}>
            Cancelar
          </MDButton>
          <MDButton type="submit" variant="gradient" color="info" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Confirmar Reserva"}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ReservationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  field: PropTypes.object,
};

ReservationModal.defaultProps = {
  loading: false,
  field: null,
};

export default ReservationModal;
