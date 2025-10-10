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

// 👇 El hook ahora acepta 'searchTerm' y 'roleFilter'
export default function useUsersTableData(searchTerm, roleFilter) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setLoading(true);

    // 1. La consulta a Firestore ahora se basa PRINCIPALMENTE en el rol
    let q;
    if (roleFilter === "all") {
      q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "users"), where("role", "==", roleFilter));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // 2. El filtrado por texto se hace en el NAVEGADOR sobre los resultados
        if (debouncedSearchTerm) {
          const lowercasedFilter = debouncedSearchTerm.toLowerCase();
          usersData = usersData.filter(
            (user) =>
              user.name.toLowerCase().includes(lowercasedFilter) ||
              user.email.toLowerCase().includes(lowercasedFilter)
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
      <MDAvatar name={name} size="sm" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const rows = users.map((user) => {
    let roleColor;
    if (user.role === "admin") roleColor = "info";
    else if (user.role === "asociado") roleColor = "dark";
    else roleColor = "secondary";

    return {
      usuario: <User name={user.name} email={user.email} />,
      rol: (
        <MDBox ml={-1}>
          <MDBadge badgeContent={user.role} color={roleColor} variant="gradient" size="sm" />
        </MDBox>
      ),
      fecha_creacion: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
        </MDTypography>
      ),
      acciones: (
        <MDTypography component="a" href="#" color="text" sx={{ cursor: "pointer" }}>
          <Icon>more_vert</Icon>
        </MDTypography>
      ),
    };
  });

  return {
    columns: [
      { Header: "usuario", accessor: "usuario", width: "45%", align: "left" },
      { Header: "rol", accessor: "rol", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
  };
}
