// src/layouts/dashboard/index.js

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Se importa useNavigate
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate(); // 👈 Se inicializa useNavigate

  // Solo el admin necesita estos estados
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingFieldsCount, setPendingFieldsCount] = useState(0);

  // 👇 ESTE ES EL NUEVO EFECTO DE REDIRECCIÓN
  useEffect(() => {
    // Si el perfil del usuario ya cargó y el rol es "cliente", lo redirigimos
    if (userProfile && userProfile.role === "cliente") {
      navigate("/canchas");
    }
  }, [userProfile, navigate]);

  // Este efecto ahora solo se preocupa por las estadísticas del admin
  useEffect(() => {
    if (userProfile?.role === "admin") {
      const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) =>
        setUserCount(snap.size)
      );
      const unsubBookings = onSnapshot(query(collection(db, "reservas")), (snap) =>
        setBookingCount(snap.size)
      );
      const unsubPending = onSnapshot(
        query(collection(db, "canchas"), where("status", "==", "pending")),
        (snap) => setPendingFieldsCount(snap.size)
      );

      return () => {
        unsubUsers();
        unsubBookings();
        unsubPending();
      };
    }
  }, [userProfile]);

  // Si aún no carga el perfil o si es un cliente (antes de redirigir), no mostramos nada para evitar un parpadeo
  if (!userProfile || userProfile.role === "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        {/* Puedes poner un spinner de carga aquí si lo deseas */}
      </DashboardLayout>
    );
  }

  // El dashboard ahora solo renderiza esto para el admin y asociado
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="pending_actions"
                title="Canchas Pendientes"
                count={pendingFieldsCount}
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
        </Grid>
        {/* Aquí en el futuro irá el contenido específico para el admin/asociado */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
