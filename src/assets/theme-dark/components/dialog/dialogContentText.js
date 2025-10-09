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

// GoalTime App base styles
import typography from "assets/theme-dark/base/typography";
import colors from "assets/theme-dark/base/colors";

// GoalTime App helper functions
import rgba from "assets/theme-dark/functions/rgba";

const { size } = typography;
const { white } = colors;

const dialogContentText = {
  styleOverrides: {
    root: {
      fontSize: size.md,
      color: rgba(white.main, 0.8),
    },
  },
};

export default dialogContentText;
