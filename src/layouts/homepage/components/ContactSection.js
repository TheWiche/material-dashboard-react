// src/layouts/homepage/components/ContactSection.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container, Grid, Card, TextField, Button, Divider } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";
import { useScrollAnimation, animationVariants } from "hooks/useScrollAnimation";

function ContactSection() {
  // --- Estados para el formulario ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados para las notificaciones (como en tu archivo Notifications.js) ---
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  // --- Manejador para actualizar el estado del formulario ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Manejador para enviar el formulario con fetch ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita la recarga de la página
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mrbrzboy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Éxito
        setFormData({ name: "", email: "", message: "" }); // Resetea el formulario
        openSuccessSB(); // Muestra la notificación de éxito
      } else {
        // Error de Formspree (ej. validación)
        openErrorSB(); // Muestra la notificación de error
      }
    } catch (error) {
      // Error de red
      console.error("Error al enviar el formulario:", error);
      openErrorSB(); // Muestra la notificación de error
    } finally {
      setIsSubmitting(false); // Reactiva el botón
    }
  };

  // --- Definición de los Snackbars ---
  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="¡Mensaje Enviado!"
      content="Gracias por contactarnos. Te responderemos pronto."
      dateTime="justo ahora"
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Error al Enviar"
      content="Hubo un problema al enviar tu mensaje. Inténtalo de nuevo."
      dateTime="justo ahora"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  const { ref, isInView } = useScrollAnimation({ once: true, amount: 0.15 });

  return (
    <MDBox id="contacto" ref={ref} py={8} bgColor="white">
      <Container maxWidth="md">
        <motion.div
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={animationVariants.fadeDown}>
            <MDTypography variant="h2" fontWeight="bold" mb={4} textAlign="center" color="dark">
              Contáctanos
            </MDTypography>
          </motion.div>
          <Grid container spacing={4}>
            {/* --- Columna de Información de Contacto (Completa) --- */}
            <Grid item xs={12} md={6}>
              <motion.div variants={animationVariants.fadeLeft}>
                <Card elevation={4} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDTypography variant="h5" fontWeight="bold" color="info" mb={2}>
                        Información de Contacto
                      </MDTypography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox display="flex" alignItems="center" mb={1}>
                        <Icon sx={{ mr: 1 }} color="info">
                          location_on
                        </Icon>
                        <MDTypography variant="body1" fontWeight="medium" color="dark">
                          Universidad de La Guajira, Bloque 8 - Ingeniería
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="body2" color="text" mb={1} ml={4}>
                        Riohacha, Colombia
                        <br />
                        Km 3+354 vía Maicao, La Guajira
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox display="flex" alignItems="center" mb={1}>
                        <Icon sx={{ mr: 1 }} color="success">
                          phone
                        </Icon>
                        <MDTypography variant="body1" fontWeight="medium" color="dark">
                          +57 (xxx) xxx-xxxx
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="body2" color="text" ml={4}>
                        Lunes a Viernes: 8:00 - 20:00HS
                        <br />
                        Sábado-Domingo: 8:00 - 16:00HS
                        <br />
                        Días Festivos: 8:00 - 16:00HS
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox display="flex" alignItems="center">
                        <Icon sx={{ mr: 1 }} color="info">
                          email
                        </Icon>
                        <MDTypography variant="body1" fontWeight="medium" color="dark">
                          equipo@goaltime.site
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="h6" fontWeight="bold" color="info" mb={2} mt={2}>
                        Ubicación en el Mapa
                      </MDTypography>
                      <MDBox
                        sx={{ width: "100%", height: "220px", borderRadius: 2, overflow: "hidden" }}
                      >
                        <iframe
                          title="Ubicación Universidad de La Guajira"
                          src="https://www.google.com/maps?q=Universidad+de+La+Guajira,+Bloque+8,+Riohacha,+Colombia&output=embed"
                          width="100%"
                          height="100%"
                          style={{ border: 0, borderRadius: "8px" }}
                          allowFullScreen=""
                          loading="lazy"
                        ></iframe>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Card>
              </motion.div>
            </Grid>

            {/* --- Columna del Formulario (MODIFICADA) --- */}
            <Grid item xs={12} md={6}>
              <motion.div variants={animationVariants.fadeRight}>
                <Card elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                  {/* 👇 Se cambia la etiqueta <form> para usar el handler de React */}
                  <form onSubmit={handleSubmit}>
                    <MDTypography variant="h5" mb={2} color="info" fontWeight="bold">
                      Envíanos un Mensaje
                    </MDTypography>
                    <Divider sx={{ mb: 2 }} />
                    <TextField
                      label="Nombre"
                      name="name" // 👈 name debe coincidir con el estado
                      value={formData.name} // 👈 Controlado por React
                      onChange={handleChange} // 👈 Controlado por React
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      disabled={isSubmitting} // 👈 Deshabilitado al enviar
                    />
                    <TextField
                      label="Correo Electrónico"
                      name="email" // 👈 name debe coincidir con el estado
                      type="email"
                      value={formData.email} // 👈 Controlado por React
                      onChange={handleChange} // 👈 Controlado por React
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      disabled={isSubmitting} // 👈 Deshabilitado al enviar
                    />
                    <TextField
                      label="Mensaje"
                      name="message" // 👈 name debe coincidir con el estado
                      multiline
                      rows={4}
                      value={formData.message} // 👈 Controlado por React
                      onChange={handleChange} // 👈 Controlado por React
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      disabled={isSubmitting} // 👈 Deshabilitado al enviar
                    />
                    <Button
                      type="submit" // 👈 El tipo "submit" disparará el onSubmit del <form>
                      variant="contained"
                      color="warning"
                      sx={{
                        mt: 3,
                        fontWeight: "bold",
                        fontSize: 16,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                      }}
                      startIcon={<Icon>send</Icon>}
                      fullWidth
                      disabled={isSubmitting} // 👈 Deshabilitado al enviar
                    >
                      {/* 👈 Cambia el texto del botón al enviar */}
                      {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
      {/* --- Añadimos los snackbars al final del componente --- */}
      {renderSuccessSB}
      {renderErrorSB}
    </MDBox>
  );
}
export default ContactSection;
