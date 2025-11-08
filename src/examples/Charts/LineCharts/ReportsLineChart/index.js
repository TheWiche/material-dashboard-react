/**
=========================================================
* Material Dashboard 2  React - v2.2.0
=========================================================

* Product Page: https://www.goaltime.site/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useMemo, useRef, useEffect, useState } from "react";

// porp-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-chartjs-2 components
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// GoalTime App components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// ReportsLineChart configurations
import configs from "examples/Charts/LineCharts/ReportsLineChart/configs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ReportsLineChart({ color, title, description, date, chart }) {
  const { data, options } = configs(chart.labels || [], chart.datasets || {});
  const hasAnimated = useRef(false);
  const [disableAnimation, setDisableAnimation] = useState(false);

  useEffect(() => {
    // Permitir que la animación se ejecute una vez, luego desactivarla
    const timer = setTimeout(() => {
      hasAnimated.current = true;
      setDisableAnimation(true);
    }, 2100); // Un poco más que la duración de la animación (2000ms)

    return () => clearTimeout(timer);
  }, []);

  const chartOptions = useMemo(() => {
    if (disableAnimation) {
      return {
        ...options,
        animation: {
          duration: 0,
        },
      };
    }
    return options;
  }, [options, disableAnimation]);

  return (
    <MDBox>
      {useMemo(
        () => (
          <MDBox
            variant="gradient"
            bgColor={color}
            borderRadius="lg"
            coloredShadow={color}
            py={2}
            pr={0.5}
            height="12.5rem"
            mb={2}
          >
            <Line data={data} options={chartOptions} />
          </MDBox>
        ),
        [color, data, chartOptions]
      )}
      <MDBox>
        <MDTypography variant="h6" textTransform="capitalize" mb={1}>
          {title}
        </MDTypography>
        <MDTypography component="div" variant="button" color="text" fontWeight="light" mb={1}>
          {description}
        </MDTypography>
        <Divider sx={{ my: 1 }} />
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
            <Icon>schedule</Icon>
          </MDTypography>
          <MDTypography variant="button" color="text" fontWeight="light">
            {date}
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of ReportsLineChart
ReportsLineChart.defaultProps = {
  color: "info",
  description: "",
};

// Typechecking props for the ReportsLineChart
ReportsLineChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsLineChart;
