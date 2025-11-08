/**
=========================================================
* GoalTime App - v2.2.0
=========================================================

* Product Page: https://www.goaltime.site/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import Icon from "@mui/material/Icon";

function DefaultProjectCard({ image, label, title, description, action, authors }) {
  // Funciones helper para el estado
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "disabled":
        return "error";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      case "disabled":
        return "Deshabilitada";
      case "rejected":
        return "Rechazada";
      default:
        return status || "Sin estado";
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "approved":
        return "check_circle";
      case "pending":
        return "schedule";
      case "disabled":
        return "block";
      case "rejected":
        return "cancel";
      default:
        return "info";
    }
  };

  const renderAuthors = authors.map(({ image: media, name }) => (
    <Tooltip key={name} title={name} placement="bottom">
      <MDAvatar
        src={media}
        alt={name}
        size="xs"
        sx={({ borders: { borderWidth }, palette: { white } }) => ({
          border: `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",
          ml: -1.25,

          "&:hover, &:focus": {
            zIndex: "10",
          },
        })}
      />
    </Tooltip>
  ));

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        boxShadow: "none",
        overflow: "visible",
        height: "100%",
      }}
    >
      <MDBox
        position="relative"
        width="100.25%"
        shadow="xl"
        borderRadius="xl"
        sx={{
          height: "200px",
          minHeight: "200px",
          maxHeight: "200px",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "grey.200",
          position: "relative",
        }}
      >
        <CardMedia
          src={image || "https://via.placeholder.com/400x200?text=Sin+Imagen"}
          component="img"
          title={title}
          onError={(e) => {
            if (e.target.src !== "https://via.placeholder.com/400x200?text=Sin+Imagen") {
              e.target.src = "https://via.placeholder.com/400x200?text=Sin+Imagen";
            }
          }}
          sx={{
            width: "100%",
            height: "200px",
            minHeight: "200px",
            maxHeight: "200px",
            margin: 0,
            padding: 0,
            boxShadow: ({ boxShadows: { md } }) => md,
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            flexShrink: 0,
          }}
        />
      </MDBox>
      <MDBox mt={1} mx={0.5}>
        <MDBox mb={1.5} display="flex" alignItems="center">
          <Chip
            label={getStatusText(label)}
            color={getStatusColor(label)}
            icon={<Icon fontSize="small">{getStatusIcon(label)}</Icon>}
            size="small"
            sx={{
              fontWeight: "bold",
              fontSize: "0.7rem",
              height: "24px",
              "& .MuiChip-icon": {
                fontSize: "0.9rem",
              },
            }}
          />
        </MDBox>
        <MDBox mb={1}>
          {action.type === "internal" ? (
            <MDTypography
              component={Link}
              to={action.route}
              variant="h5"
              textTransform="capitalize"
            >
              {title}
            </MDTypography>
          ) : (
            <MDTypography
              component="a"
              href={action.route}
              target="_blank"
              rel="noreferrer"
              variant="h5"
              textTransform="capitalize"
            >
              {title}
            </MDTypography>
          )}
        </MDBox>
        <MDBox mb={3} lineHeight={0}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {description}
          </MDTypography>
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          {action.type === "internal" ? (
            <MDButton
              component={Link}
              to={action.route}
              variant="outlined"
              size="small"
              color={action.color}
            >
              {action.label}
            </MDButton>
          ) : action.type === "button" ? (
            <MDButton onClick={action.onClick} variant="outlined" size="small" color={action.color}>
              {action.label}
            </MDButton>
          ) : (
            <MDButton
              component="a"
              href={action.route}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              size="small"
              color={action.color}
            >
              {action.label}
            </MDButton>
          )}
          <MDBox display="flex">{renderAuthors}</MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of DefaultProjectCard
DefaultProjectCard.defaultProps = {
  authors: [],
};

// Typechecking props for the DefaultProjectCard
DefaultProjectCard.propTypes = {
  image: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal", "button"]),
    route: PropTypes.string,
    onClick: PropTypes.func,
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
      "white",
    ]).isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  authors: PropTypes.arrayOf(PropTypes.object),
};

export default DefaultProjectCard;
