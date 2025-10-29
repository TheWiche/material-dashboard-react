// src/layouts/admin-users/components/EditUserRoleModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Divider, // Importa Divider
} from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox"; // Importa MDBox
import MDTypography from "components/MDTypography"; // Importa MDTypography
import MDAvatar from "components/MDAvatar"; // Importa MDAvatar

function EditUserRoleModal({ open, onClose, onSubmit, loading, user }) {
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (user) {
      setNewRole(user.role || "cliente");
    } else {
      setNewRole("cliente"); // Resetea si no hay usuario
    }
  }, [user, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && user) {
      // Asegura que 'user' no sea null
      onSubmit(user, newRole);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Rol de Usuario</DialogTitle>
      {user && (
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {/* Sección de Información del Usuario Mejorada */}
            <MDBox display="flex" alignItems="center" mb={2}>
              <MDAvatar name={user.name || "?"} size="md" sx={{ mr: 2 }} />
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium">
                  {user.name || "Usuario"}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  {user.email || "Email no disponible"}
                </MDTypography>
              </MDBox>
            </MDBox>
            <Divider sx={{ my: 1 }} />

            {/* Selector de Rol */}
            <MDBox mt={2}>
              <FormControl variant="standard" fullWidth margin="dense">
                <InputLabel id="edit-role-select-label">Nuevo Rol</InputLabel>
                <Select
                  labelId="edit-role-select-label"
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="Nuevo Rol"
                  // Deshabilita la selección si es el admin actual intentando quitarse el rol
                  disabled={
                    loading ||
                    (user.role === "admin" &&
                      newRole !==
                        "admin") /* Agrega lógica para detectar si es el admin actual si lo necesitas */
                  }
                >
                  <MenuItem value="cliente">Cliente</MenuItem>
                  <MenuItem value="asociado">Asociado</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={onClose} color="secondary" disabled={loading}>
              Cancelar
            </MDButton>
            <MDButton
              type="submit"
              variant="gradient"
              color="info"
              disabled={loading || newRole === user.role}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar Rol"}
            </MDButton>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}

// ... (propTypes y defaultProps no cambian)
EditUserRoleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  user: PropTypes.object,
};

EditUserRoleModal.defaultProps = {
  loading: false,
  user: null,
};

export default EditUserRoleModal;
