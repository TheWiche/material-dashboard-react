// src/layouts/admin-users/index.js

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
import useUsersTableData from "layouts/admin-users/data/usersTableData";
import TableToolbar from "layouts/admin-users/components/TableToolbar"; // Importa el toolbar correcto
import AddUserModal from "layouts/admin-users/components/AddUserModal";
import EditUserRoleModal from "layouts/admin-users/components/EditUserRoleModal";
import ConfirmationDialog from "layouts/admin-users/components/ConfirmationDialog";
import { CircularProgress } from "@mui/material";
import {
  callCreateUserRequest,
  callToggleUserStatusRequest,
  callSetUserRoleRequest,
} from "services/firebaseService";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [pageSize, setPageSize] = useState(10); // Estado para el tamaño de página
  const entriesOptions = [10, 25, 50]; // Opciones

  // --- Manejadores de Modales y Acciones ---
  const handleEditRole = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleToggleDisable = (user) => {
    const actionText = user.status === "disabled" ? "habilitar" : "deshabilitar";
    setUserToToggle(user);
    setConfirmActionText(actionText);
    setIsConfirmOpen(true);
  };

  const confirmToggleDisable = async () => {
    if (!userToToggle) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await callToggleUserStatusRequest(userToToggle.id);
      setSnackbar({ open: true, color: "success", message: result.message });
      setUserToToggle(null);
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Hook de datos, pasando los manejadores de acción
  const { columns, rows, loading, error } = useUsersTableData(
    searchTerm,
    roleFilter,
    handleEditRole,
    handleToggleDisable
  );

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleCreateUser = async (userData) => {
    setLoadingAction(true);
    try {
      const result = await callCreateUserRequest(userData);
      handleCloseAddModal();
      setSnackbar({ open: true, color: "success", message: result.message });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveRole = async (editedUser, newRole) => {
    setLoadingAction(true);
    try {
      const result = await callSetUserRoleRequest(editedUser.id, newRole);
      handleCloseEditModal();
      setSnackbar({ open: true, color: "success", message: result.message });
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
      <MDBox pt={3} pb={3} px={3}>
        <MDTypography variant="h4" fontWeight="bold" mb={3}>
          Gestión de Usuarios
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
              >
                <MDButton variant="gradient" color="dark" onClick={handleOpenAddModal}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Crear Usuario
                </MDButton>
              </MDBox>

              {/* Barra de Herramientas con Todos los Controles */}
              <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                roleFilter={roleFilter}
                onRoleChange={(newRole) => {
                  if (newRole) setRoleFilter(newRole);
                }}
                entriesPerPage={pageSize}
                onEntriesChange={setPageSize} // Pasa la función 'setPageSize' directamente
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
                      Error al cargar usuarios
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
                    entriesPerPage={false} // 👈 Desactiva los controles internos
                    showTotalEntries
                    noEndBorder
                    canSearch={false} // 👈 Desactiva la búsqueda interna
                    // 👇 Pasa el 'pageSize' para que react-table sepa cuántas filas mostrar
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
      <AddUserModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateUser}
        loading={loadingAction}
      />
      <EditUserRoleModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleSaveRole}
        loading={loadingAction}
        user={userToEdit}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setUserToToggle(null);
        }}
        onConfirm={confirmToggleDisable}
        title={`Confirmar ${
          confirmActionText === "habilitar" ? "Habilitación" : "Deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} a ${
          userToToggle?.name || "este usuario"
        }?`}
        confirmColor={confirmActionText === "habilitar" ? "success" : "error"}
      />

      {/* Snackbar */}
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title="Gestión de Usuarios"
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite={snackbar.color !== "info" && snackbar.color !== "dark"}
      />
    </DashboardLayout>
  );
}

export default AdminUsers;
