/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MDBox from "components/MDBox";
import { FullScreenLoader } from "components/FullScreenLoader";
import { verifyEmailWithCode } from "services/firebaseService";

/**
 * Componente para manejar la redirección de Firebase desde /__/auth/action
 * Firebase redirige aquí primero antes de ir al continueUrl
 */
function HandleFirebaseAction() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");
    const continueUrl = searchParams.get("continueUrl");

    console.log("Firebase Action Handler - oobCode:", oobCode);
    console.log("Firebase Action Handler - mode:", mode);
    console.log("Firebase Action Handler - continueUrl:", continueUrl);
    console.log("Firebase Action Handler - current origin:", window.location.origin);

    if (!oobCode || !mode) {
      console.log(
        "Firebase Action Handler - No se encontró oobCode o mode válido, redirigiendo a inicio"
      );
      window.location.href = window.location.origin;
      return;
    }

    // Manejar verificación de email
    if (mode === "verifyEmail" && oobCode) {
      console.log("Firebase Action Handler - Procesando verificación de email");

      // IMPORTANTE: Aplicar el código de verificación ANTES de redirigir
      verifyEmailWithCode(oobCode)
        .then(() => {
          console.log("Email verificado exitosamente");

          // Construir URL de redirección - usar continueUrl si existe, sino usar la página de verificación
          let redirectUrl;
          if (continueUrl && continueUrl.startsWith("http")) {
            try {
              redirectUrl = decodeURIComponent(continueUrl);
              // Normalizar URL si es necesario
              if (
                redirectUrl.includes("localhost") &&
                window.location.origin.includes("goaltime.site")
              ) {
                redirectUrl = redirectUrl.replace(
                  /http:\/\/localhost:\d+/,
                  "https://www.goaltime.site"
                );
              } else if (redirectUrl.includes("goaltime.site") && !redirectUrl.includes("www.")) {
                redirectUrl = redirectUrl.replace(
                  "https://goaltime.site",
                  "https://www.goaltime.site"
                );
              }
            } catch (e) {
              redirectUrl = continueUrl;
            }
          } else {
            // Construir URL de verificación basada en el dominio actual
            if (
              window.location.hostname.includes("goaltime.site") &&
              !window.location.hostname.includes("www.")
            ) {
              redirectUrl = `https://www.goaltime.site/authentication/verify-email`;
            } else {
              redirectUrl = `${window.location.origin}/authentication/verify-email`;
            }
          }

          console.log("Firebase Action Handler - Redirigiendo a:", redirectUrl);
          // Usar navigate con replace en lugar de window.location para mantener la sesión de React
          // Pero como estamos en un componente que no tiene acceso a navigate, usamos window.location
          // El problema es que esto causa una recarga completa. En su lugar, construimos la URL
          // y redirigimos, pero asegurándonos de que la sesión se mantenga.
          window.location.href = redirectUrl;
        })
        .catch((error) => {
          console.error("Error verificando email:", error);
          // Redirigir a la página de verificación para mostrar el error
          const redirectUrl = window.location.origin.includes("goaltime.site")
            ? `https://www.goaltime.site/authentication/verify-email`
            : `${window.location.origin}/authentication/verify-email`;
          window.location.replace(redirectUrl);
        });
      return;
    }

    // Manejar restablecimiento de contraseña
    if (mode === "resetPassword" && oobCode) {
      console.log("Firebase Action Handler - Procesando restablecimiento de contraseña");

      let redirectUrl;

      if (continueUrl && continueUrl.startsWith("http")) {
        try {
          // Decodificar continueUrl si está codificado
          let decodedUrl = continueUrl;
          try {
            decodedUrl = decodeURIComponent(continueUrl);
          } catch (e) {
            decodedUrl = continueUrl;
          }

          // Normalizar URL si es necesario
          if (
            decodedUrl.includes("localhost") &&
            window.location.origin.includes("goaltime.site")
          ) {
            decodedUrl = decodedUrl.replace(/http:\/\/localhost:\d+/, "https://www.goaltime.site");
          } else if (decodedUrl.includes("goaltime.site") && !decodedUrl.includes("www.")) {
            decodedUrl = decodedUrl.replace("https://goaltime.site", "https://www.goaltime.site");
          }

          // Agregar oobCode a la URL
          redirectUrl = `${decodedUrl}${
            decodedUrl.includes("?") ? "&" : "?"
          }oobCode=${encodeURIComponent(oobCode)}`;
        } catch (e) {
          // Si hay error, construir URL manualmente
          redirectUrl = window.location.origin.includes("goaltime.site")
            ? `https://www.goaltime.site/authentication/reset-password/confirm?oobCode=${encodeURIComponent(
                oobCode
              )}`
            : `${
                window.location.origin
              }/authentication/reset-password/confirm?oobCode=${encodeURIComponent(oobCode)}`;
        }
      } else {
        // Construir la URL de confirmación con el dominio actual
        if (
          window.location.hostname.includes("goaltime.site") &&
          !window.location.hostname.includes("www.")
        ) {
          redirectUrl = `https://www.goaltime.site/authentication/reset-password/confirm?oobCode=${encodeURIComponent(
            oobCode
          )}`;
        } else {
          redirectUrl = `${
            window.location.origin
          }/authentication/reset-password/confirm?oobCode=${encodeURIComponent(oobCode)}`;
        }
      }

      console.log("Firebase Action Handler - Redirigiendo a:", redirectUrl);
      // Usar replace para evitar problemas de historial
      window.location.replace(redirectUrl);
      return;
    }

    // Si el modo no es reconocido, redirigir a la página de inicio
    console.log("Firebase Action Handler - Modo no reconocido, redirigiendo a inicio");
    window.location.href = window.location.origin;
  }, [searchParams]);

  return (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
    >
      <FullScreenLoader />
      <MDBox mt={3}>
        <p>Procesando enlace de Firebase...</p>
      </MDBox>
    </MDBox>
  );
}

export default HandleFirebaseAction;
