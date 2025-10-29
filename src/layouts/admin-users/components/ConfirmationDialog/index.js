// src/layouts/admin-users/components/ConfirmationDialog/index.js

import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import MDButton from "components/MDButton";

function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancelar
        </MDButton>
        <MDButton onClick={onConfirm} color="error" variant="gradient">
          {" "}
          {/* Color error para acciones destructivas */}
          Confirmar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmationDialog;
