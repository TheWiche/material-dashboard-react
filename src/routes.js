// src/routes.js

import Dashboard from "layouts/dashboard";
import AdminUsers from "layouts/admin-users";
import AdminFields from "layouts/admin-fields";
import AssociateFields from "layouts/associate-fields";
import AssociateReservations from "layouts/associate-reservations";
import Canchas from "layouts/canchas";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";
import ConfirmResetPassword from "layouts/authentication/reset-password/confirm";
import AboutUs from "layouts/about-us";
import Blog from "layouts/blog";
import License from "layouts/license";
import PrivacyPolicy from "layouts/privacy-policy";
import TermsOfService from "layouts/terms-of-service";
import Homepage from "layouts/homepage";

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
  // Ruta "Aprobar Canchas" eliminada - La funcionalidad está integrada en "Canchas"
  // {
  //   type: "collapse",
  //   name: "Aprobar Canchas",
  //   key: "admin-fields",
  //   icon: <Icon fontSize="small">check_circle</Icon>,
  //   route: "/admin/fields",
  //   component: (
  //     <ProtectedRoute>
  //       <AdminFields />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    type: "collapse",
    name: "Mis Canchas",
    key: "associate-fields",
    icon: <Icon fontSize="small">stadium</Icon>,
    route: "/associate/fields",
    component: (
      <ProtectedRoute>
        <AssociateFields />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Mis Reservas",
    key: "associate-reservations",
    icon: <Icon fontSize="small">event</Icon>,
    route: "/associate/reservations",
    component: (
      <ProtectedRoute>
        <AssociateReservations />
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
  {
    key: "reset-password",
    route: "/authentication/reset-password",
    component: (
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    ),
  },
  {
    key: "confirm-reset-password",
    route: "/authentication/reset-password/confirm",
    component: (
      <GuestRoute>
        <ConfirmResetPassword />
      </GuestRoute>
    ),
  },

  // --- Rutas Públicas (Visibles para TODOS, pero no en el menú) ---
  {
    key: "homepage",
    route: "/",
    component: <Homepage />,
  },
  {
    key: "privacy-policy",
    route: "/politica-de-privacidad",
    component: <PrivacyPolicy />, // No necesita protección
  },
  {
    key: "terms-of-service",
    route: "/terminos-y-condiciones",
    component: <TermsOfService />, // No necesita protección
  },
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
