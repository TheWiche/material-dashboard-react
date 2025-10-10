// src/layouts/admin-users/index.js

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import useUsersTableData from "layouts/admin-users/data/usersTableData";
import TableToolbar from "layouts/admin-users/components/TableToolbar"; // 👈 Se importa el nuevo toolbar
import { CircularProgress } from "@mui/material";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // Estado para el filtro de rol

  const { columns, rows, loading } = useUsersTableData(searchTerm, roleFilter);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={3}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Tabla de Usuarios
                </MDTypography>
              </MDBox>

              {/* 👇 Se renderiza el nuevo Toolbar aquí */}
              <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                roleFilter={roleFilter}
                onRoleChange={(e, newRole) => {
                  // ToggleButtonGroup devuelve null si se deselecciona, nos aseguramos de que siempre haya un valor
                  if (newRole !== null) {
                    setRoleFilter(newRole);
                  }
                }}
              />

              <MDBox>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={{ defaultValue: 10, options: [10, 25, 50] }} // Mejoramos la paginación
                    showTotalEntries
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminUsers;
