// src/layouts/dashboard/index.js

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import FieldDetailsModal from "layouts/dashboard/components/FieldDetailsModal";

function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Estados para estadísticas de Admin
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [totalFieldsCount, setTotalFieldsCount] = useState(0);
  const [approvedFieldsCount, setApprovedFieldsCount] = useState(0);
  const [disabledFieldsCount, setDisabledFieldsCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentFields, setRecentFields] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [associateCount, setAssociateCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [selectedField, setSelectedField] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para estadísticas de Asociado
  const [myFieldsCount, setMyFieldsCount] = useState(0);
  const [myPendingCount, setMyPendingCount] = useState(0);
  const [myApprovedCount, setMyApprovedCount] = useState(0);
  const [myReservationsCount, setMyReservationsCount] = useState(0);
  const [myPendingReservationsCount, setMyPendingReservationsCount] = useState(0);
  const [myTotalRevenue, setMyTotalRevenue] = useState(0);
  const [recentReservations, setRecentReservations] = useState([]);
  const [myRecentFields, setMyRecentFields] = useState([]);

  // Obtener estadísticas para Admin
  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") return;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      setUserCount(snap.size);
      // Contar usuarios por rol
      let admins = 0;
      let asociados = 0;
      let clientes = 0;
      snap.docs.forEach((doc) => {
        const role = doc.data().role;
        if (role === "admin") admins++;
        else if (role === "asociado") asociados++;
        else if (role === "cliente") clientes++;
      });
      setAdminCount(admins);
      setAssociateCount(asociados);
      setClientCount(clientes);
      // Obtener usuarios recientes (últimos 5)
      const usersData = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, 5);
      setRecentUsers(usersData);
    });

    const unsubBookings = onSnapshot(query(collection(db, "reservations")), (snap) =>
      setBookingCount(snap.size)
    );

    const unsubPending = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "pending")),
      (snap) => setTotalPendingCount(snap.size)
    );

    const unsubAllFields = onSnapshot(query(collection(db, "canchas")), (snap) => {
      setTotalFieldsCount(snap.size);
      // Obtener canchas recientes (últimas 4)
      const fieldsData = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, 4);
      setRecentFields(fieldsData);
    });

    const unsubApproved = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "approved")),
      (snap) => setApprovedFieldsCount(snap.size)
    );

    const unsubDisabled = onSnapshot(
      query(collection(db, "canchas"), where("status", "==", "disabled")),
      (snap) => setDisabledFieldsCount(snap.size)
    );

    return () => {
      unsubUsers();
      unsubBookings();
      unsubPending();
      unsubAllFields();
      unsubApproved();
      unsubDisabled();
    };
  }, [userProfile]);

  // Obtener estadísticas para Asociado
  useEffect(() => {
    if (!userProfile || userProfile.role !== "asociado") return;

    let unsubAllReservations = null;

    // Contar canchas del asociado
    const myFieldsQuery = query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid));
    const unsubMyFields = onSnapshot(myFieldsQuery, (snap) => {
      setMyFieldsCount(snap.size);
      // Obtener canchas recientes del asociado
      const fieldsData = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, 4);
      setMyRecentFields(fieldsData);
    });

    // Contar canchas pendientes
    const myPendingQuery = query(
      collection(db, "canchas"),
      where("ownerId", "==", userProfile.uid),
      where("status", "==", "pending")
    );
    const unsubMyPending = onSnapshot(myPendingQuery, (snap) => setMyPendingCount(snap.size));

    // Contar canchas aprobadas
    const myApprovedQuery = query(
      collection(db, "canchas"),
      where("ownerId", "==", userProfile.uid),
      where("status", "==", "approved")
    );
    const unsubMyApproved = onSnapshot(myApprovedQuery, (snap) => setMyApprovedCount(snap.size));

    // Obtener reservas de las canchas del asociado
    const unsubFieldsForReservations = onSnapshot(myFieldsQuery, (fieldsSnap) => {
      const fieldIds = fieldsSnap.docs.map((doc) => doc.id);

      // Limpiar suscripción anterior si existe
      if (unsubAllReservations) {
        unsubAllReservations();
      }

      if (fieldIds.length === 0) {
        setMyReservationsCount(0);
        setMyPendingReservationsCount(0);
        setMyTotalRevenue(0);
        setRecentReservations([]);
        return;
      }

      // Obtener todas las reservas y filtrar en memoria
      unsubAllReservations = onSnapshot(
        query(collection(db, "reservations")),
        (reservationsSnap) => {
          const allReservations = reservationsSnap.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((res) => fieldIds.includes(res.fieldId))
            .sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0;
              const bTime = b.createdAt?.seconds || 0;
              return bTime - aTime;
            });

          setMyReservationsCount(allReservations.length);
          setMyPendingReservationsCount(
            allReservations.filter((r) => r.status === "pending").length
          );

          // Calcular ingresos totales (solo reservas confirmadas)
          const confirmedReservations = allReservations.filter(
            (r) => r.status === "confirmed" || r.status === "completed"
          );
          const totalRevenue = confirmedReservations.reduce(
            (sum, r) => sum + (r.totalPrice || 0),
            0
          );
          setMyTotalRevenue(totalRevenue);

          // Reservas recientes (últimas 5)
          setRecentReservations(allReservations.slice(0, 5));
        }
      );
    });

    return () => {
      unsubMyFields();
      unsubMyPending();
      unsubMyApproved();
      unsubFieldsForReservations();
      if (unsubAllReservations) {
        unsubAllReservations();
      }
    };
  }, [userProfile]);

  if (!userProfile || userProfile.role === "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
          >
            <Icon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}>dashboard</Icon>
            <MDTypography variant="h4" color="text" fontWeight="medium" mb={1}>
              Bienvenido a GoalTime
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3} textAlign="center">
              Explora nuestras canchas disponibles y haz tu reserva
            </MDTypography>
            <MDButton variant="gradient" color="info" href="/canchas">
              <Icon sx={{ mr: 1 }}>sports_soccer</Icon>
              Ver Canchas Disponibles
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Tarjetas de Estadísticas */}
        <Grid container spacing={3} mb={3}>
          {userProfile.role === "admin" && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="info"
                  icon="people"
                  title="Usuarios Registrados"
                  count={userCount}
                  percentage={{ color: "success", amount: "+", label: "Total en el sistema" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="pending_actions"
                  title="Canchas Pendientes"
                  count={totalPendingCount}
                  percentage={{ color: "warning", amount: "", label: "Pendientes de revisión" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="success"
                  icon="sports_soccer"
                  title="Canchas Aprobadas"
                  count={approvedFieldsCount}
                  percentage={{ color: "success", amount: "", label: "Activas y disponibles" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="event_available"
                  title="Reservas Totales"
                  count={bookingCount}
                  percentage={{ color: "success", amount: "+", label: "Todas las reservas" }}
                />
              </Grid>
            </>
          )}

          {userProfile.role === "asociado" && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="info"
                  icon="sports_soccer"
                  title="Mis Canchas"
                  count={myFieldsCount}
                  percentage={{ color: "success", amount: "", label: "Total registradas" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="success"
                  icon="check_circle"
                  title="Canchas Aprobadas"
                  count={myApprovedCount}
                  percentage={{ color: "success", amount: "", label: "Activas y disponibles" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="pending_actions"
                  title="Reservas Pendientes"
                  count={myPendingReservationsCount}
                  percentage={{ color: "warning", amount: "", label: "Pendientes de revisión" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="attach_money"
                  title="Ingresos Totales"
                  count={`$${myTotalRevenue.toLocaleString()}`}
                  percentage={{ color: "success", amount: "", label: "Reservas confirmadas" }}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Contenido Adicional según el Rol */}
        <Grid container spacing={3}>
          {/* Panel de Admin */}
          {userProfile.role === "admin" && (
            <>
              {/* Gráficas de Estadísticas */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ height: "100%" }}>
                  <MDBox p={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>bar_chart</Icon>
                      Estado de Canchas
                    </MDTypography>
                    <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <ReportsBarChart
                        color="info"
                        title="Distribución de Canchas"
                        description="Estados de las canchas registradas"
                        date="Actualizado ahora"
                        chart={{
                          labels: ["Aprobadas", "Pendientes", "Deshabilitadas"],
                          datasets: {
                            label: "Canchas",
                            data: [approvedFieldsCount, totalPendingCount, disabledFieldsCount],
                          },
                        }}
                      />
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ height: "100%" }}>
                  <MDBox p={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>people</Icon>
                      Distribución de Usuarios
                    </MDTypography>
                    <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <ReportsLineChart
                        color="success"
                        title="Usuarios por Rol"
                        description="Cantidad de usuarios según su rol en el sistema"
                        date="Actualizado ahora"
                        chart={{
                          labels: ["Administradores", "Asociados", "Clientes"],
                          datasets: {
                            label: "Usuarios",
                            data: [adminCount, associateCount, clientCount],
                          },
                        }}
                      />
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Canchas Recientes */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6" fontWeight="bold">
                        <Icon sx={{ verticalAlign: "middle", mr: 1 }}>sports_soccer</Icon>
                        Canchas Recientes
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => navigate("/canchas")}
                      >
                        Ver Todas
                      </MDButton>
                    </MDBox>
                    {recentFields.length > 0 ? (
                      <Grid container spacing={2}>
                        {recentFields.map((field) => (
                          <Grid item xs={12} sm={6} key={field.id} sx={{ display: "flex" }}>
                            <DefaultProjectCard
                              image={field.imageUrl || ""}
                              label={field.status}
                              title={field.name}
                              description={field.address}
                              action={{
                                type: "button",
                                onClick: () => {
                                  setSelectedField(field);
                                  setIsDetailsModalOpen(true);
                                },
                                color: "info",
                                label: "Ver Detalles",
                              }}
                              authors={[]}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text">
                          No hay canchas registradas aún
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>

              {/* Usuarios Recientes y Acciones Rápidas */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>people</Icon>
                      Usuarios Recientes
                    </MDTypography>
                    {recentUsers.length > 0 ? (
                      <MDBox>
                        {recentUsers.map((user, index) => (
                          <MDBox
                            key={user.id}
                            display="flex"
                            alignItems="center"
                            py={1.5}
                            borderBottom={index < recentUsers.length - 1 ? "1px solid" : "none"}
                            borderColor="divider"
                          >
                            <MDBox
                              width="40px"
                              height="40px"
                              borderRadius="50%"
                              bgColor="info"
                              variant="gradient"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mr={2}
                            >
                              <MDTypography variant="h6" color="white" fontWeight="bold">
                                {user.name ? user.name[0].toUpperCase() : "U"}
                              </MDTypography>
                            </MDBox>
                            <MDBox flex={1}>
                              <MDTypography variant="body2" fontWeight="medium">
                                {user.name || "Usuario"}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                {user.email || "Sin email"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        ))}
                      </MDBox>
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No hay usuarios registrados
                      </MDTypography>
                    )}
                  </MDBox>
                </Card>

                {/* Acciones Rápidas */}
                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>flash_on</Icon>
                      Acciones Rápidas
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1.5}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        size="small"
                        href="/admin/users"
                      >
                        <Icon sx={{ mr: 1 }}>people</Icon>
                        Gestionar Usuarios
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="warning"
                        fullWidth
                        size="small"
                        href="/admin/fields"
                      >
                        <Icon sx={{ mr: 1 }}>check_circle</Icon>
                        Aprobar Canchas
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="dark"
                        fullWidth
                        size="small"
                        href="/canchas"
                      >
                        <Icon sx={{ mr: 1 }}>sports_soccer</Icon>
                        Ver Todas las Canchas
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </>
          )}

          {/* Panel de Asociado */}
          {userProfile.role === "asociado" && (
            <>
              {/* Mis Canchas Recientes */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6" fontWeight="bold">
                        <Icon sx={{ verticalAlign: "middle", mr: 1 }}>sports_soccer</Icon>
                        Mis Canchas
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => navigate("/associate/fields")}
                      >
                        Ver Todas
                      </MDButton>
                    </MDBox>
                    {myRecentFields.length > 0 ? (
                      <Grid container spacing={2}>
                        {myRecentFields.map((field) => (
                          <Grid item xs={12} sm={6} key={field.id}>
                            <DefaultProjectCard
                              image={field.imageUrl || ""}
                              label={field.status}
                              title={field.name}
                              description={field.address}
                              action={{
                                type: "internal",
                                route: "/associate/fields",
                                color: "info",
                                label: "Ver Detalles",
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text" mb={2}>
                          Aún no has registrado canchas
                        </MDTypography>
                        <MDButton variant="gradient" color="info" href="/associate/fields">
                          <Icon sx={{ mr: 1 }}>add</Icon>
                          Registrar Mi Primera Cancha
                        </MDButton>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>

              {/* Reservas Recientes y Estadísticas */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6" fontWeight="bold">
                        <Icon sx={{ verticalAlign: "middle", mr: 1 }}>event</Icon>
                        Reservas Recientes
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => navigate("/associate/reservations")}
                      >
                        Ver Todas
                      </MDButton>
                    </MDBox>
                    {recentReservations.length > 0 ? (
                      <MDBox>
                        {recentReservations.map((reservation, index) => (
                          <MDBox
                            key={reservation.id}
                            py={1.5}
                            borderBottom={
                              index < recentReservations.length - 1 ? "1px solid" : "none"
                            }
                            borderColor="divider"
                          >
                            <MDTypography variant="body2" fontWeight="medium" mb={0.5}>
                              {reservation.fieldName || "Cancha"}
                            </MDTypography>
                            <MDBox
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <MDTypography variant="caption" color="text">
                                {reservation.date || "N/A"}
                              </MDTypography>
                              <MDTypography
                                variant="caption"
                                color={
                                  reservation.status === "confirmed"
                                    ? "success"
                                    : reservation.status === "pending"
                                    ? "warning"
                                    : "text"
                                }
                                fontWeight="medium"
                              >
                                {reservation.status === "confirmed"
                                  ? "Confirmada"
                                  : reservation.status === "pending"
                                  ? "Pendiente"
                                  : reservation.status}
                              </MDTypography>
                            </MDBox>
                            {reservation.totalPrice && (
                              <MDTypography variant="caption" color="success" fontWeight="bold">
                                ${reservation.totalPrice}
                              </MDTypography>
                            )}
                          </MDBox>
                        ))}
                      </MDBox>
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No hay reservas aún
                      </MDTypography>
                    )}
                  </MDBox>
                </Card>

                {/* Estadísticas Adicionales */}
                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>analytics</Icon>
                      Resumen
                    </MDTypography>
                    <MDBox>
                      <MDBox display="flex" justifyContent="space-between" mb={2}>
                        <MDTypography variant="body2" color="text">
                          Total Reservas
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="info">
                          {myReservationsCount}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" mb={2}>
                        <MDTypography variant="body2" color="text">
                          Canchas Pendientes
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="warning">
                          {myPendingCount}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          Ingresos Totales
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" color="success">
                          ${myTotalRevenue.toLocaleString()}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>

                {/* Acciones Rápidas */}
                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="bold" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>flash_on</Icon>
                      Acciones Rápidas
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1.5}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        size="small"
                        href="/associate/fields"
                      >
                        <Icon sx={{ mr: 1 }}>stadium</Icon>
                        Mis Canchas
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="small"
                        href="/associate/fields"
                      >
                        <Icon sx={{ mr: 1 }}>add</Icon>
                        Agregar Cancha
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </MDBox>
      <Footer />

      {/* Modal de Detalles de Cancha */}
      {userProfile?.role === "admin" && (
        <FieldDetailsModal
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedField(null);
          }}
          field={selectedField}
        />
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
