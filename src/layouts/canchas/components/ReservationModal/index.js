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
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import { getAvailableTimeSlots } from "services/firebaseService";

function ReservationModal({ open, onClose, onSubmit, loading, field }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
      setSelectedTime("");
      setDuration("1");
      setAvailableTimes([]);
    } else if (open && !selectedDate) {
      // Establecer fecha mínima como mañana
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [open, selectedDate]);

  // Cargar horas disponibles cuando cambia la fecha o se abre el modal
  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!open || !field || !selectedDate || !field.openingTime || !field.closingTime) {
        setAvailableTimes([]);
        return;
      }

      setLoadingTimes(true);
      try {
        const times = await getAvailableTimeSlots(
          field.id,
          selectedDate,
          field.openingTime,
          field.closingTime
        );
        setAvailableTimes(times);

        // Si la hora seleccionada ya no está disponible, limpiarla
        if (selectedTime && !times.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch (error) {
        console.error("Error al cargar horas disponibles:", error);
        // En caso de error, generar todas las horas del horario como fallback
        if (field?.openingTime && field?.closingTime) {
          const [openHour, openMin] = field.openingTime.split(":").map(Number);
          const [closeHour, closeMin] = field.closingTime.split(":").map(Number);
          const allTimes = [];
          let currentHour = openHour;
          let currentMin = openMin;

          while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            allTimes.push(
              `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`
            );
            currentMin += 30;
            if (currentMin >= 60) {
              currentMin = 0;
              currentHour += 1;
            }
          }
          setAvailableTimes(allTimes);
        } else {
          setAvailableTimes([]);
        }
      } finally {
        setLoadingTimes(false);
      }
    };

    loadAvailableTimes();
  }, [open, field, selectedDate, selectedTime]);

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
            <Grid item xs={12}>
              <MDBox>
                <MDTypography variant="body2" fontWeight="medium" mb={1.5}>
                  Hora de Inicio
                  {loadingTimes && (
                    <CircularProgress size={14} sx={{ ml: 1, verticalAlign: "middle" }} />
                  )}
                </MDTypography>
                {loadingTimes ? (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                    borderRadius="lg"
                    bgcolor="grey.100"
                  >
                    <CircularProgress size={24} />
                    <MDTypography variant="body2" color="text" sx={{ ml: 2 }}>
                      Cargando horas disponibles...
                    </MDTypography>
                  </MDBox>
                ) : availableTimes.length === 0 ? (
                  <MDBox
                    p={2}
                    borderRadius="lg"
                    bgcolor="error.lighter"
                    border="1px solid"
                    borderColor="error.main"
                  >
                    <MDBox display="flex" alignItems="center">
                      <Icon sx={{ color: "error.main", mr: 1 }}>info</Icon>
                      <MDTypography variant="body2" color="error">
                        No hay horas disponibles para esta fecha. Por favor, selecciona otra fecha.
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                ) : (
                  <MDBox>
                    <MDBox
                      display="flex"
                      flexWrap="wrap"
                      gap={1}
                      p={2}
                      borderRadius="lg"
                      bgcolor="grey.50"
                      border="1px solid"
                      borderColor="divider"
                      maxHeight="200px"
                      sx={{
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                          width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "rgba(0,0,0,0.3)",
                        },
                      }}
                    >
                      {availableTimes.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <Tooltip key={time} title={`Hora disponible: ${time}`} arrow>
                            <Chip
                              label={time}
                              onClick={() => setSelectedTime(time)}
                              sx={{
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                transform: isSelected ? "scale(1.05)" : "scale(1)",
                                bgcolor: isSelected ? "info.main" : "white",
                                color: isSelected ? "white" : "text.primary",
                                fontWeight: isSelected ? "bold" : "normal",
                                border: isSelected ? "2px solid" : "1px solid",
                                borderColor: isSelected ? "info.dark" : "divider",
                                "&:hover": {
                                  bgcolor: isSelected ? "info.dark" : "info.lighter",
                                },
                                boxShadow: isSelected
                                  ? "0 4px 8px rgba(0,0,0,0.15)"
                                  : "0 2px 4px rgba(0,0,0,0.08)",
                                "& .MuiChip-label": {
                                  px: 2,
                                  py: 1,
                                  fontSize: "0.875rem",
                                },
                              }}
                              icon={
                                isSelected ? (
                                  <Icon sx={{ color: "white !important", fontSize: "1rem" }}>
                                    check_circle
                                  </Icon>
                                ) : (
                                  <Icon sx={{ color: "info.main", fontSize: "1rem" }}>
                                    schedule
                                  </Icon>
                                )
                              }
                            />
                          </Tooltip>
                        );
                      })}
                    </MDBox>
                    <MDBox mt={1} display="flex" alignItems="center" justifyContent="space-between">
                      <MDTypography variant="caption" color="text">
                        <Icon sx={{ fontSize: "0.875rem", verticalAlign: "middle", mr: 0.5 }}>
                          info
                        </Icon>
                        {availableTimes.length} hora(s) disponible(s)
                      </MDTypography>
                      {selectedTime && (
                        <MDTypography variant="caption" color="success" fontWeight="medium">
                          <Icon sx={{ fontSize: "0.875rem", verticalAlign: "middle", mr: 0.5 }}>
                            check_circle
                          </Icon>
                          Seleccionada: {selectedTime}
                        </MDTypography>
                      )}
                    </MDBox>
                  </MDBox>
                )}
              </MDBox>
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
