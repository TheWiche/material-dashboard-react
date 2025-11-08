/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import PropTypes from "prop-types";
import { Box } from "@mui/material";
import MDBox from "components/MDBox";
import PageLayout from "examples/LayoutContainers/PageLayout";

function SplitScreenLayout({ leftContent, rightContent, leftWidth = "40%", rightWidth = "60%" }) {
  return (
    <PageLayout>
      <MDBox
        width="100%"
        minHeight="100vh"
        display="flex"
        sx={{
          overflow: "hidden",
        }}
      >
        {/* Left Panel */}
        <MDBox
          width={leftWidth}
          minHeight="100vh"
          display={{ xs: "none", md: "flex" }}
          sx={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {leftContent}
        </MDBox>

        {/* Right Panel */}
        <MDBox
          width={{ xs: "100%", md: rightWidth }}
          minHeight="100vh"
          display="flex"
          flexDirection="column"
          sx={{
            backgroundColor: "white",
            position: "relative",
            overflow: "auto",
          }}
        >
          {rightContent}
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

SplitScreenLayout.propTypes = {
  leftContent: PropTypes.node.isRequired,
  rightContent: PropTypes.node.isRequired,
  leftWidth: PropTypes.string,
  rightWidth: PropTypes.string,
};

export default SplitScreenLayout;
