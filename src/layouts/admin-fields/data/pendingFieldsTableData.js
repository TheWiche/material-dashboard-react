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
  const [error, setError] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Validar que statusFilter sea válido
    if (
      !statusFilter ||
      (statusFilter !== "all" &&
        !["pending", "approved", "rejected", "disabled"].includes(statusFilter))
    ) {
      console.warn("Filtro de estado inválido:", statusFilter);
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q;
    let unsubscribe;

    try {
      // Construir la query de forma segura
      if (statusFilter !== "all") {
        // Para filtros específicos, no usar orderBy para evitar necesidad de índice compuesto
        // Ordenaremos en memoria después
        q = query(collection(db, "canchas"), where("status", "==", statusFilter));
      } else {
        // Solo para "all" intentamos usar orderBy
        try {
          q = query(collection(db, "canchas"), orderBy("createdAt", "desc"));
        } catch (orderByError) {
          // Si falla orderBy, usar query simple
          console.warn("Error con orderBy, usando query simple:", orderByError);
          q = query(collection(db, "canchas"));
        }
      }

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            let fieldsData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "",
                address: data.address || "",
                status: data.status || "pending",
                pricePerHour: data.pricePerHour || 0,
                createdAt: data.createdAt || null,
                ...data,
              };
            });

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
              fieldsData = fieldsData.filter((field) => {
                try {
                  const nameMatch =
                    field.name && typeof field.name === "string"
                      ? field.name.toLowerCase().includes(lowercasedFilter)
                      : false;
                  const addressMatch =
                    field.address && typeof field.address === "string"
                      ? field.address.toLowerCase().includes(lowercasedFilter)
                      : false;
                  return nameMatch || addressMatch;
                } catch (filterError) {
                  console.warn("Error al filtrar cancha:", filterError, field);
                  return false;
                }
              });
            }

            setFields(fieldsData);
            setLoading(false);
            setError(null);
          } catch (processingError) {
            console.error("Error al procesar datos de canchas:", processingError);
            setFields([]);
            setLoading(false);
            setError("Error al procesar los datos. Por favor, intenta de nuevo.");
          }
        },
        (error) => {
          console.error("Error al obtener canchas:", error);
          setFields([]);
          setLoading(false);
          setError("Error al cargar las canchas. Por favor, recarga la página.");

          // Si el error es por falta de índice, mostrar mensaje más específico
          if (error.code === "failed-precondition") {
            setError("Se requiere un índice en Firestore. Por favor, contacta al administrador.");
          }
        }
      );
    } catch (queryError) {
      console.error("Error al construir la query:", queryError);
      setFields([]);
      setLoading(false);
      setError("Error al construir la consulta. Por favor, intenta de nuevo.");
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [debouncedSearchTerm, statusFilter]);

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    if (status === "disabled") return "secondary";
    return "default";
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
    error,
  };
}
