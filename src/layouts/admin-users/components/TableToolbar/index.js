// src/layouts/admin-users/components/TableToolbar/index.js

import React from "react";
import PropTypes from "prop-types";
import { Toolbar, ToggleButton, ToggleButtonGroup } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function TableToolbar({ searchTerm, onSearchChange, roleFilter, onRoleChange }) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        justifyContent: "space-between",
      }}
    >
      <MDBox>
        <ToggleButtonGroup
          color="info"
          value={roleFilter}
          exclusive
          onChange={onRoleChange}
          aria-label="Filtrar por rol"
        >
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="admin">Admin</ToggleButton>
          <ToggleButton value="asociado">Asociado</ToggleButton>
          <ToggleButton value="cliente">Cliente</ToggleButton>
        </ToggleButtonGroup>
      </MDBox>
      <MDBox width="12rem">
        <MDInput
          placeholder="Buscar..."
          value={searchTerm}
          onChange={onSearchChange}
          size="small"
        />
      </MDBox>
    </Toolbar>
  );
}

TableToolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  roleFilter: PropTypes.string.isRequired,
  onRoleChange: PropTypes.func.isRequired,
};

export default TableToolbar;
