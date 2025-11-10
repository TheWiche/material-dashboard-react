// src/layouts/admin-fields/index.js

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import usePendingFieldsTableData from "layouts/admin-fields/data/pendingFieldsTableData";
import TableToolbar from "layouts/admin-fields/components/TableToolbar";
import ConfirmationDialog from "layouts/admin-users/components/ConfirmationDialog";
import { CircularProgress } from "@mui/material";
import { callApproveFieldRequest } from "services/firebaseService";

function AdminFields() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToApprove, setFieldToApprove] = useState(null);
  const [confirmAction, setConfirmAction] = useState(""); // "approve" o "reject"
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [pageSize, setPageSize] = useState(10);
  const entriesOptions = [10, 25, 50];

  // --- Manejadores de Acciones ---
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
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Hook de datos, pasando los manejadores de acción
  const { columns, rows, loading, error } = usePendingFieldsTableData(
    searchTerm,
    statusFilter,
    handleApprove,
    handleReject
  );

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // --- Renderizado del Componente ---
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
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
              >
                <MDTypography variant="h6" color="white">
                  Aprobación de Canchas
                </MDTypography>
              </MDBox>

              {/* Barra de Herramientas */}
              <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                statusFilter={statusFilter}
                onStatusChange={(newStatus) => {
                  if (newStatus) setStatusFilter(newStatus);
                }}
                entriesPerPage={pageSize}
                onEntriesChange={setPageSize}
                entriesOptions={entriesOptions}
              />

              {/* Contenedor de la Tabla */}
              <MDBox>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : error ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="error" mb={1}>
                      Error al cargar canchas
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {error}
                    </MDTypography>
                    <MDButton
                      variant="gradient"
                      color="info"
                      size="small"
                      onClick={() => window.location.reload()}
                      sx={{ mt: 2 }}
                    >
                      Recargar página
                    </MDButton>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries
                    noEndBorder
                    canSearch={false}
                    initialState={{ pageSize: pageSize }}
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
          setFieldToApprove(null);
        }}
        onConfirm={confirmActionHandler}
        title={`Confirmar ${confirmAction === "approve" ? "Aprobación" : "Rechazo"}`}
        message={`¿Estás seguro de que quieres ${
          confirmAction === "approve" ? "aprobar" : "rechazar"
        } la cancha "${fieldToApprove?.name || ""}"?`}
      />

      {/* Snackbar */}
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title="Aprobación de Canchas"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </DashboardLayout>
  );
}

export default AdminFields;
