// src/layouts/canchas/index.js

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "services/firebaseService";
import { useAuth } from "context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBadge from "components/MDBadge";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// GoalTime App example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Canchas() {
  const { userProfile } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMenu, setFilterMenu] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const openFilterMenu = (event) => setFilterMenu(event.currentTarget);
  const closeFilterMenu = () => setFilterMenu(null);
  const handleFilterSelect = (status) => {
    setStatusFilter(status);
    closeFilterMenu();
  };

  useEffect(() => {
    setLoading(true);
    let fieldsQuery;

    if (userProfile?.role === "admin") {
      if (statusFilter === "all") {
        fieldsQuery = query(collection(db, "canchas"));
      } else {
        fieldsQuery = query(collection(db, "canchas"), where("status", "==", statusFilter));
      }
    } else {
      fieldsQuery = query(collection(db, "canchas"), where("status", "==", "approved"));
    }

    const unsubscribe = onSnapshot(fieldsQuery, (snapshot) => {
      const fieldsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFields(fieldsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile, statusFilter]);

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    if (status === "disabled") return "secondary";
    return "dark";
  };

  const filterTitles = {
    all: "Todas las Canchas",
    approved: "Canchas Aprobadas",
    pending: "Canchas Pendientes",
    rejected: "Canchas Rechazadas",
    disabled: "Canchas Deshabilitadas",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h4">
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
                        <MDBox position="absolute" top={10} right={10}>
                          <MDBadge
                            badgeContent={field.status}
                            color={getStatusColor(field.status)}
                            variant="gradient"
                            size="sm"
                          />
                        </MDBox>
                      )}
                    </MDBox>
                    <MDBox p={3}>
                      <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                        {field.name || "Nombre no disponible"}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <Icon color="action" sx={{ mr: 1 }}>
                          location_on
                        </Icon>
                        <MDTypography variant="body2" color="text">
                          {field.address || "Dirección no disponible"}
                        </MDTypography>
                      </MDBox>
                      <MDButton variant="gradient" color="info" fullWidth>
                        Ver Disponibilidad
                      </MDButton>
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
    </DashboardLayout>
  );
}

export default Canchas;
