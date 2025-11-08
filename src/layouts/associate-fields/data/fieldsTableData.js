// src/layouts/associate-fields/data/fieldsTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "services/firebaseService";
import { useAuth } from "context/AuthContext";
import useDebounce from "hooks/useDebounce";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function useFieldsTableData(searchTerm, statusFilter, onEditField, onToggleDisable) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFieldMenu, setCurrentFieldMenu] = useState(null);

  const handleMenuOpen = (event, field) => {
    setAnchorEl(event.currentTarget);
    setCurrentFieldMenu(field);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentFieldMenu(null);
  };

  useEffect(() => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let q;

    // Filtrar solo las canchas del asociado actual
    if (statusFilter !== "all") {
      // Cuando hay filtro de status, no usamos orderBy para evitar necesidad de índice compuesto
      // Ordenaremos en memoria después
      q = query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid),
        where("status", "==", statusFilter)
      );
    } else {
      q = query(
        collection(db, "canchas"),
        where("ownerId", "==", userProfile.uid),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let fieldsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Ordenar por fecha de creación si no hay orderBy en la query
        if (statusFilter !== "all") {
          fieldsData.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime; // Descendente
          });
        }

        if (debouncedSearchTerm) {
          const lowercasedFilter = debouncedSearchTerm.toLowerCase();
          fieldsData = fieldsData.filter(
            (field) =>
              (field.name && field.name.toLowerCase().includes(lowercasedFilter)) ||
              (field.address && field.address.toLowerCase().includes(lowercasedFilter))
          );
        }

        setFields(fieldsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener canchas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [debouncedSearchTerm, statusFilter, userProfile]);

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    if (status === "disabled") return "secondary";
    return "dark";
  };

  const getStatusText = (status) => {
    const statusMap = {
      approved: "Aprobada",
      pending: "Pendiente",
      rejected: "Rechazada",
      disabled: "Deshabilitada",
    };
    return statusMap[status] || status;
  };

  const rows = fields.map((field) => {
    return {
      nombre: (
        <MDTypography variant="button" fontWeight="medium">
          {field.name || "Sin nombre"}
        </MDTypography>
      ),
      direccion: (
        <MDTypography variant="caption" color="text">
          {field.address || "Sin dirección"}
        </MDTypography>
      ),
      precio: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          ${field.pricePerHour || "0"} / hora
        </MDTypography>
      ),
      estado: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={getStatusText(field.status)}
            color={getStatusColor(field.status)}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      fecha_creacion: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {field.createdAt?.seconds
            ? new Date(field.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </MDTypography>
      ),
      acciones: (
        <>
          <IconButton size="small" onClick={(event) => handleMenuOpen(event, field)}>
            <Icon>more_vert</Icon>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && currentFieldMenu?.id === field.id}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                if (onEditField) onEditField(currentFieldMenu);
                handleMenuClose();
              }}
            >
              Editar Cancha
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (onToggleDisable) onToggleDisable(currentFieldMenu);
                handleMenuClose();
              }}
            >
              {field.status === "disabled" ? "Habilitar Cancha" : "Deshabilitar Cancha"}
            </MenuItem>
          </Menu>
        </>
      ),
    };
  });

  return {
    columns: [
      { Header: "nombre", accessor: "nombre", width: "25%", align: "left" },
      { Header: "dirección", accessor: "direccion", width: "30%", align: "left" },
      { Header: "precio/hora", accessor: "precio", align: "center" },
      { Header: "estado", accessor: "estado", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
  };
}
