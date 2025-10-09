// src/layouts/dashboard/index.js

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore"; // 'where' ya está importado
import { db } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Estados para estadísticas de Admin
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);

  // 👇 1. Se añaden estados para las estadísticas del Asociado
  const [myFieldsCount, setMyFieldsCount] = useState(0);
  const [myPendingCount, setMyPendingCount] = useState(0);

  // 👇 2. El useEffect ahora se adapta al rol de 'asociado' también
  useEffect(() => {
    if (!userProfile) return; // Si no hay perfil, no hagas nada

    // Lógica para el ADMIN
    if (userProfile.role === "admin") {
      const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) =>
        setUserCount(snap.size)
      );
      const unsubBookings = onSnapshot(query(collection(db, "reservas")), (snap) =>
        setBookingCount(snap.size)
      );
      const unsubPending = onSnapshot(
        query(collection(db, "canchas"), where("status", "==", "pending")),
        (snap) => setTotalPendingCount(snap.size)
      );
      return () => {
        unsubUsers();
        unsubBookings();
        unsubPending();
      };
    }

    // Lógica para el ASOCIADO
    if (userProfile.role === "asociado") {
      // Contar el total de canchas del asociado
      const myFieldsQuery = query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid)
      );
      const unsubMyFields = onSnapshot(myFieldsQuery, (snap) => setMyFieldsCount(snap.size));

      // Contar las canchas pendientes del asociado
      const myPendingQuery = query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid),
        where("status", "==", "pending")
      );
      const unsubMyPending = onSnapshot(myPendingQuery, (snap) => setMyPendingCount(snap.size));

      return () => {
        unsubMyFields();
        unsubMyPending();
      };
    }
  }, [userProfile]);

  if (!userProfile || userProfile.role === "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 👇 3. Se renderizan las tarjetas según el rol del usuario */}
        <Grid container spacing={3} mb={3}>
          {userProfile.role === "admin" && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="warning"
                    icon="pending_actions"
                    title="Canchas Pendientes"
                    count={totalPendingCount}
                    sx={{ textAlign: "right" }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    icon="people"
                    title="Usuarios Registrados"
                    count={userCount}
                    sx={{ textAlign: "right" }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="event_available"
                    title="Reservas Totales"
                    count={bookingCount}
                    sx={{ textAlign: "right" }}
                  />
                </MDBox>
              </Grid>
            </>
          )}

          {userProfile.role === "asociado" && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="info"
                    icon="sports_soccer"
                    title="Mis Canchas Registradas"
                    count={myFieldsCount}
                    sx={{ textAlign: "right" }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="warning"
                    icon="pending_actions"
                    title="Mis Canchas Pendientes"
                    count={myPendingCount}
                    sx={{ textAlign: "right" }}
                  />
                </MDBox>
              </Grid>
              {/* Aquí podríamos añadir "Reservas en mis canchas" en el futuro */}
            </>
          )}
        </Grid>
        {/* Aquí en el futuro irá el contenido específico para el rol */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
