// src/layouts/canchas/index.js

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from "firebase/firestore";
import {
  db,
  createReservation,
  updateFieldAsAdmin,
  callApproveFieldRequest,
  notifyReservationCreated,
  notifyReservationReceived,
  addToFavorites,
  removeFromFavorites,
  subscribeToFavorites,
} from "services/firebaseService";
import { useAuth } from "context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBadge from "components/MDBadge";
import Tooltip from "@mui/material/Tooltip";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// GoalTime App example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReservationModal from "layouts/canchas/components/ReservationModal";
import AdminEditFieldModal from "layouts/canchas/components/AdminEditFieldModal";
import ConfirmationDialog from "layouts/admin-users/components/ConfirmationDialog";

function Canchas() {
  const { userProfile, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMenu, setFilterMenu] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToApprove, setFieldToApprove] = useState(null);
  const [confirmAction, setConfirmAction] = useState(""); // "approve" o "reject"
  const [loadingAction, setLoadingAction] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const hasProcessedEditParam = useRef(false);

  const openFilterMenu = (event) => setFilterMenu(event.currentTarget);
  const closeFilterMenu = () => setFilterMenu(null);
  const handleFilterSelect = (status) => {
    console.log("Filtro seleccionado:", status); // Debug temporal
    setStatusFilter(status);
    closeFilterMenu();
  };

  // Detectar parámetro 'edit' en la URL y abrir modal automáticamente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fieldIdToEdit = searchParams.get("edit");

    if (
      fieldIdToEdit &&
      userProfile?.role === "admin" &&
      !isEditModalOpen &&
      !loading &&
      !hasProcessedEditParam.current
    ) {
      hasProcessedEditParam.current = true;

      // Buscar la cancha en el estado actual
      const fieldInState = fields.find((f) => f.id === fieldIdToEdit);

      if (fieldInState) {
        setFieldToEdit(fieldInState);
        setIsEditModalOpen(true);
        // Limpiar el parámetro de la URL
        navigate("/canchas", { replace: true });
      } else {
        // Si no está en el estado, cargarla directamente desde Firestore
        getDoc(doc(db, "canchas", fieldIdToEdit))
          .then((fieldDoc) => {
            if (fieldDoc.exists()) {
              setFieldToEdit({ id: fieldDoc.id, ...fieldDoc.data() });
              setIsEditModalOpen(true);
              navigate("/canchas", { replace: true });
            } else {
              setSnackbar({
                open: true,
                color: "error",
                message: "La cancha no fue encontrada.",
              });
              navigate("/canchas", { replace: true });
            }
          })
          .catch((error) => {
            console.error("Error al cargar la cancha:", error);
            setSnackbar({
              open: true,
              color: "error",
              message: "Error al cargar la cancha.",
            });
            navigate("/canchas", { replace: true });
          });
      }
    }

    // Resetear la bandera cuando cambia el parámetro de la URL
    if (!searchParams.get("edit")) {
      hasProcessedEditParam.current = false;
    }
  }, [location.search, fields, userProfile, isEditModalOpen, loading, navigate]);

  useEffect(() => {
    if (!userProfile) return; // Esperar a que userProfile esté disponible

    console.log("Aplicando filtro:", statusFilter, "Rol:", userProfile.role); // Debug temporal
    setLoading(true);
    let fieldsQuery;

    // Construir la consulta sin orderBy para evitar problemas de índices compuestos
    // Ordenaremos manualmente después
    if (userProfile.role === "admin") {
      if (statusFilter === "all") {
        // Para "all", obtener todas las canchas
        fieldsQuery = query(collection(db, "canchas"));
      } else {
        // Para filtros específicos, usar where sin orderBy
        fieldsQuery = query(collection(db, "canchas"), where("status", "==", statusFilter));
      }
    } else {
      // Para clientes, solo mostrar aprobadas
      fieldsQuery = query(collection(db, "canchas"), where("status", "==", "approved"));
    }

    const unsubscribe = onSnapshot(
      fieldsQuery,
      (snapshot) => {
        let fieldsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        console.log(`Canchas encontradas con filtro "${statusFilter}":`, fieldsData.length); // Debug temporal
        console.log(
          "Estados de las canchas:",
          fieldsData.map((f) => ({ name: f.name, status: f.status }))
        ); // Debug temporal

        // Ordenar manualmente por fecha de creación (más reciente primero)
        fieldsData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || a.createdAt?.toMillis?.() / 1000 || 0;
          const bTime = b.createdAt?.seconds || b.createdAt?.toMillis?.() / 1000 || 0;
          return bTime - aTime; // Descendente
        });

        setFields(fieldsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener canchas:", error);
        setFields([]);
        setLoading(false);
        setSnackbar({
          open: true,
          color: "error",
          message: "Error al cargar las canchas: " + (error.message || "Error desconocido"),
        });
      }
    );

    return () => unsubscribe();
  }, [userProfile, statusFilter]);

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

  const filterTitles = {
    all: "Canchas",
    approved: "Canchas Aprobadas",
    pending: "Canchas Pendientes",
    rejected: "Canchas Rechazadas",
    disabled: "Canchas Deshabilitadas",
  };

  // Suscribirse a favoritos del usuario
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") return;

    const unsubscribe = subscribeToFavorites(currentUser.uid, (favoriteIdsList) => {
      setFavoriteIds(favoriteIdsList);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, userProfile]);

  // Manejar toggle de favoritos
  const handleToggleFavorite = async (fieldId, e) => {
    e.stopPropagation(); // Evitar que se active el click del card
    if (!currentUser || userProfile?.role !== "cliente") return;

    setTogglingFavorite(fieldId);
    try {
      const isFavorite = favoriteIds.includes(fieldId);
      if (isFavorite) {
        await removeFromFavorites(fieldId);
        setSnackbar({
          open: true,
          color: "info",
          message: "Cancha removida de favoritos",
        });
      } else {
        await addToFavorites(fieldId);
        setSnackbar({
          open: true,
          color: "success",
          message: "Cancha agregada a favoritos",
        });
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      setSnackbar({
        open: true,
        color: "error",
        message: "Error al actualizar favoritos",
      });
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleOpenReservation = (field) => {
    if (userProfile?.role === "cliente") {
      setSelectedField(field);
      setIsReservationModalOpen(true);
    }
  };

  const handleCloseReservation = () => {
    setIsReservationModalOpen(false);
    setSelectedField(null);
  };

  const handleCreateReservation = async (reservationData) => {
    setLoadingReservation(true);
    try {
      // Agregar la dirección de la cancha y el nombre del cliente a los datos de la reserva
      const reservationWithAddress = {
        ...reservationData,
        fieldAddress: selectedField?.address || "",
        clientName: userProfile?.name || "Cliente",
      };
      const reservation = await createReservation(reservationWithAddress);

      // Crear notificaciones
      try {
        // Notificación para el cliente
        await notifyReservationCreated(
          reservation.id,
          selectedField?.name || "la cancha",
          userProfile?.uid
        );

        // Notificación para el asociado (dueño de la cancha)
        if (selectedField?.ownerId) {
          await notifyReservationReceived(
            reservation.id,
            selectedField?.name || "la cancha",
            selectedField.ownerId,
            userProfile?.name || "Un cliente"
          );
        }
      } catch (notificationError) {
        console.error("Error al crear notificaciones:", notificationError);
        // No fallar la operación principal si las notificaciones fallan
      }

      handleCloseReservation();
      setSnackbar({
        open: true,
        color: "success",
        message: "Reserva creada exitosamente. El dueño de la cancha la revisará pronto.",
      });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingReservation(false);
    }
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenEdit = (field) => {
    if (userProfile?.role === "admin") {
      setFieldToEdit(field);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setFieldToEdit(null);
    // Limpiar el parámetro de la URL si existe
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("edit")) {
      navigate("/canchas", { replace: true });
    }
  };

  const handleUpdateField = async (fieldId, fieldData) => {
    setLoadingEdit(true);
    try {
      await updateFieldAsAdmin(fieldId, fieldData);
      handleCloseEdit();
      setSnackbar({
        open: true,
        color: "success",
        message: "Cancha actualizada exitosamente.",
      });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Funciones para aprobar/rechazar canchas
  const handleApprove = (field) => {
    setFieldToApprove(field);
    setConfirmAction("approve");
    setIsConfirmOpen(true);
  };

  const handleReject = (field) => {
    setFieldToApprove(field);
    setConfirmAction("reject");
    setIsConfirmOpen(true);
  };

  const confirmActionHandler = async () => {
    if (!fieldToApprove) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await callApproveFieldRequest(fieldToApprove.id, confirmAction);
      setSnackbar({ open: true, color: "success", message: result.message });
      setFieldToApprove(null);
      // La actualización en tiempo real debería eliminar la cancha automáticamente
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={3}>
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h4" fontWeight="bold">
              {userProfile?.role === "admin" ? filterTitles[statusFilter] : "Canchas Disponibles"}
            </MDTypography>
            {userProfile?.role === "admin" && (
              <MDButton variant="outlined" color="info" iconOnly onClick={openFilterMenu}>
                <Icon>filter_list</Icon>
              </MDButton>
            )}
            <Menu anchorEl={filterMenu} open={Boolean(filterMenu)} onClose={closeFilterMenu}>
              <MenuItem onClick={() => handleFilterSelect("all")}>Todas</MenuItem>
              <MenuItem onClick={() => handleFilterSelect("approved")}>Aprobadas</MenuItem>
              <MenuItem onClick={() => handleFilterSelect("pending")}>Pendientes</MenuItem>
              <MenuItem onClick={() => handleFilterSelect("rejected")}>Rechazadas</MenuItem>
              <MenuItem onClick={() => handleFilterSelect("disabled")}>Deshabilitadas</MenuItem>
            </Menu>
          </MDBox>
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <CircularProgress color="info" />
              </Grid>
            ) : fields.length > 0 ? (
              fields.map((field) => (
                <Grid item xs={12} md={6} lg={4} key={field.id}>
                  <Card>
                    <MDBox position="relative">
                      {field.imageUrl && (
                        <MDBox
                          component="img"
                          src={field.imageUrl}
                          alt={field.name}
                          borderRadius="lg"
                          shadow="md"
                          width="100%"
                          height="12rem"
                          sx={{ objectFit: "cover" }}
                        />
                      )}
                      {userProfile?.role === "admin" && (
                        <>
                          <MDBox position="absolute" top={10} right={10}>
                            <MDBadge
                              badgeContent={getStatusText(field.status)}
                              color={getStatusColor(field.status)}
                              variant="gradient"
                              size="sm"
                            />
                          </MDBox>
                          <MDBox position="absolute" top={10} left={10}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(field)}
                              sx={{
                                bgcolor: "white",
                                "&:hover": { bgcolor: "grey.100" },
                                boxShadow: 2,
                              }}
                            >
                              <Icon fontSize="small" color="info">
                                edit
                              </Icon>
                            </IconButton>
                          </MDBox>
                        </>
                      )}
                      {userProfile?.role === "cliente" && (
                        <MDBox position="absolute" top={10} right={10}>
                          <Tooltip
                            title={
                              favoriteIds.includes(field.id)
                                ? "Remover de favoritos"
                                : "Agregar a favoritos"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleToggleFavorite(field.id, e)}
                              disabled={togglingFavorite === field.id}
                              sx={{
                                bgcolor: "white",
                                "&:hover": { bgcolor: "grey.100" },
                                boxShadow: 2,
                                color: favoriteIds.includes(field.id)
                                  ? "error.main"
                                  : "text.secondary",
                              }}
                            >
                              <Icon fontSize="small">
                                {favoriteIds.includes(field.id) ? "favorite" : "favorite_border"}
                              </Icon>
                            </IconButton>
                          </Tooltip>
                        </MDBox>
                      )}
                    </MDBox>
                    <MDBox p={3}>
                      <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                        {field.name || "Nombre no disponible"}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mb={1}>
                        <Icon color="action" sx={{ mr: 1 }}>
                          location_on
                        </Icon>
                        <MDTypography variant="body2" color="text">
                          {field.address || "Dirección no disponible"}
                        </MDTypography>
                      </MDBox>
                      {field.pricePerHour && (
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <Icon color="action" sx={{ mr: 1 }}>
                            attach_money
                          </Icon>
                          <MDTypography variant="body2" color="text" fontWeight="medium">
                            ${field.pricePerHour} / hora
                          </MDTypography>
                        </MDBox>
                      )}
                      {field.openingTime && field.closingTime && (
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Icon color="action" sx={{ mr: 1 }}>
                            schedule
                          </Icon>
                          <MDTypography variant="body2" color="text">
                            {field.openingTime} - {field.closingTime}
                          </MDTypography>
                        </MDBox>
                      )}
                      {/* Botones de acción según el rol y estado */}
                      {userProfile?.role === "admin" && field.status === "pending" ? (
                        <MDBox display="flex" gap={1}>
                          <MDButton
                            variant="gradient"
                            color="success"
                            fullWidth
                            onClick={() => handleApprove(field)}
                            disabled={loadingAction}
                            sx={{ flex: 1 }}
                          >
                            <Icon sx={{ mr: 0.5, fontSize: "1rem" }}>check_circle</Icon>
                            Aprobar
                          </MDButton>
                          <MDButton
                            variant="gradient"
                            color="error"
                            fullWidth
                            onClick={() => handleReject(field)}
                            disabled={loadingAction}
                            sx={{ flex: 1 }}
                          >
                            <Icon sx={{ mr: 0.5, fontSize: "1rem" }}>cancel</Icon>
                            Rechazar
                          </MDButton>
                        </MDBox>
                      ) : (
                        <MDButton
                          variant="gradient"
                          color="info"
                          fullWidth
                          onClick={() => handleOpenReservation(field)}
                          disabled={userProfile?.role !== "cliente"}
                        >
                          {userProfile?.role === "cliente"
                            ? "Reservar Ahora"
                            : userProfile?.role === "admin"
                            ? "Ver Detalles"
                            : "Ver Disponibilidad"}
                        </MDButton>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <MDTypography>
                  No hay canchas que coincidan con el filtro seleccionado.
                </MDTypography>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />

      {/* Modal de Reserva */}
      {userProfile?.role === "cliente" && (
        <ReservationModal
          open={isReservationModalOpen}
          onClose={handleCloseReservation}
          onSubmit={handleCreateReservation}
          loading={loadingReservation}
          field={selectedField}
        />
      )}

      {/* Modal de Edición para Admin */}
      {userProfile?.role === "admin" && (
        <AdminEditFieldModal
          open={isEditModalOpen}
          onClose={handleCloseEdit}
          onSubmit={handleUpdateField}
          loading={loadingEdit}
          field={fieldToEdit}
        />
      )}

      {/* Diálogo de Confirmación para Aprobar/Rechazar */}
      {userProfile?.role === "admin" && (
        <ConfirmationDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setFieldToApprove(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirmar ${confirmAction === "approve" ? "Aprobación" : "Rechazo"}`}
          message={`¿Estás seguro de que quieres ${
            confirmAction === "approve" ? "aprobar" : "rechazar"
          } la cancha "${fieldToApprove?.name || ""}"?`}
          confirmColor={confirmAction === "approve" ? "success" : "error"}
        />
      )}

      {/* Snackbar */}
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={userProfile?.role === "admin" ? "Gestión de Canchas" : "Reservas"}
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </DashboardLayout>
  );
}

export default Canchas;
