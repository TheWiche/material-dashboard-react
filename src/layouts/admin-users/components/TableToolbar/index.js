// src/layouts/admin-users/components/TableToolbar/index.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Toolbar, Grid, IconButton, Menu, MenuItem, Icon, Autocomplete } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function TableToolbar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  entriesPerPage,
  onEntriesChange,
  entriesOptions,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleFilterSelect = (newRole) => {
    onRoleChange(newRole);
    handleClose();
  };

  const roleLabels = {
    all: "Todos",
    admin: "Admin",
    asociado: "Asociado",
    cliente: "Cliente",
  };

  // Lógica de seguridad para evitar errores 'undefined'
  const safeEntriesOptions =
    Array.isArray(entriesOptions) && entriesOptions.length > 0 ? entriesOptions : [10];
  const currentEntriesPerPage =
    entriesPerPage && safeEntriesOptions.includes(entriesPerPage)
      ? entriesPerPage.toString()
      : safeEntriesOptions[0].toString();

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
        {/* === GRUPO IZQUIERDO: Entradas por página === */}
        <Grid item xs={12} sm="auto">
          <MDBox display="flex" alignItems="center" flexWrap="nowrap">
            <Autocomplete
              disableClearable
              value={currentEntriesPerPage}
              options={safeEntriesOptions.map(String)}
              onChange={(event, newValue) => {
                if (onEntriesChange && newValue) {
                  onEntriesChange(parseInt(newValue, 10));
                }
              }}
              size="small"
              sx={{ width: "5rem" }}
              renderInput={(params) => <MDInput {...params} />}
            />
            <MDTypography variant="caption" color="secondary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
              entradas por página
            </MDTypography>
          </MDBox>
        </Grid>

        {/* === GRUPO DERECHO: Filtro y Búsqueda === */}
        <Grid item xs={12} sm="auto">
          <MDBox display="flex" alignItems="center" gap={1} flexWrap="nowrap">
            {/* Botón de Filtro */}
            <IconButton onClick={handleClick} title="Filtrar por rol">
              <Icon>filter_list</Icon>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem selected={roleFilter === "all"} onClick={() => handleFilterSelect("all")}>
                Todos
              </MenuItem>
              <MenuItem
                selected={roleFilter === "admin"}
                onClick={() => handleFilterSelect("admin")}
              >
                Admin
              </MenuItem>
              <MenuItem
                selected={roleFilter === "asociado"}
                onClick={() => handleFilterSelect("asociado")}
              >
                Asociado
              </MenuItem>
              <MenuItem
                selected={roleFilter === "cliente"}
                onClick={() => handleFilterSelect("cliente")}
              >
                Cliente
              </MenuItem>
            </Menu>

            {/* Barra de Búsqueda */}
            <MDBox width={{ xs: "120px", sm: "15rem" }}>
              <MDInput
                placeholder={`Buscar (${roleLabels[roleFilter]}) ...`}
                value={searchTerm}
                onChange={onSearchChange}
                size="small"
                fullWidth
              />
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </Toolbar>
  );
}

// PropTypes
TableToolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  roleFilter: PropTypes.string.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  entriesPerPage: PropTypes.number.isRequired,
  onEntriesChange: PropTypes.func.isRequired,
  entriesOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TableToolbar;
