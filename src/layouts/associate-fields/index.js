// src/layouts/associate-fields/index.js

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
import useFieldsTableData from "layouts/associate-fields/data/fieldsTableData";
import TableToolbar from "layouts/associate-fields/components/TableToolbar";
import AddFieldModal from "layouts/associate-fields/components/AddFieldModal";
import EditFieldModal from "layouts/associate-fields/components/EditFieldModal";
import { CircularProgress } from "@mui/material";
import { createField, updateField, toggleFieldStatus } from "services/firebaseService";
import ConfirmationDialog from "layouts/admin-users/components/ConfirmationDialog";

function AssociateFields() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToToggle, setFieldToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [pageSize, setPageSize] = useState(10);
  const entriesOptions = [10, 25, 50];

  // --- Manejadores de Modales y Acciones ---
  const handleEditField = (field) => {
    setFieldToEdit(field);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setFieldToEdit(null);
  };

  const handleToggleDisable = (field) => {
    const actionText = field.status === "disabled" ? "habilitar" : "deshabilitar";
    setFieldToToggle(field);
    setConfirmActionText(actionText);
    setIsConfirmOpen(true);
  };

  const confirmToggleDisable = async () => {
    if (!fieldToToggle) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await toggleFieldStatus(fieldToToggle.id);
      setSnackbar({ open: true, color: "success", message: result.message });
      setFieldToToggle(null);
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Hook de datos, pasando los manejadores de acción
  const { columns, rows, loading } = useFieldsTableData(
    searchTerm,
    statusFilter,
    handleEditField,
    handleToggleDisable
  );

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleCreateField = async (fieldData) => {
    setLoadingAction(true);
    try {
      await createField(fieldData);
      handleCloseAddModal();
      setSnackbar({ open: true, color: "success", message: "Cancha creada exitosamente." });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateField = async (fieldId, fieldData) => {
    setLoadingAction(true);
    try {
      await updateField(fieldId, fieldData);
      handleCloseEditModal();
      setSnackbar({ open: true, color: "success", message: "Cancha actualizada exitosamente." });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

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
                  Mis Canchas
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={handleOpenAddModal}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Registrar Cancha
                </MDButton>
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

      {/* Modales */}
      <AddFieldModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateField}
        loading={loadingAction}
      />
      <EditFieldModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateField}
        loading={loadingAction}
        field={fieldToEdit}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setFieldToToggle(null);
        }}
        onConfirm={confirmToggleDisable}
        title={`Confirmar ${
          confirmActionText === "habilitar" ? "Habilitación" : "Deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} la cancha "${
          fieldToToggle?.name || "esta cancha"
        }"?`}
        confirmColor={confirmActionText === "habilitar" ? "success" : "error"}
      />

      {/* Snackbar */}
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title="Gestión de Canchas"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </DashboardLayout>
  );
}

export default AssociateFields;
