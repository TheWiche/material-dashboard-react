// src/routes.js

import Dashboard from "layouts/dashboard";
import AdminUsers from "layouts/admin-users";
import Canchas from "layouts/canchas";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import AboutUs from "layouts/about-us";
import Blog from "layouts/blog";
import License from "layouts/license";
// Aquí irá la importación de BecomeAssociate en el futuro

import GuestRoute from "components/GuestRoute";
import ProtectedRoute from "components/ProtectedRoute";

import Icon from "@mui/material/Icon";

const routes = [
  // --- Rutas Protegidas (Solo para usuarios logueados) ---
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Usuarios",
    key: "admin-users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/admin/users",
    component: (
      <ProtectedRoute>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Canchas",
    key: "canchas",
    icon: <Icon fontSize="small">sports_soccer</Icon>,
    route: "/canchas",
    component: (
      <ProtectedRoute>
        <Canchas />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: (
      <ProtectedRoute>
        <Tables />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: (
      <ProtectedRoute>
        <Billing />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // --- Rutas de Invitado (Solo para usuarios NO logueados) ---
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: (
      <GuestRoute>
        <SignIn />
      </GuestRoute>
    ),
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: (
      <GuestRoute>
        <SignUp />
      </GuestRoute>
    ),
  },

  // --- Rutas Públicas (Visibles para TODOS, pero no en el menú) ---
  {
    key: "about-us",
    route: "/sobre-nosotros",
    component: <AboutUs />, // 👈 SIN PROTECCIÓN
  },
  {
    key: "blog",
    route: "/blog",
    component: <Blog />, // 👈 SIN PROTECCIÓN
  },
  {
    key: "license",
    route: "/licencia",
    component: <License />, // 👈 SIN PROTECCIÓN
  },
  // {
  //   key: "become-associate",
  //   route: "/become-associate",
  //   component: <BecomeAssociate />, // 👈 SIN PROTECCIÓN
  // },
];

export default routes;
