// src/layouts/associate-reservations/index.js

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp as firestoreServerTimestamp,
} from "firebase/firestore";
import {
  db,
  notifyReservationConfirmed,
  notifyReservationCancelled,
  checkReservationConflict,
  updateReservationStatus,
  sendReservationStatusChangeEmail,
} from "services/firebaseService";
import { useAuth } from "context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Divider from "@mui/material/Divider";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";

// GoalTime App example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ConfirmationDialog from "layouts/admin-users/components/ConfirmationDialog";

function AssociateReservations() {
  const { userProfile, currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterMenu, setFilterMenu] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // "approve" o "reject"
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);
  const [clientsMap, setClientsMap] = useState({}); // Mapa de clientId -> nombre del cliente
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  // Obtener las canchas del asociado primero
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "asociado") {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Obtener las canchas del asociado
    const fieldsQuery = query(collection(db, "canchas"), where("ownerId", "==", currentUser.uid));

    const unsubscribeFields = onSnapshot(fieldsQuery, (fieldsSnapshot) => {
      const fieldIds = fieldsSnapshot.docs.map((doc) => doc.id);

      if (fieldIds.length === 0) {
        setReservations([]);
        setLoading(false);
        return;
      }

      // Obtener todas las reservas y filtrar por las canchas del asociado
      const reservationsQuery = query(collection(db, "reservations"), orderBy("createdAt", "desc"));

      const unsubscribeReservations = onSnapshot(
        reservationsQuery,
        (reservationsSnapshot) => {
          let reservationsData = reservationsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((reservation) => fieldIds.includes(reservation.fieldId));

          // Aplicar filtro de búsqueda
          if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            reservationsData = reservationsData.filter(
              (reservation) =>
                (reservation.fieldName &&
                  reservation.fieldName.toLowerCase().includes(lowercasedFilter)) ||
                (reservation.fieldAddress &&
                  reservation.fieldAddress.toLowerCase().includes(lowercasedFilter)) ||
                (reservation.clientName &&
                  reservation.clientName.toLowerCase().includes(lowercasedFilter))
            );
          }

          // Aplicar filtro de estado
          if (statusFilter !== "all") {
            reservationsData = reservationsData.filter(
              (reservation) => reservation.status === statusFilter
            );
          }

          // Ordenar por fecha de creación (más reciente primero)
          reservationsData.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

          // Obtener información de clientes únicos
          const uniqueClientIds = [
            ...new Set(reservationsData.map((r) => r.clientId).filter((id) => id)),
          ];

          // Obtener nombres de clientes que no están en el mapa
          const clientIdsToFetch = uniqueClientIds.filter(
            (id) => !clientsMap[id] && !reservationsData.find((r) => r.clientId === id)?.clientName
          );

          // Función async para obtener nombres de clientes
          const fetchClientNames = async () => {
            if (clientIdsToFetch.length > 0) {
              const clientPromises = clientIdsToFetch.map(async (clientId) => {
                try {
                  const clientDoc = await getDoc(doc(db, "users", clientId));
                  if (clientDoc.exists()) {
                    return { id: clientId, name: clientDoc.data().name || "Cliente" };
                  }
                  return { id: clientId, name: "Cliente" };
                } catch (error) {
                  console.error(`Error al obtener cliente ${clientId}:`, error);
                  return { id: clientId, name: "Cliente" };
                }
              });

              const clientData = await Promise.all(clientPromises);
              const newClientsMap = { ...clientsMap };
              clientData.forEach((client) => {
                newClientsMap[client.id] = client.name;
              });
              setClientsMap(newClientsMap);
            }
          };

          // Ejecutar la obtención de nombres de clientes sin bloquear
          fetchClientNames().catch((error) => {
            console.error("Error al obtener nombres de clientes:", error);
          });

          setReservations(reservationsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error al obtener reservas:", error);
          setReservations([]);
          setLoading(false);
        }
      );

      return () => unsubscribeReservations();
    });

    return () => unsubscribeFields();
  }, [currentUser, userProfile, searchTerm, statusFilter]);

  const openFilterMenu = (event) => setFilterMenu(event.currentTarget);
  const closeFilterMenu = () => setFilterMenu(null);

  const handleFilterSelect = (status) => {
    setStatusFilter(status);
    closeFilterMenu();
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "warning",
      confirmed: "success",
      cancelled: "error",
      completed: "info",
    };
    return statusMap[status] || "default";
  };

  const getStatusText = (status) => {
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
    const date = dateValue.seconds
      ? new Date(dateValue.seconds * 1000)
      : dateValue.toDate
      ? dateValue.toDate()
      : new Date(dateValue);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "N/A";
    return timeValue;
  };

  const handleApprove = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("approve");
    setIsConfirmOpen(true);
  };

  const handleReject = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("reject");
    setIsConfirmOpen(true);
  };

  const handleViewDetails = async (reservation) => {
    setSelectedReservation(reservation);
    setLoadingClientInfo(true);
    setIsDetailsModalOpen(true);

    // Obtener información del cliente
    try {
      if (reservation.clientId) {
        const clientDoc = await getDoc(doc(db, "users", reservation.clientId));
        if (clientDoc.exists()) {
          setClientInfo(clientDoc.data());
        }
      }
    } catch (error) {
      console.error("Error al obtener información del cliente:", error);
    } finally {
      setLoadingClientInfo(false);
    }
  };

  const confirmActionHandler = async () => {
    if (!selectedReservation) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);

    try {
      // Si se está aprobando, validar que no haya conflictos
      if (confirmAction === "approve") {
        const conflictCheck = await checkReservationConflict(
          selectedReservation.fieldId,
          selectedReservation.date,
          selectedReservation.startTime,
          selectedReservation.endTime,
          selectedReservation.id // Excluir la reserva actual
        );

        if (conflictCheck.hasConflict) {
          setSnackbar({
            open: true,
            color: "error",
            message: `No se puede aprobar esta reserva. El horario (${selectedReservation.startTime} - ${selectedReservation.endTime}) ya está ocupado por otra reserva confirmada de ${conflictCheck.conflictingReservation.clientName}.`,
          });
          setLoadingAction(false);
          return;
        }
      }

      const reservationRef = doc(db, "reservations", selectedReservation.id);
      const newStatus = confirmAction === "approve" ? "confirmed" : "cancelled";

      await updateDoc(reservationRef, {
        status: newStatus,
        updatedAt: firestoreServerTimestamp(),
        reviewedAt: firestoreServerTimestamp(),
        reviewedBy: currentUser.uid,
      });

      // Crear notificación para el cliente
      try {
        if (confirmAction === "approve") {
          await notifyReservationConfirmed(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        } else {
          await notifyReservationCancelled(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        }
      } catch (notificationError) {
        console.error("Error al crear notificación:", notificationError);
        // No fallar la operación principal si la notificación falla
      }

      const actionText = confirmAction === "approve" ? "confirmada" : "rechazada";
      setSnackbar({
        open: true,
        color: "success",
        message: `Reserva ${actionText} exitosamente.`,
      });
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error al actualizar reserva:", error);
      setSnackbar({
        open: true,
        color: "error",
        message: error.message || "Error al procesar la reserva.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Preparar datos para la tabla
  const columns = [
    { Header: "cancha", accessor: "cancha", width: "20%", align: "left" },
    { Header: "cliente", accessor: "cliente", width: "15%", align: "left" },
    { Header: "fecha", accessor: "fecha", align: "center" },
    { Header: "hora", accessor: "hora", align: "center" },
    { Header: "precio", accessor: "precio", align: "center" },
    { Header: "estado", accessor: "estado", align: "center" },
    { Header: "acciones", accessor: "acciones", align: "center" },
  ];

  const rows = reservations.map((reservation) => ({
    cancha: (
      <MDBox>
        <MDTypography variant="button" fontWeight="medium">
          {reservation.fieldName || "Sin nombre"}
        </MDTypography>
        {reservation.fieldAddress && (
          <MDTypography variant="caption" color="text" display="block">
            {reservation.fieldAddress}
          </MDTypography>
        )}
      </MDBox>
    ),
    cliente: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {reservation.clientName || clientsMap[reservation.clientId] || "Cliente"}
      </MDTypography>
    ),
    fecha: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatDate(reservation.date)}
      </MDTypography>
    ),
    hora: (
      <MDTypography variant="caption" color="text">
        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
      </MDTypography>
    ),
    precio: (
      <MDTypography variant="caption" color="success" fontWeight="bold">
        ${reservation.totalPrice?.toLocaleString() || "0"}
      </MDTypography>
    ),
    estado: (
      <MDBox ml={-1}>
        <Chip
          label={getStatusText(reservation.status)}
          color={getStatusColor(reservation.status)}
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      </MDBox>
    ),
    acciones: (
      <MDBox display="flex" gap={1} justifyContent="center">
        <MDButton
          variant="outlined"
          color="info"
          size="small"
          onClick={() => handleViewDetails(reservation)}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>
            visibility
          </Icon>
          Ver
        </MDButton>
        <MDButton
          variant="outlined"
          color="secondary"
          size="small"
          onClick={() => {
            setSelectedReservation(reservation);
            setNewStatus("");
            setStatusChangeReason("");
            setIsChangeStatusModalOpen(true);
          }}
          disabled={changingStatus}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>
            edit
          </Icon>
          Cambiar Estado
        </MDButton>
        {reservation.status === "pending" && (
          <>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={() => handleApprove(reservation)}
              disabled={loadingAction}
            >
              <Icon fontSize="small" sx={{ mr: 0.5 }}>
                check
              </Icon>
              Aprobar
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              size="small"
              onClick={() => handleReject(reservation)}
              disabled={loadingAction}
            >
              <Icon fontSize="small" sx={{ mr: 0.5 }}>
                close
              </Icon>
              Rechazar
            </MDButton>
          </>
        )}
      </MDBox>
    ),
  }));

  if (userProfile?.role !== "asociado") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h4" color="error">
            Acceso denegado. Solo los asociados pueden acceder a esta página.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3} px={3}>
        <MDTypography variant="h4" fontWeight="bold" mb={3}>
          Gestión de Reservas
        </MDTypography>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* Cabecera de la Tarjeta */}
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              ></MDBox>

              {/* Barra de Herramientas */}
              <MDBox p={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <MDInput
                  placeholder="Buscar por cancha, cliente o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: 1, minWidth: 250 }}
                  icon={<Icon>search</Icon>}
                />
                <MDButton variant="outlined" color="info" iconOnly onClick={openFilterMenu}>
                  <Icon>filter_list</Icon>
                </MDButton>
                <Menu anchorEl={filterMenu} open={Boolean(filterMenu)} onClose={closeFilterMenu}>
                  <MenuItem onClick={() => handleFilterSelect("all")}>Todas</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("pending")}>Pendientes</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("confirmed")}>Confirmadas</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("cancelled")}>Canceladas</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("completed")}>Completadas</MenuItem>
                </Menu>
              </MDBox>

              {/* Contenedor de la Tabla */}
              <MDBox>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries
                    noEndBorder
                    canSearch={false}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Diálogo de Confirmación */}
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedReservation(null);
        }}
        onConfirm={confirmActionHandler}
        title={`Confirmar ${confirmAction === "approve" ? "Aprobación" : "Rechazo"}`}
        message={`¿Estás seguro de que quieres ${
          confirmAction === "approve" ? "aprobar" : "rechazar"
        } la reserva para "${selectedReservation?.fieldName || ""}"?`}
        confirmColor={confirmAction === "approve" ? "success" : "error"}
      />

      {/* Modal de Detalles */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <MDBox
          component={DialogTitle}
          bgColor="info"
          variant="gradient"
          p={2.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <MDTypography variant="h5" color="white" fontWeight="bold">
            <Icon sx={{ verticalAlign: "middle", mr: 1 }}>event</Icon>
            Detalles de la Reserva
          </MDTypography>
          {selectedReservation && (
            <Chip
              label={getStatusText(selectedReservation.status)}
              color={getStatusColor(selectedReservation.status)}
              sx={{ color: "white", fontWeight: "bold" }}
            />
          )}
        </MDBox>

        <DialogContent sx={{ p: 3 }}>
          {selectedReservation && (
            <Grid container spacing={3}>
              {/* Información del Cliente */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={2.5} borderRadius="lg" bgColor="info" variant="gradient" mb={2}>
                    <MDTypography variant="h6" color="white" fontWeight="bold">
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>person</Icon>
                      Información del Cliente
                    </MDTypography>
                  </MDBox>
                  <MDBox p={2.5}>
                    {loadingClientInfo ? (
                      <CircularProgress />
                    ) : clientInfo ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <MDBox display="flex" alignItems="center" mb={1.5}>
                            <Icon sx={{ mr: 1 }}>badge</Icon>
                            <MDBox>
                              <MDTypography variant="caption">Nombre</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold">
                                {clientInfo.name || "No disponible"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <MDBox display="flex" alignItems="center" mb={1.5}>
                            <Icon sx={{ mr: 1 }}>email</Icon>
                            <MDBox>
                              <MDTypography variant="caption">Correo</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold">
                                {clientInfo.email || "No disponible"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Grid>
                        <Grid item xs={12}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1 }}>vpn_key</Icon>
                            <MDBox>
                              <MDTypography variant="caption">ID de Usuario</MDTypography>
                              <MDTypography variant="caption" sx={{ wordBreak: "break-all" }}>
                                {selectedReservation.clientId}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Grid>
                      </Grid>
                    ) : (
                      <MDTypography>No se pudo cargar la información del cliente</MDTypography>
                    )}
                  </MDBox>
                </Card>
              </Grid>

              {/* Información de la Reserva */}
              <Grid item xs={12}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  <Icon sx={{ verticalAlign: "middle", mr: 1 }}>event_available</Icon>
                  Información de la Reserva
                </MDTypography>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      sports_soccer
                    </Icon>
                    Cancha
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold">
                    {selectedReservation.fieldName || "No especificado"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      location_on
                    </Icon>
                    Dirección
                  </MDTypography>
                  <MDTypography variant="body1">
                    {selectedReservation.fieldAddress || "No especificada"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={4}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      calendar_today
                    </Icon>
                    Fecha
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold">
                    {formatDate(selectedReservation.date)}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={4}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      schedule
                    </Icon>
                    Horario
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold">
                    {formatTime(selectedReservation.startTime)} -{" "}
                    {formatTime(selectedReservation.endTime)}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={4}>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                      payments
                    </Icon>
                    Precio Total
                  </MDTypography>
                  <MDTypography variant="h6" color="success" fontWeight="bold">
                    ${selectedReservation.totalPrice?.toLocaleString() || "0"}
                  </MDTypography>
                </MDBox>
              </Grid>

              {selectedReservation.createdAt && (
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      <Icon sx={{ verticalAlign: "middle", mr: 0.5, fontSize: "1rem" }}>
                        access_time
                      </Icon>
                      Fecha de Creación
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {formatDate(selectedReservation.createdAt)}
                    </MDTypography>
                  </MDBox>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton
            onClick={() => setIsDetailsModalOpen(false)}
            color="secondary"
            variant="outlined"
          >
            <Icon sx={{ mr: 1 }}>close</Icon>
            Cerrar
          </MDButton>
          {selectedReservation?.status === "pending" && (
            <>
              <MDButton
                variant="gradient"
                color="success"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleApprove(selectedReservation);
                }}
                disabled={loadingAction}
                sx={{ ml: 1 }}
              >
                <Icon sx={{ mr: 1 }}>check</Icon>
                Aprobar Reserva
              </MDButton>
              <MDButton
                variant="gradient"
                color="error"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleReject(selectedReservation);
                }}
                disabled={loadingAction}
                sx={{ ml: 1 }}
              >
                <Icon sx={{ mr: 1 }}>close</Icon>
                Rechazar Reserva
              </MDButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal para cambiar estado */}
      <Dialog
        open={isChangeStatusModalOpen}
        onClose={() => {
          if (!changingStatus) {
            setIsChangeStatusModalOpen(false);
            setNewStatus("");
            setStatusChangeReason("");
            setSelectedReservation(null);
          }
        }}
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
              Cambiar Estado de Reserva
            </MDTypography>
            <MDButton
              iconOnly
              size="small"
              onClick={() => {
                if (!changingStatus) {
                  setIsChangeStatusModalOpen(false);
                  setNewStatus("");
                  setStatusChangeReason("");
                  setSelectedReservation(null);
                }
              }}
              disabled={changingStatus}
            >
              <Icon>close</Icon>
            </MDButton>
          </MDBox>
        </DialogTitle>

        <DialogContent>
          {selectedReservation && (
            <MDBox>
              <MDBox mb={3}>
                <MDTypography variant="body2" color="text" mb={1}>
                  <strong>Cancha:</strong> {selectedReservation.fieldName}
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  <strong>Cliente:</strong>{" "}
                  {selectedReservation.clientName ||
                    clientsMap[selectedReservation.clientId] ||
                    "Cliente"}
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  <strong>Fecha:</strong> {formatDate(selectedReservation.date)}
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={2}>
                  <strong>Hora:</strong> {formatTime(selectedReservation.startTime)} -{" "}
                  {formatTime(selectedReservation.endTime)}
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={1}>
                  <MDTypography variant="body2" color="text">
                    <strong>Estado Actual:</strong>
                  </MDTypography>
                  <Chip
                    label={getStatusText(selectedReservation.status)}
                    color={getStatusColor(selectedReservation.status)}
                    size="small"
                  />
                </MDBox>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Nuevo Estado</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Nuevo Estado"
                  disabled={changingStatus}
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Razón del Cambio"
                multiline
                rows={4}
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Ej: Cliente solicitó cancelación por motivos personales..."
                helperText="Explica brevemente el motivo del cambio de estado. Esta información se enviará al cliente por correo."
                disabled={changingStatus}
                required
              />
            </MDBox>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton
            onClick={() => {
              if (!changingStatus) {
                setIsChangeStatusModalOpen(false);
                setNewStatus("");
                setStatusChangeReason("");
                setSelectedReservation(null);
              }
            }}
            color="secondary"
            variant="outlined"
            disabled={changingStatus}
          >
            Cancelar
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={async () => {
              if (!selectedReservation || !newStatus) return;

              // No permitir cambiar al mismo estado
              if (selectedReservation.status === newStatus) {
                setSnackbar({
                  open: true,
                  color: "warning",
                  message: "La reserva ya está en ese estado.",
                });
                return;
              }

              setChangingStatus(true);
              try {
                // Actualizar el estado
                const updatedReservation = await updateReservationStatus(
                  selectedReservation.id,
                  newStatus,
                  statusChangeReason,
                  currentUser.uid
                );

                // Obtener información del cliente para el correo
                let clientEmail = "";
                let clientName = selectedReservation.clientName || "Cliente";

                try {
                  if (selectedReservation.clientId) {
                    const clientDoc = await getDoc(doc(db, "users", selectedReservation.clientId));
                    if (clientDoc.exists()) {
                      const clientData = clientDoc.data();
                      clientEmail = clientData.email || "";
                      clientName = clientData.name || clientName;
                    }
                  }
                } catch (error) {
                  console.error("Error al obtener información del cliente:", error);
                }

                // Enviar correo de notificación
                if (clientEmail) {
                  try {
                    await sendReservationStatusChangeEmail(
                      { ...selectedReservation, previousStatus: selectedReservation.status },
                      newStatus,
                      statusChangeReason,
                      clientEmail,
                      clientName
                    );
                  } catch (emailError) {
                    console.error("Error al enviar correo:", emailError);
                    // No fallar la operación si el correo falla, pero informar
                    setSnackbar({
                      open: true,
                      color: "warning",
                      message: `Estado actualizado, pero no se pudo enviar el correo: ${emailError.message}`,
                    });
                  }
                }

                setSnackbar({
                  open: true,
                  color: "success",
                  message: `Estado de la reserva actualizado a "${getStatusText(
                    newStatus
                  )}" exitosamente.${
                    clientEmail ? " Se envió una notificación por correo al cliente." : ""
                  }`,
                });

                setIsChangeStatusModalOpen(false);
                setNewStatus("");
                setStatusChangeReason("");
                setSelectedReservation(null);
              } catch (error) {
                console.error("Error al cambiar estado:", error);
                setSnackbar({
                  open: true,
                  color: "error",
                  message: error.message || "Error al cambiar el estado de la reserva.",
                });
              } finally {
                setChangingStatus(false);
              }
            }}
            disabled={
              !newStatus ||
              !statusChangeReason ||
              changingStatus ||
              selectedReservation?.status === newStatus
            }
          >
            {changingStatus ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Procesando...
              </>
            ) : (
              <>
                <Icon sx={{ mr: 1 }}>save</Icon>
                Guardar Cambio
              </>
            )}
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title="Gestión de Reservas"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </DashboardLayout>
  );
}

export default AssociateReservations;
