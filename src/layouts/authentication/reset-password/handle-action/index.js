/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MDBox from "components/MDBox";
import { FullScreenLoader } from "components/FullScreenLoader";

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

    if (mode === "resetPassword" && oobCode) {
      let redirectUrl;

      if (continueUrl && continueUrl.startsWith("http")) {
        // Si el continueUrl apunta a localhost pero estamos en producción, reemplazarlo
        if (continueUrl.includes("localhost") && window.location.origin.includes("goaltime.site")) {
          redirectUrl = continueUrl.replace(/http:\/\/localhost:\d+/, "https://www.goaltime.site");
          redirectUrl = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}oobCode=${oobCode}`;
        } else if (continueUrl.includes("localhost") && window.location.hostname === "localhost") {
          // Si estamos en localhost y el continueUrl también es localhost, usarlo tal cual
          redirectUrl = `${continueUrl}${continueUrl.includes("?") ? "&" : "?"}oobCode=${oobCode}`;
        } else {
          // Si el continueUrl no tiene www pero estamos en goaltime.site, agregarlo
          let finalUrl = continueUrl;
          if (continueUrl.includes("goaltime.site") && !continueUrl.includes("www.")) {
            finalUrl = continueUrl.replace("https://goaltime.site", "https://www.goaltime.site");
          }
          redirectUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}oobCode=${oobCode}`;
        }
      } else {
        // Construir la URL de confirmación con el dominio actual (forzar www en producción)
        if (
          window.location.hostname.includes("goaltime.site") &&
          !window.location.hostname.includes("www.")
        ) {
          redirectUrl = `https://www.goaltime.site/authentication/reset-password/confirm?oobCode=${oobCode}`;
        } else {
          redirectUrl = `${window.location.origin}/authentication/reset-password/confirm?oobCode=${oobCode}`;
        }
      }

      console.log("Firebase Action Handler - Redirigiendo a:", redirectUrl);
      window.location.href = redirectUrl;
    } else {
      // Si no hay oobCode o mode, redirigir a la página de inicio
      console.log(
        "Firebase Action Handler - No se encontró oobCode o mode válido, redirigiendo a inicio"
      );
      window.location.href = window.location.origin;
    }
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
        <p>Procesando enlace de restablecimiento...</p>
      </MDBox>
    </MDBox>
  );
}

export default HandleFirebaseAction;
