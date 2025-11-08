/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  Divider,
  Chip,
  CircularProgress,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Icon from "@mui/material/Icon";
import TicketModal from "./components/TicketModal";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// GoalTime App example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useAuth } from "context/AuthContext";
import { db } from "services/firebaseService";

function Reservations() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Obtener reservaciones del usuario
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") {
      setLoadingReservations(false);
      return;
    }

    setLoadingReservations(true);
    try {
      const reservationsQuery = query(
        collection(db, "reservations"),
        where("clientId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        reservationsQuery,
        (snapshot) => {
          const reservationsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationsData);
          setFilteredReservations(reservationsData);
          setLoadingReservations(false);
        },
        (error) => {
          console.error("Error al obtener reservaciones:", error);
          // Si hay error de índice, intentar sin orderBy
          if (error.code === "failed-precondition" || error.message?.includes("index")) {
            console.warn("Índice faltante. Obteniendo reservaciones sin ordenar...");
            const simpleQuery = query(
              collection(db, "reservations"),
              where("clientId", "==", currentUser.uid)
            );
            const unsubscribeSimple = onSnapshot(
              simpleQuery,
              (snapshot) => {
                const reservationsData = snapshot.docs
                  .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }))
                  .sort((a, b) => {
                    const dateA = a.createdAt?.seconds || a.createdAt?.toMillis?.() / 1000 || 0;
                    const dateB = b.createdAt?.seconds || b.createdAt?.toMillis?.() / 1000 || 0;
                    return dateB - dateA;
                  });
                setReservations(reservationsData);
                setFilteredReservations(reservationsData);
                setLoadingReservations(false);
              },
              (simpleError) => {
                console.error("Error al obtener reservaciones (sin ordenar):", simpleError);
                setLoadingReservations(false);
              }
            );
            return () => unsubscribeSimple();
          } else {
            setLoadingReservations(false);
          }
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error al crear query de reservaciones:", error);
      setLoadingReservations(false);
    }
  }, [currentUser, userProfile]);

  // Filtrar reservaciones
  useEffect(() => {
    let filtered = [...reservations];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.fieldName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.fieldAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((reservation) => reservation.status === statusFilter);
    }

    setFilteredReservations(filtered);
  }, [searchTerm, statusFilter, reservations]);

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

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    // Si es un timestamp de Firestore
    if (dateValue.seconds) {
      const date = new Date(dateValue.seconds * 1000);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Si es una cadena de fecha (YYYY-MM-DD)
    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const date = new Date(dateValue);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Si es un objeto Date
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return "N/A";
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "N/A";

    let date;
    if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else if (typeof dateValue === "string" && dateValue.includes("-")) {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "N/A";
    }

    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userProfile?.role !== "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mb={2} />
        <MDBox p={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={2}>
            Acceso Restringido
          </MDTypography>
          <MDTypography variant="body1" color="text">
            Esta página está disponible solo para clientes.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox p={3}>
        {/* Header con título, descripción y botón */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDTypography variant="h4" fontWeight="bold" mb={1}>
                Mis Reservaciones
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Gestiona y visualiza todas tus reservas de canchas deportivas
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <MDButton variant="gradient" color="info" onClick={() => navigate("/canchas")}>
                <Icon sx={{ mr: 1 }}>add</Icon>
                Nueva Reserva
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        {/* Filtros y Búsqueda */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDInput
                  fullWidth
                  placeholder="Buscar por nombre de cancha o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  select
                  fullWidth
                  label="Filtrar por Estado"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                </MDInput>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Estadísticas Rápidas */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <MDBox p={2} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="info">
                  {reservations.length}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Total Reservas
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <MDBox p={2} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="warning">
                  {reservations.filter((r) => r.status === "pending").length}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Pendientes
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <MDBox p={2} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="success">
                  {reservations.filter((r) => r.status === "confirmed").length}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Confirmadas
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <MDBox p={2} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="error">
                  {reservations.filter((r) => r.status === "cancelled").length}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Canceladas
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de Reservaciones */}
        <Card>
          <MDBox p={3}>
            {loadingReservations ? (
              <MDBox display="flex" justifyContent="center" p={4}>
                <CircularProgress color="info" />
              </MDBox>
            ) : filteredReservations.length === 0 ? (
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={4}
              >
                <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>event_busy</Icon>
                <MDTypography variant="h6" color="text" fontWeight="medium" mb={1}>
                  {reservations.length === 0
                    ? "No tienes reservaciones aún"
                    : "No se encontraron reservaciones con los filtros aplicados"}
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={3} textAlign="center">
                  {reservations.length === 0
                    ? "¡Comienza a reservar canchas y aparecerán aquí!"
                    : "Intenta ajustar los filtros de búsqueda"}
                </MDTypography>
                {reservations.length === 0 && (
                  <MDButton variant="gradient" color="info" onClick={() => navigate("/canchas")}>
                    <Icon sx={{ mr: 1 }}>sports_soccer</Icon>
                    Ver Canchas Disponibles
                  </MDButton>
                )}
              </MDBox>
            ) : (
              <MDBox>
                {filteredReservations.map((reservation) => (
                  <Card
                    key={reservation.id}
                    sx={{
                      mb: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        boxShadow: 4,
                        borderColor: "primary.main",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <MDBox p={3}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={7}>
                          <MDBox>
                            <MDTypography variant="h5" fontWeight="bold" mb={1.5}>
                              {reservation.fieldName || "Cancha"}
                            </MDTypography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <MDBox display="flex" alignItems="center" mb={1}>
                                  <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                    location_on
                                  </Icon>
                                  <MDTypography variant="body2" color="text">
                                    {reservation.fieldAddress || "Dirección no disponible"}
                                  </MDTypography>
                                </MDBox>
                                <MDBox display="flex" alignItems="center" mb={1}>
                                  <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                    calendar_today
                                  </Icon>
                                  <MDTypography variant="body2" color="text">
                                    {formatDate(reservation.date)}
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <MDBox display="flex" alignItems="center" mb={1}>
                                  <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                    schedule
                                  </Icon>
                                  <MDTypography variant="body2" color="text">
                                    {reservation.startTime} - {reservation.endTime}
                                  </MDTypography>
                                </MDBox>
                                {reservation.createdAt && (
                                  <MDBox display="flex" alignItems="center">
                                    <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                      access_time
                                    </Icon>
                                    <MDTypography variant="caption" color="text.secondary">
                                      {formatDateTime(reservation.createdAt)}
                                    </MDTypography>
                                  </MDBox>
                                )}
                              </Grid>
                            </Grid>
                          </MDBox>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <MDBox
                            display="flex"
                            flexDirection="column"
                            alignItems={{ xs: "flex-start", md: "center" }}
                          >
                            <MDTypography
                              variant="caption"
                              color="text"
                              fontWeight="medium"
                              mb={1}
                              display="block"
                            >
                              Estado
                            </MDTypography>
                            <Chip
                              label={getReservationStatusText(reservation.status)}
                              color={getReservationStatusColor(reservation.status)}
                              size="medium"
                              variant="gradient"
                              sx={{ mb: 2 }}
                            />
                            {reservation.totalPrice && (
                              <MDBox textAlign={{ xs: "left", md: "center" }}>
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  fontWeight="medium"
                                  display="block"
                                  mb={0.5}
                                >
                                  Total
                                </MDTypography>
                                <MDTypography variant="h6" color="success" fontWeight="bold">
                                  ${reservation.totalPrice}
                                </MDTypography>
                              </MDBox>
                            )}
                          </MDBox>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <MDBox
                            display="flex"
                            flexDirection="column"
                            gap={1}
                            alignItems={{ xs: "flex-start", md: "flex-end" }}
                          >
                            <MDButton
                              variant="gradient"
                              color="info"
                              size="small"
                              fullWidth
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setIsTicketModalOpen(true);
                              }}
                            >
                              <Icon sx={{ mr: 1 }}>confirmation_number</Icon>
                              Ver Ticket
                            </MDButton>
                          </MDBox>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Card>
                ))}
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>

      <TicketModal
        open={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        userProfile={userProfile}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default Reservations;
