// src/layouts/admin-fields/data/pendingFieldsTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "services/firebaseService";
import useDebounce from "hooks/useDebounce";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

export default function usePendingFieldsTableData(searchTerm, statusFilter, onApprove, onReject) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setLoading(true);
    let q;

    if (statusFilter !== "all") {
      q = query(
        collection(db, "canchas"),
        where("status", "==", statusFilter),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "canchas"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        // Usar querySnapshot.docChanges() para detectar cambios más rápido
        let fieldsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
  }, [debouncedSearchTerm, statusFilter]);

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
          <Chip
            label={getStatusText(field.status)}
            color={getStatusColor(field.status)}
            size="small"
            sx={{ fontWeight: "bold" }}
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
        <MDBox display="flex" gap={1} justifyContent="center" flexWrap="wrap">
          {field.status === "pending" && (
            <>
              <MDButton
                variant="gradient"
                color="success"
                size="small"
                onClick={() => onApprove(field)}
              >
                <Icon fontSize="small" sx={{ mr: 0.5 }}>
                  check
                </Icon>
                Aprobar
              </MDButton>
              <MDButton
                variant="gradient"
                color="error"
                size="small"
                onClick={() => onReject(field)}
              >
                <Icon fontSize="small" sx={{ mr: 0.5 }}>
                  close
                </Icon>
                Rechazar
              </MDButton>
            </>
          )}
        </MDBox>
      ),
    };
  });

  return {
    columns: [
      { Header: "nombre", accessor: "nombre", width: "20%", align: "left" },
      { Header: "dirección", accessor: "direccion", width: "25%", align: "left" },
      { Header: "precio/hora", accessor: "precio", align: "center" },
      { Header: "estado", accessor: "estado", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
  };
}
