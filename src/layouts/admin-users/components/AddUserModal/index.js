// src/layouts/admin-users/components/AddUserModal/index.js

import { useState, useEffect } from "react"; // Se añade useEffect
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress, // Se importa CircularProgress
} from "@mui/material";
import MDButton from "components/MDButton";

function AddUserModal({ open, onClose, onSubmit, loading }) {
  // Se recibe 'loading'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cliente");

  // 👇 Efecto para limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("cliente");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) {
      // Evita doble submit si ya está cargando
      onSubmit({ name, email, password, role });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Usuario</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Nombre Completo"
                type="text"
                fullWidth
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="email"
                label="Correo Electrónico"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="password"
                label="Contraseña Temporal"
                type="password"
                fullWidth
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="El usuario deberá cambiarla al iniciar sesión."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth margin="dense">
                <InputLabel id="role-select-label">Rol</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Rol"
                >
                  <MenuItem value="cliente">Cliente</MenuItem>
                  <MenuItem value="asociado">Asociado</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={onClose} color="secondary" disabled={loading}>
            Cancelar
          </MDButton>
          <MDButton type="submit" variant="gradient" color="info" disabled={loading}>
            {/* 👇 Muestra spinner si está cargando */}
            {loading ? <CircularProgress size={20} color="inherit" /> : "Crear Usuario"}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

AddUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool, // Se añade propType para loading
};

AddUserModal.defaultProps = {
  loading: false, // Valor por defecto
};

export default AddUserModal;
