// src/layouts/admin-users/data/usersTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "services/firebaseService";
import useDebounce from "hooks/useDebounce";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

// 👇 CORRECCIÓN: Se añaden onEditRole y onToggleDisable a los parámetros
export default function useUsersTableData(searchTerm, roleFilter, onEditRole, onToggleDisable) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

    const getRoleText = (role) => {
      const roleMap = {
        admin: "Administrador",
        asociado: "Asociado",
        cliente: "Cliente",
      };
      return roleMap[role] || role || "N/A";
    };

    return {
      usuario: <User name={user.name} email={user.email} />,
      rol: (
        <MDBox ml={-1}>
          <Chip
            label={getRoleText(user.role)}
            color={roleColor}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </MDBox>
      ),
      estado: (
        <MDBox ml={-1}>
          <Chip label={statusText} color={statusColor} size="small" sx={{ fontWeight: "bold" }} />
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
        <MDBox display="flex" gap={1} justifyContent="center" flexWrap="wrap">
          <MDButton
            variant="outlined"
            color="info"
            size="small"
            onClick={() => {
              if (onEditRole) onEditRole(user);
            }}
          >
            <Icon fontSize="small" sx={{ mr: 0.5 }}>
              edit
            </Icon>
            Editar Rol
          </MDButton>
          <MDButton
            variant="outlined"
            color={isDisabled ? "success" : "error"}
            size="small"
            onClick={() => {
              if (onToggleDisable) onToggleDisable(user);
            }}
          >
            <Icon fontSize="small" sx={{ mr: 0.5 }}>
              {isDisabled ? "check_circle" : "cancel"}
            </Icon>
            {isDisabled ? "Habilitar" : "Deshabilitar"}
          </MDButton>
        </MDBox>
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
