// src/layouts/authentication/components/CleanAuthLayout/index.js

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PageLayout from "examples/LayoutContainers/PageLayout";
import Footer from "layouts/authentication/components/Footer";
import logo from "assets/images/Logo.png"; // Asegúrate que la ruta a tu logo sea correcta

function CleanAuthLayout({ children }) {
  return (
    <PageLayout>
      <MDBox px={3} py={3} position="absolute">
        <MDBox component="img" src={logo} alt="GoalTime Logo" width="4rem" />
      </MDBox>
      <MDBox px={1} width="100%" height="100vh" mx="auto">
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </PageLayout>
  );
}

CleanAuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CleanAuthLayout;
