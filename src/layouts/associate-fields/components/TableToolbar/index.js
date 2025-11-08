// src/layouts/associate-fields/components/TableToolbar/index.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Toolbar, Grid, IconButton, Menu, MenuItem, Icon, Autocomplete } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function TableToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  entriesPerPage,
  onEntriesChange,
  entriesOptions,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleFilterSelect = (newStatus) => {
    onStatusChange(newStatus);
    handleClose();
  };

  const statusLabels = {
    all: "Todas",
    approved: "Aprobadas",
    pending: "Pendientes",
    rejected: "Rechazadas",
    disabled: "Deshabilitadas",
  };

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
            <IconButton onClick={handleClick} title="Filtrar por estado">
              <Icon>filter_list</Icon>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem selected={statusFilter === "all"} onClick={() => handleFilterSelect("all")}>
                Todas
              </MenuItem>
              <MenuItem
                selected={statusFilter === "approved"}
                onClick={() => handleFilterSelect("approved")}
              >
                Aprobadas
              </MenuItem>
              <MenuItem
                selected={statusFilter === "pending"}
                onClick={() => handleFilterSelect("pending")}
              >
                Pendientes
              </MenuItem>
              <MenuItem
                selected={statusFilter === "rejected"}
                onClick={() => handleFilterSelect("rejected")}
              >
                Rechazadas
              </MenuItem>
              <MenuItem
                selected={statusFilter === "disabled"}
                onClick={() => handleFilterSelect("disabled")}
              >
                Deshabilitadas
              </MenuItem>
            </Menu>

            {/* Barra de Búsqueda */}
            <MDBox width={{ xs: "120px", sm: "15rem" }}>
              <MDInput
                placeholder={`Buscar canchas...`}
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
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  entriesPerPage: PropTypes.number.isRequired,
  onEntriesChange: PropTypes.func.isRequired,
  entriesOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TableToolbar;
