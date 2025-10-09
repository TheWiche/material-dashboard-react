/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

// GoalTime App layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Canchas from "layouts/canchas";

// 👈 Se importan los componentes de protección de rutas
import GuestRoute from "components/GuestRoute";
import ProtectedRoute from "components/ProtectedRoute";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    // 👈 Protegido: Solo para usuarios logueados
    component: (
      <ProtectedRoute>
        <Dashboard />
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
    // 👈 Protegido: Solo para usuarios logueados
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
    // 👈 Protegido: Solo para usuarios logueados
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
    // 👈 Protegido: Solo para usuarios logueados
    component: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    // 👈 Protegido: Solo para usuarios logueados
    component: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    // 👈 Protegido: Solo para usuarios NO logueados (invitados)
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
    // 👈 Protegido: Solo para usuarios NO logueados (invitados)
    component: (
      <GuestRoute>
        <SignUp />
      </GuestRoute>
    ),
  },
];

export default routes;
