// src/layouts/admin-users/data/usersTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "services/firebaseService";
import useDebounce from "hooks/useDebounce";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

// 👇 CORRECCIÓN: Se añaden onEditRole y onToggleDisable a los parámetros
export default function useUsersTableData(searchTerm, roleFilter, onEditRole, onToggleDisable) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserMenu, setCurrentUserMenu] = useState(null);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserMenu(user);
    console.log("Abriendo menú para:", user); // Log para depurar
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserMenu(null);
  };

  useEffect(() => {
    setLoading(true);
    let q;
    const normalizedSearchTerm = debouncedSearchTerm
      ? debouncedSearchTerm.charAt(0).toUpperCase() + debouncedSearchTerm.slice(1).toLowerCase()
      : "";

    if (roleFilter !== "all") {
      q = query(collection(db, "users"), where("role", "==", roleFilter));
    } else {
      q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (normalizedSearchTerm) {
          const lowercasedFilter = normalizedSearchTerm.toLowerCase();
          // Asegúrate que user.name y user.email existan antes de llamar a toLowerCase()
          usersData = usersData.filter(
            (user) =>
              (user.name && user.name.toLowerCase().includes(lowercasedFilter)) ||
              (user.email && user.email.toLowerCase().includes(lowercasedFilter))
          );
        }

        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [debouncedSearchTerm, roleFilter]);

  const User = ({ name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar name={name || "?"} size="sm" /> {/* Añadido fallback por si name no existe */}
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name || "Nombre no disponible"}
        </MDTypography>
        <MDTypography variant="caption">{email || "Email no disponible"}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const rows = users.map((user) => {
    let roleColor = "secondary"; // Valor por defecto
    if (user.role === "admin") roleColor = "info";
    else if (user.role === "asociado") roleColor = "dark";

    const isDisabled = user.status === "disabled";
    const statusText = isDisabled ? "Deshabilitado" : "Activo";
    const statusColor = isDisabled ? "secondary" : "success";

    return {
      usuario: <User name={user.name} email={user.email} />,
      rol: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={user.role || "N/A"}
            color={roleColor}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      estado: (
        <MDBox ml={-1}>
          <MDBadge badgeContent={statusText} color={statusColor} variant="gradient" size="sm" />
        </MDBox>
      ),
      fecha_creacion: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {user.createdAt?.seconds
            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </MDTypography>
      ),
      acciones: (
        <>
          <IconButton size="small" onClick={(event) => handleMenuOpen(event, user)}>
            <Icon>more_vert</Icon>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            // Asegúrate que la comparación use user.id, asumiendo que user tiene 'id'
            open={Boolean(anchorEl) && currentUserMenu?.id === user.id}
            onClose={handleMenuClose}
          >
            {/* 👇 CORRECCIÓN: Llama a las funciones recibidas como props */}
            <MenuItem
              onClick={() => {
                if (onEditRole) onEditRole(currentUserMenu);
                handleMenuClose();
              }}
            >
              Editar Rol
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (onToggleDisable) onToggleDisable(currentUserMenu);
                handleMenuClose();
              }}
            >
              {isDisabled ? "Habilitar Usuario" : "Deshabilitar Usuario"}
            </MenuItem>
          </Menu>
        </>
      ),
    };
  });

  return {
    columns: [
      { Header: "usuario", accessor: "usuario", width: "35%", align: "left" },
      { Header: "rol", accessor: "rol", align: "center" },
      { Header: "estado", accessor: "estado", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
  };
}
