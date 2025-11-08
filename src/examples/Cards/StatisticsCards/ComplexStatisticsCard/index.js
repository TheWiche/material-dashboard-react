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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCard({ color, title, count, percentage, icon }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          <Icon fontSize="medium" color="inherit">
            {icon}
          </Icon>
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pb={2} px={2}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDBox>
            <MDTypography
              variant="caption"
              color="text"
              fontWeight="medium"
              textTransform="uppercase"
            >
              {percentage.label || "Estado"}
            </MDTypography>
            {percentage.amount && (
              <MDBox display="flex" alignItems="center" mt={0.5}>
                <Icon
                  sx={{
                    fontSize: "1rem",
                    color: percentage.color === "success" ? "success.main" : "warning.main",
                    mr: 0.5,
                  }}
                >
                  {percentage.amount === "+" ? "trending_up" : "info"}
                </Icon>
                <MDTypography
                  variant="button"
                  fontWeight="bold"
                  color={percentage.color}
                  sx={{ fontSize: "0.75rem" }}
                >
                  {percentage.amount}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
          <MDBox
            width="40px"
            height="40px"
            borderRadius="lg"
            bgColor={percentage.color}
            variant="gradient"
            opacity={0.1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon sx={{ fontSize: "1.2rem", color: `${percentage.color}.main` }}>
              {percentage.color === "success"
                ? "check_circle"
                : percentage.color === "warning"
                ? "schedule"
                : "info"}
            </Icon>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
ComplexStatisticsCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node.isRequired,
};

export default ComplexStatisticsCard;
