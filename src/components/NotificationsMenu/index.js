/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "services/firebaseService";
import { useAuth } from "context/AuthContext";

function NotificationsMenu() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log("NotificationsMenu: No hay usuario autenticado");
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    console.log("NotificationsMenu: Suscribiéndose a notificaciones para:", currentUser.uid);
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      console.log("NotificationsMenu: Notificaciones actualizadas:", notifs.length);
      setNotifications(notifs);
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    return () => {
      console.log("NotificationsMenu: Desuscribiéndose de notificaciones");
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
      }
    }

    // Cerrar menú y navegar
    handleClose();
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.uid || unreadCount === 0) return;

    try {
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const getNotificationIcon = (icon) => {
    return icon || "notifications";
  };

  const getNotificationColor = (color) => {
    const colorMap = {
      success: "success.main",
      error: "error.main",
      warning: "warning.main",
      info: "info.main",
    };
    return colorMap[color] || "text.main";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Ahora";

    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  if (!userProfile) return null;

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleClick}
          sx={{
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Icon>notifications</Icon>
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 360,
            maxWidth: 420,
            maxHeight: 500,
            overflow: "auto",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Header */}
        <MDBox px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="bold">
            Notificaciones
          </MDTypography>
          {unreadCount > 0 && (
            <MDTypography
              variant="button"
              color="info"
              onClick={handleMarkAllAsRead}
              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              Marcar todas como leídas
            </MDTypography>
          )}
        </MDBox>

        <Divider />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <MDBox px={2} py={4} textAlign="center">
            <Icon sx={{ fontSize: "3rem", color: "text.secondary", mb: 1 }}>
              notifications_none
            </Icon>
            <MDTypography variant="body2" color="text">
              No tienes notificaciones
            </MDTypography>
          </MDBox>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: notification.read ? "transparent" : "action.hover",
                "&:hover": {
                  backgroundColor: "action.selected",
                },
                borderLeft: notification.read ? "none" : "3px solid",
                borderLeftColor: getNotificationColor(notification.color),
              }}
            >
              <MDBox display="flex" width="100%" alignItems="flex-start">
                <MDBox
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${notification.color || "info"}.main`,
                    color: "white",
                    mr: 2,
                  }}
                >
                  <Icon fontSize="small">{getNotificationIcon(notification.icon)}</Icon>
                </MDBox>
                <MDBox flex={1} minWidth={0}>
                  <MDTypography
                    variant="button"
                    fontWeight={notification.read ? "regular" : "bold"}
                    color="text"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {notification.title}
                  </MDTypography>
                  <MDTypography
                    variant="caption"
                    color="text"
                    sx={{
                      display: "-webkit-box",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {notification.message}
                  </MDTypography>
                  <MDTypography variant="caption" color="text.secondary">
                    {formatDate(notification.createdAt)}
                  </MDTypography>
                </MDBox>
                {!notification.read && (
                  <MDBox
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: `${notification.color || "info"}.main`,
                      ml: 1,
                      mt: 0.5,
                    }}
                  />
                )}
              </MDBox>
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <MDBox px={2} py={1} textAlign="center">
              <MDTypography variant="caption" color="text.secondary">
                {notifications.length}{" "}
                {notifications.length === 1 ? "notificación" : "notificaciones"}
              </MDTypography>
            </MDBox>
          </>
        )}
      </Menu>
    </>
  );
}

NotificationsMenu.propTypes = {
  // No props needed, uses AuthContext
};

export default NotificationsMenu;
