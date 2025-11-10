// src/layouts/profile/index.js

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Card, Divider, Chip, CircularProgress, Tooltip } from "@mui/material";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import {
  subscribeToFavorites,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "services/firebaseService";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import MDAvatar from "components/MDAvatar";

// GoalTime App example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Context
import { useAuth } from "context/AuthContext";
import { db } from "services/firebaseService";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";

function Profile() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  // Estados para estadísticas
  const [totalReservations, setTotalReservations] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [favoriteFieldsCount, setFavoriteFieldsCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingFields, setPendingFields] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [myFieldsCount, setMyFieldsCount] = useState(0);
  const [myApprovedFields, setMyApprovedFields] = useState(0);
  const [receivedReservations, setReceivedReservations] = useState(0);

  const getRoleText = (role) => {
    const roleMap = {
      admin: "Administrador",
      asociado: "Asociado",
      cliente: "Cliente",
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      admin: "info",
      asociado: "dark",
      cliente: "success",
    };
    return colorMap[role] || "dark";
  };

  // Funciones para manejar la foto de perfil
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setPhotoError(null);
    setUploadingPhoto(true);

    try {
      await uploadProfilePhoto(file, currentUser.uid);
      // El perfil se actualizará automáticamente gracias al listener en AuthContext
    } catch (error) {
      console.error("Error al subir foto:", error);
      setPhotoError(error.message || "Error al subir la foto.");
    } finally {
      setUploadingPhoto(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePhotoDelete = async () => {
    if (!currentUser) return;

    if (!window.confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) {
      return;
    }

    setPhotoError(null);
    setUploadingPhoto(true);

    try {
      await deleteProfilePhoto(currentUser.uid);
      // El perfil se actualizará automáticamente gracias al listener en AuthContext
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      setPhotoError(error.message || "Error al eliminar la foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Obtener reservaciones del usuario (para clientes)
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") {
      setLoadingReservations(false);
      return;
    }

    setLoadingReservations(true);
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

        // Calcular estadísticas
        setTotalReservations(reservationsData.length);
        const active = reservationsData.filter(
          (r) => r.status === "confirmed" || r.status === "pending"
        ).length;
        setActiveReservations(active);

        setLoadingReservations(false);
      },
      (error) => {
        console.error("Error al obtener reservaciones:", error);
        setLoadingReservations(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  // Obtener favoritos del usuario (para clientes)
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") return;

    const unsubscribe = subscribeToFavorites(currentUser.uid, (favoriteIds) => {
      setFavoriteFieldsCount(favoriteIds.length);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, userProfile]);

  // Obtener estadísticas para Admin
  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") return;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      setTotalUsers(snap.size);
    });

    const unsubPending = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "pending")),
      (snap) => setPendingFields(snap.size)
    );

    const unsubBookings = onSnapshot(query(collection(db, "reservations")), (snap) =>
      setTotalBookings(snap.size)
    );

    return () => {
      unsubUsers();
      unsubPending();
      unsubBookings();
    };
  }, [userProfile]);

  // Obtener estadísticas para Asociado
  useEffect(() => {
    if (!userProfile || userProfile.role !== "asociado" || !currentUser) return;

    let unsubAllReservations = null;

    // Contar canchas del asociado
    const myFieldsQuery = query(collection(db, "canchas"), where("ownerId", "==", currentUser.uid));
    const unsubMyFields = onSnapshot(myFieldsQuery, (snap) => {
      setMyFieldsCount(snap.size);
    });

    // Contar canchas aprobadas
    const myApprovedQuery = query(
      collection(db, "canchas"),
      where("ownerId", "==", currentUser.uid),
      where("status", "==", "approved")
    );
    const unsubMyApproved = onSnapshot(myApprovedQuery, (snap) => setMyApprovedFields(snap.size));

    // Obtener reservas de las canchas del asociado
    const unsubFieldsForReservations = onSnapshot(myFieldsQuery, (fieldsSnap) => {
      const fieldIds = fieldsSnap.docs.map((doc) => doc.id);

      // Limpiar suscripción anterior si existe
      if (unsubAllReservations) {
        unsubAllReservations();
      }

      if (fieldIds.length === 0) {
        setReceivedReservations(0);
        return;
      }

      // Obtener todas las reservas y filtrar en memoria
      unsubAllReservations = onSnapshot(
        query(collection(db, "reservations")),
        (reservationsSnap) => {
          const count = reservationsSnap.docs.filter((doc) => {
            const reservation = doc.data();
            return fieldIds.includes(reservation.fieldId);
          }).length;
          setReceivedReservations(count);
        }
      );
    });

    return () => {
      unsubMyFields();
      unsubMyApproved();
      if (unsubFieldsForReservations) unsubFieldsForReservations();
      if (unsubAllReservations) unsubAllReservations();
    };
  }, [userProfile, currentUser]);

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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} px={3} pt={3}>
        <MDTypography variant="h4" fontWeight="bold" mb={3}>
          Perfil
        </MDTypography>

        {/* Header con Avatar */}
        <MDBox position="relative" mb={5}>
          <MDBox
            display="flex"
            alignItems="center"
            position="relative"
            minHeight="18.75rem"
            borderRadius="xl"
            sx={{
              backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
                `${linearGradient(
                  rgba(gradients.info.main, 0.6),
                  rgba(gradients.info.state, 0.6)
                )}, url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "50%",
              overflow: "hidden",
            }}
          />
          <Card
            sx={{
              position: "relative",
              mt: -8,
              mx: 3,
              py: 2,
              px: 2,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <MDBox position="relative" display="inline-block">
                  <MDAvatar
                    src={userProfile?.photoURL || ""}
                    alt={userProfile?.name || "Usuario"}
                    size="xl"
                    shadow="sm"
                  >
                    {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                  </MDAvatar>
                  {/* Botón para cambiar foto */}
                  <MDBox
                    position="absolute"
                    bottom={-4}
                    right={-4}
                    sx={{
                      zIndex: 10,
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                      id="photo-upload-input"
                      disabled={uploadingPhoto}
                    />
                    <Tooltip title={uploadingPhoto ? "Subiendo..." : "Cambiar foto de perfil"}>
                      <span>
                        <IconButton
                          size="medium"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          sx={{
                            bgcolor: "info.main",
                            color: "white",
                            width: 40,
                            height: 40,
                            boxShadow: 3,
                            "&:hover": {
                              bgcolor: "info.dark",
                              transform: "scale(1.1)",
                            },
                            "&:disabled": { bgcolor: "grey.400" },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          {uploadingPhoto ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Icon>camera_alt</Icon>
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </MDBox>
                  {/* Botón para eliminar foto (solo si hay foto) */}
                  {userProfile?.photoURL && (
                    <MDBox
                      position="absolute"
                      top={-4}
                      right={-4}
                      sx={{
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title="Eliminar foto de perfil">
                        <span>
                          <IconButton
                            size="small"
                            onClick={handlePhotoDelete}
                            disabled={uploadingPhoto}
                            sx={{
                              bgcolor: "error.main",
                              color: "white",
                              width: 32,
                              height: 32,
                              boxShadow: 3,
                              "&:hover": {
                                bgcolor: "error.dark",
                                transform: "scale(1.1)",
                              },
                              "&:disabled": { bgcolor: "grey.400" },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </span>
                      </Tooltip>
                    </MDBox>
                  )}
                </MDBox>
                {photoError && (
                  <MDBox mt={1}>
                    <MDTypography variant="caption" color="error">
                      {photoError}
                    </MDTypography>
                  </MDBox>
                )}
              </Grid>
              <Grid item>
                <MDBox height="100%" mt={0.5} lineHeight={1}>
                  <MDTypography variant="h5" fontWeight="medium">
                    {userProfile?.name || "Usuario"}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={1} mt={1}>
                    <MDTypography variant="button" color="text" fontWeight="regular">
                      {getRoleText(userProfile?.role)}
                    </MDTypography>
                    {userProfile?.role && (
                      <MDBadge
                        badgeContent={userProfile.role}
                        color={getRoleColor(userProfile.role)}
                        variant="gradient"
                        size="sm"
                      />
                    )}
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
                <MDBox display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="gradient"
                    color="info"
                    size="small"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("openSettingsModal"));
                    }}
                  >
                    <Icon sx={{ mr: 1 }}>edit</Icon>
                    Editar Perfil
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
          </Card>
        </MDBox>

        {/* Contenido Principal */}
        <MDBox py={3}>
          <Grid container spacing={3}>
            {/* Información del Perfil */}
            <Grid item xs={12} md={6} lg={4}>
              <ProfileInfoCard
                title="Información del Perfil"
                description={
                  userProfile?.role === "admin"
                    ? "Administrador del sistema GoalTime. Tienes acceso completo a todas las funcionalidades."
                    : userProfile?.role === "asociado"
                    ? "Asociado de GoalTime. Gestiona tus canchas y recibe reservas de clientes."
                    : "Cliente de GoalTime. Reserva canchas y disfruta del mejor servicio deportivo."
                }
                info={{
                  nombre: userProfile?.name || "No disponible",
                  correo: userProfile?.email || currentUser?.email || "No disponible",
                  // No mostrar el rol para clientes
                  ...(userProfile?.role !== "cliente" && {
                    rol: getRoleText(userProfile?.role) || "No disponible",
                  }),
                }}
                social={[]}
                action={{
                  tooltip: "Configuración",
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent("openSettingsModal"));
                  },
                }}
                shadow={true}
              />
            </Grid>

            {/* Estadísticas según el Rol */}
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    <Icon sx={{ verticalAlign: "middle", mr: 1 }}>analytics</Icon>
                    Estadísticas
                  </MDTypography>
                  <Divider sx={{ my: 2 }} />
                  {userProfile?.role === "admin" && (
                    <MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Total Usuarios
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="info">
                          {totalUsers}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Canchas Pendientes
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="warning">
                          {pendingFields}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="body2" color="text">
                          Total Reservas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="success">
                          {totalBookings}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}
                  {userProfile?.role === "asociado" && (
                    <MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Mis Canchas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="info">
                          {myFieldsCount}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Canchas Aprobadas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="success">
                          {myApprovedFields}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="body2" color="text">
                          Reservas Recibidas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="dark">
                          {receivedReservations}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}
                  {userProfile?.role === "cliente" && (
                    <MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Mis Reservas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="info">
                          {totalReservations}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDTypography variant="body2" color="text">
                          Reservas Activas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="success">
                          {activeReservations}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="body2" color="text">
                          Canchas Favoritas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="warning">
                          {favoriteFieldsCount}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Acciones Rápidas */}
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    <Icon sx={{ verticalAlign: "middle", mr: 1 }}>flash_on</Icon>
                    Acciones Rápidas
                  </MDTypography>
                  <Divider sx={{ my: 2 }} />
                  <MDBox display="flex" flexDirection="column" gap={1.5}>
                    {userProfile?.role === "admin" && (
                      <>
                        <MDButton
                          variant="gradient"
                          color="info"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/admin/users")}
                        >
                          <Icon sx={{ mr: 1 }}>people</Icon>
                          Gestionar Usuarios
                        </MDButton>
                        <MDButton
                          variant="gradient"
                          color="warning"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/canchas?status=pending")}
                        >
                          <Icon sx={{ mr: 1 }}>check_circle</Icon>
                          Aprobar Canchas
                        </MDButton>
                      </>
                    )}
                    {userProfile?.role === "asociado" && (
                      <>
                        <MDButton
                          variant="gradient"
                          color="info"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/associate/fields")}
                        >
                          <Icon sx={{ mr: 1 }}>stadium</Icon>
                          Mis Canchas
                        </MDButton>
                        <MDButton
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/associate/fields?add=true")}
                        >
                          <Icon sx={{ mr: 1 }}>add</Icon>
                          Agregar Nueva Cancha
                        </MDButton>
                      </>
                    )}
                    {userProfile?.role === "cliente" && (
                      <>
                        <MDButton
                          variant="gradient"
                          color="info"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/canchas")}
                        >
                          <Icon sx={{ mr: 1 }}>sports_soccer</Icon>
                          Ver Canchas Disponibles
                        </MDButton>
                        <MDButton
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="small"
                          onClick={() => navigate("/canchas")}
                        >
                          <Icon sx={{ mr: 1 }}>event</Icon>
                          Hacer una Reserva
                        </MDButton>
                      </>
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>

          {/* Sección de Reservaciones (Solo para Clientes) */}
          {userProfile?.role === "cliente" && (
            <Grid container spacing={3} mt={2}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <MDTypography variant="h6" fontWeight="bold">
                        <Icon sx={{ verticalAlign: "middle", mr: 1 }}>event</Icon>
                        Mis Reservaciones
                      </MDTypography>
                      <MDBadge
                        badgeContent={reservations.length}
                        color="info"
                        variant="gradient"
                        size="sm"
                      />
                    </MDBox>
                    <Divider sx={{ my: 2 }} />

                    {loadingReservations ? (
                      <MDBox display="flex" justifyContent="center" p={4}>
                        <CircularProgress color="info" />
                      </MDBox>
                    ) : reservations.length === 0 ? (
                      <MDBox
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p={4}
                      >
                        <Icon sx={{ fontSize: 64, color: "text", mb: 2 }}>event_busy</Icon>
                        <MDTypography variant="h6" color="text" fontWeight="medium" mb={1}>
                          No tienes reservaciones aún
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mb={3}>
                          ¡Comienza a reservar canchas y aparecerán aquí!
                        </MDTypography>
                        <MDButton
                          variant="gradient"
                          color="info"
                          onClick={() => navigate("/canchas")}
                        >
                          <Icon sx={{ mr: 1 }}>sports_soccer</Icon>
                          Ver Canchas Disponibles
                        </MDButton>
                      </MDBox>
                    ) : (
                      <MDBox>
                        {reservations.map((reservation) => (
                          <Card
                            key={reservation.id}
                            sx={{
                              mb: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": {
                                boxShadow: 4,
                              },
                            }}
                          >
                            <MDBox p={2.5}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                  <MDBox>
                                    <MDTypography variant="h6" fontWeight="bold" mb={1}>
                                      {reservation.fieldName || "Cancha"}
                                    </MDTypography>
                                    <MDBox display="flex" alignItems="center" mb={0.5}>
                                      <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                        location_on
                                      </Icon>
                                      <MDTypography variant="body2" color="text">
                                        {reservation.fieldAddress || "Dirección no disponible"}
                                      </MDTypography>
                                    </MDBox>
                                    <MDBox display="flex" alignItems="center" mb={0.5}>
                                      <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                        calendar_today
                                      </Icon>
                                      <MDTypography variant="body2" color="text">
                                        {formatDate(reservation.date)}
                                      </MDTypography>
                                    </MDBox>
                                    <MDBox display="flex" alignItems="center">
                                      <Icon color="action" sx={{ mr: 1, fontSize: 18 }}>
                                        schedule
                                      </Icon>
                                      <MDTypography variant="body2" color="text">
                                        {reservation.startTime} - {reservation.endTime}
                                      </MDTypography>
                                    </MDBox>
                                  </MDBox>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <MDBox>
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
                                      size="small"
                                      variant="gradient"
                                      sx={{ mb: 2 }}
                                    />
                                    {reservation.totalPrice && (
                                      <MDBox>
                                        <MDTypography
                                          variant="caption"
                                          color="text"
                                          fontWeight="medium"
                                          display="block"
                                          mb={0.5}
                                        >
                                          Total
                                        </MDTypography>
                                        <MDTypography
                                          variant="h6"
                                          color="success"
                                          fontWeight="bold"
                                        >
                                          ${reservation.totalPrice}
                                        </MDTypography>
                                      </MDBox>
                                    )}
                                  </MDBox>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <MDBox display="flex" flexDirection="column" gap={1}>
                                    <MDTypography
                                      variant="caption"
                                      color="text"
                                      fontWeight="medium"
                                    >
                                      Fecha de Reserva
                                    </MDTypography>
                                    <MDTypography variant="body2" color="text">
                                      {reservation.createdAt
                                        ? formatDate(reservation.createdAt)
                                        : "N/A"}
                                    </MDTypography>
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
              </Grid>
            </Grid>
          )}
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Profile;
