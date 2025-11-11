// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// 👇 Importa el middleware de CORS
const cors = require("cors")({ origin: true });

admin.initializeApp();

// 👇 Configuración de SendGrid (hardcodeada para evitar problemas con secrets)
const SENDGRID_API_KEY = "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";
const SENDGRID_FROM_EMAIL = "noreply@goaltime.site";

// 👇 Cambiamos de onCall a onRequest
exports.createUser = functions.https.onRequest(async (request, response) => {
  // 1. Aplica CORS para permitir llamadas desde tu app React
  cors(request, response, async () => {
    // 2. Verifica que sea un método POST
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    // 3. Verifica manualmente el token de autenticación
    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return response.status(401).send({ error: "Unauthorized: No token provided." });
    }

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      return response.status(401).send({ error: "Unauthorized: Invalid token." });
    }

    // 4. Verifica el rol de admin desde el token decodificado
    if (decodedToken.role !== "admin") {
      return response.status(403).send({ error: "Forbidden: Admin role required." });
    }

    // 5. Obtiene los datos del cuerpo de la solicitud
    const { name, email, password, role } = request.body;
    if (!email || !password || !name || !role) {
      return response.status(400).send({ error: "Bad Request: Missing required fields." });
    }

    // 6. Ejecuta la lógica de creación (dentro de un try/catch)
    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

      await admin.firestore().collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        name: name,
        email: email,
        role: role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 7. Envía una respuesta exitosa
      return response
        .status(200)
        .send({ success: true, message: `Usuario ${name} creado con éxito.` });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-exists") {
        return response.status(409).send({ error: "Conflict: Email already exists." });
      }
      return response.status(500).send({ error: "Internal Server Error: Failed to create user." });
    }
  });
});

// 👇 Mantenemos la función de prueba (si aún la necesitas)
exports.checkAuthContext = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).send({ error: "No token" });
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("checkAuthContext (onRequest): Token recibido:", decodedToken);
      return response.status(200).send({ auth: decodedToken });
    } catch (error) {
      console.error("checkAuthContext (onRequest): Error verificando:", error);
      return response.status(401).send({ error: "Invalid token" });
    }
  });
});

exports.toggleUserStatus = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).send({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).send({ error: "Unauthorized: Invalid token." });
    }

    if (decodedToken.role !== "admin") {
      return response.status(403).send({ error: "Forbidden: Admin role required." });
    }

    const { userId } = request.body;
    if (!userId) {
      return response.status(400).send({ error: "Bad Request: userId is required." });
    }

    // Evita que un admin se deshabilite a sí mismo (importante!)
    if (decodedToken.uid === userId) {
      return response.status(400).send({ error: "Bad Request: Admin cannot disable self." });
    }

    try {
      const userRecord = await admin.auth().getUser(userId);
      const currentStatus = userRecord.disabled;
      const newStatus = !currentStatus; // Invierte el estado

      // Actualiza en Firebase Authentication
      await admin.auth().updateUser(userId, { disabled: newStatus });

      // Actualiza en Firestore (si tienes el campo 'status')
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          status: newStatus ? "disabled" : "active", // O los nombres que uses
        });

      const actionText = newStatus ? "deshabilitado" : "habilitado";
      return response.status(200).send({
        success: true,
        message: `Usuario ${userRecord.displayName || userId} ${actionText} correctamente.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      return response
        .status(500)
        .send({ error: "Internal Server Error: Failed to update user status." });
    }
  });
});

exports.setUserRole = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).send({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).send({ error: "Unauthorized: Invalid token." });
    }

    if (decodedToken.role !== "admin") {
      return response.status(403).send({ error: "Forbidden: Admin role required." });
    }

    const { userId, newRole } = request.body;
    if (!userId || !newRole) {
      return response.status(400).send({ error: "Bad Request: userId and newRole are required." });
    }

    // Validar que el rol sea uno permitido
    const allowedRoles = ["admin", "asociado", "cliente"];
    if (!allowedRoles.includes(newRole)) {
      return response.status(400).send({ error: "Bad Request: Invalid role specified." });
    }

    // ID del super administrador (único que puede cambiar roles de otros admins)
    const SUPER_ADMIN_ID = "roFWFs8Iq5MCzJ9tyn1zk0u5GnY2";

    // Verificar si el usuario objetivo es un administrador
    try {
      const targetUserDoc = await admin.firestore().collection("users").doc(userId).get();
      const targetUserRole = targetUserDoc.exists ? targetUserDoc.data().role : null;

      // Si el usuario objetivo es admin, solo el super admin puede cambiar su rol
      if (targetUserRole === "admin" && decodedToken.uid !== SUPER_ADMIN_ID) {
        return response.status(403).send({
          error:
            "Forbidden: Only the super administrator can change roles of other administrators.",
        });
      }

      // Si el usuario objetivo es admin y se intenta cambiar a otro rol, solo el super admin puede hacerlo
      if (
        targetUserRole === "admin" &&
        newRole !== "admin" &&
        decodedToken.uid !== SUPER_ADMIN_ID
      ) {
        return response.status(403).send({
          error:
            "Forbidden: Only the super administrator can remove admin role from other administrators.",
        });
      }
    } catch (error) {
      console.error("Error checking target user role:", error);
      // Continuar con la validación si hay error al obtener el documento
    }

    // Evita que un admin se quite su propio rol (importante!)
    if (decodedToken.uid === userId && newRole !== "admin") {
      return response
        .status(400)
        .send({ error: "Bad Request: Admin cannot remove own admin role." });
    }

    try {
      // 1. Establece el Custom Claim en Auth
      await admin.auth().setCustomUserClaims(userId, { role: newRole });

      // 2. Actualiza el rol en Firestore
      await admin.firestore().collection("users").doc(userId).update({
        role: newRole,
      });

      return response
        .status(200)
        .send({ success: true, message: `Rol de ${userId} actualizado a ${newRole}.` });
    } catch (error) {
      console.error("Error setting user role:", error);
      return response
        .status(500)
        .send({ error: "Internal Server Error: Failed to set user role." });
    }
  });
});

// 👇 Función para aprobar o rechazar canchas (solo admin)
exports.approveField = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).send({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).send({ error: "Unauthorized: Invalid token." });
    }

    if (decodedToken.role !== "admin") {
      return response.status(403).send({ error: "Forbidden: Admin role required." });
    }

    const { fieldId, action } = request.body;
    if (!fieldId || !action) {
      return response.status(400).send({ error: "Bad Request: fieldId and action are required." });
    }

    if (action !== "approve" && action !== "reject") {
      return response
        .status(400)
        .send({ error: "Bad Request: action must be 'approve' or 'reject'." });
    }

    try {
      const fieldRef = admin.firestore().collection("canchas").doc(fieldId);
      const fieldDoc = await fieldRef.get();

      if (!fieldDoc.exists) {
        return response.status(404).send({ error: "Not Found: Field does not exist." });
      }

      const newStatus = action === "approve" ? "approved" : "rejected";
      const fieldData = fieldDoc.data();

      await fieldRef.update({
        status: newStatus,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: decodedToken.uid,
      });

      // Crear notificación para el dueño de la cancha
      try {
        const notificationData = {
          userId: fieldData.ownerId,
          type: action === "approve" ? "field_approved" : "field_rejected",
          title: action === "approve" ? "Cancha Aprobada" : "Cancha Rechazada",
          message:
            action === "approve"
              ? `Tu cancha "${fieldData.name}" ha sido aprobada y ahora está visible para los clientes.`
              : `Tu cancha "${fieldData.name}" ha sido rechazada. Por favor, revisa la información y contacta al administrador si tienes dudas.`,
          relatedId: fieldId,
          actionUrl: "/associate/fields",
          icon: action === "approve" ? "check_circle" : "cancel",
          color: action === "approve" ? "success" : "error",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection("notifications").add(notificationData);
      } catch (notificationError) {
        console.error("Error al crear notificación:", notificationError);
        // No fallar la operación principal si la notificación falla
      }

      const actionText = action === "approve" ? "aprobada" : "rechazada";
      return response.status(200).send({
        success: true,
        message: `Cancha ${actionText} correctamente.`,
      });
    } catch (error) {
      console.error("Error approving/rejecting field:", error);
      return response
        .status(500)
        .send({ error: "Internal Server Error: Failed to process field." });
    }
  });
});

// 👇 Función para deshabilitar o habilitar canchas (asociado - solo su propia cancha)
exports.toggleFieldStatus = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).send({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).send({ error: "Unauthorized: Invalid token." });
    }

    const { fieldId } = request.body;
    if (!fieldId) {
      return response.status(400).send({ error: "Bad Request: fieldId is required." });
    }

    try {
      // Obtener el rol del usuario desde Firestore
      const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
      if (!userDoc.exists) {
        return response.status(403).send({ error: "Forbidden: User not found." });
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Verificar que sea asociado o admin
      if (userRole !== "asociado" && userRole !== "admin") {
        return response.status(403).send({ error: "Forbidden: Associate or admin role required." });
      }

      const fieldRef = admin.firestore().collection("canchas").doc(fieldId);
      const fieldDoc = await fieldRef.get();

      if (!fieldDoc.exists) {
        return response.status(404).send({ error: "Not Found: Field does not exist." });
      }

      const field = fieldDoc.data();

      // Si no es admin, verificar que sea el dueño de la cancha
      if (userRole !== "admin" && field.ownerId !== decodedToken.uid) {
        return response
          .status(403)
          .send({ error: "Forbidden: You can only modify your own fields." });
      }

      // Cambiar el estado: si está disabled, cambiar a approved; si no, cambiar a disabled
      const newStatus = field.status === "disabled" ? "approved" : "disabled";

      // Si se intenta deshabilitar, verificar que no tenga reservas confirmadas futuras
      if (newStatus === "disabled") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString().split("T")[0]; // YYYY-MM-DD

        const futureReservationsQuery = admin
          .firestore()
          .collection("reservations")
          .where("fieldId", "==", fieldId)
          .where("status", "==", "confirmed")
          .where("date", ">=", todayISO);

        const futureReservationsSnapshot = await futureReservationsQuery.get();

        if (!futureReservationsSnapshot.empty) {
          const count = futureReservationsSnapshot.size;
          return response.status(400).send({
            error: `No se puede deshabilitar la cancha porque tiene ${count} reserva(s) confirmada(s) en el futuro. Por favor, cancela o completa estas reservas antes de deshabilitar la cancha.`,
          });
        }
      }

      await fieldRef.update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const actionText = newStatus === "disabled" ? "deshabilitada" : "habilitada";
      return response.status(200).send({
        success: true,
        message: `Cancha ${actionText} correctamente.`,
      });
    } catch (error) {
      console.error("Error toggling field status:", error);
      return response
        .status(500)
        .send({ error: "Internal Server Error: Failed to update field status." });
    }
  });
});

// 👇 Función para enviar ticket por correo electrónico
exports.sendTicketByEmail = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).json({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    const {
      email: providedEmail,
      reservationId,
      reservationData,
      userProfile,
      ticketHTML,
    } = request.body;
    if (!reservationId || !ticketHTML) {
      return response
        .status(400)
        .json({ error: "Bad Request: reservationId and ticketHTML are required." });
    }

    // Obtener el email del cliente: usar el proporcionado si está disponible, sino obtenerlo desde Firestore
    let clientEmail = providedEmail || "";
    let finalUserName = userProfile?.name || "Usuario";

    // Si no se proporcionó el email, intentar obtenerlo desde el token o desde Firestore
    if (!clientEmail) {
      // Primero intentar desde el token
      clientEmail = decodedToken.email || "";

      // Si no está en el token, obtenerlo desde Firestore usando el UID del token
      if (!clientEmail && decodedToken.uid) {
        try {
          const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            clientEmail = userData.email || "";
            finalUserName = userData.name || finalUserName;
          }
        } catch (error) {
          console.error("Error al obtener email del usuario desde Firestore:", error);
        }
      }
    }

    // Si aún no tenemos el email, intentar obtenerlo desde la reserva
    if (!clientEmail && reservationData?.clientId) {
      try {
        const clientUserDoc = await admin
          .firestore()
          .collection("users")
          .doc(reservationData.clientId)
          .get();
        if (clientUserDoc.exists) {
          const clientUserData = clientUserDoc.data();
          clientEmail = clientUserData.email || "";
          finalUserName = clientUserData.name || finalUserName;
        }
      } catch (error) {
        console.error("Error al obtener email del cliente desde la reserva:", error);
      }
    }

    // Si aún no tenemos el email, usar el que viene en reservationData si está disponible
    if (!clientEmail && reservationData?.clientEmail) {
      clientEmail = reservationData.clientEmail;
    }

    if (!clientEmail) {
      return response.status(400).json({
        error:
          "No se pudo obtener el correo electrónico del usuario. Por favor, verifica que tu perfil tenga un email válido.",
      });
    }

    // Verificar que el usuario esté enviando el ticket a su propio correo
    // Priorizar verificación por UID (más confiable), luego por email
    let isAuthorized = false;

    // Verificar por UID (más confiable)
    if (decodedToken.uid && reservationData?.clientId) {
      isAuthorized = decodedToken.uid === reservationData.clientId;
    }

    // Si no se pudo verificar por UID, verificar por email
    if (!isAuthorized && decodedToken.email) {
      isAuthorized = decodedToken.email.toLowerCase() === clientEmail.toLowerCase();
    }

    // Si aún no está autorizado y se proporcionó un email, verificar que coincida con el del token
    if (!isAuthorized && providedEmail && decodedToken.email) {
      isAuthorized = providedEmail.toLowerCase() === decodedToken.email.toLowerCase();
    }

    if (!isAuthorized) {
      return response.status(403).json({
        error: "Forbidden: You can only send tickets to your own email.",
      });
    }

    // Definir fromEmail fuera del try para que esté disponible en el catch
    let fromEmail = SENDGRID_FROM_EMAIL;

    if (!SENDGRID_API_KEY) {
      return response.status(500).json({
        error: "SendGrid API Key not configured.",
      });
    }

    try {
      // Usar SendGrid SDK oficial (más simple y confiable)
      const sgMail = require("@sendgrid/mail");

      // Configurar la API Key de SendGrid
      sgMail.setApiKey(SENDGRID_API_KEY);

      console.log("Configuración de SendGrid lista");
      console.log("Correo remitente:", fromEmail);
      console.log("Correo destinatario:", clientEmail);

      // Preparar el mensaje de email
      const msg = {
        to: clientEmail,
        from: {
          email: fromEmail, // Debe estar verificado en SendGrid
          name: "GoalTime",
        },
        subject: `Ticket de Reserva - ${reservationData?.fieldName || "Cancha"}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1976d2; margin: 0;">GoalTime</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Ticket de Reserva Deportiva</p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;">Hola <strong>${finalUserName}</strong>,</p>
                <p style="margin: 0 0 15px 0;">Adjunto encontrarás el ticket de tu reserva.</p>
                <p style="margin: 0;">Gracias por usar GoalTime.</p>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background-color: white; border: 2px solid #e0e0e0; border-radius: 8px;">
                ${ticketHTML}
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
                <p style="margin: 5px 0;">© ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.</p>
                <p style="margin: 5px 0;">Este ticket es válido para la fecha y hora indicadas.</p>
              </div>
            </body>
          </html>
        `,
        text: `
          Ticket de Reserva GoalTime
          
          Hola ${finalUserName},
          
          Adjunto encontrarás el ticket de tu reserva.
          
          Información de la Reserva:
          - Número: #${reservationId?.substring(0, 8).toUpperCase() || "N/A"}
          - Cancha: ${reservationData?.fieldName || "N/A"}
          - Fecha: ${reservationData?.date || "N/A"}
          - Hora: ${reservationData?.startTime || "N/A"} - ${reservationData?.endTime || "N/A"}
          - Total: $${(reservationData?.totalPrice || 0).toLocaleString()}
          
          Gracias por usar GoalTime.
          
          © ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.
        `,
      };

      // Enviar el email usando SendGrid
      console.log("Intentando enviar email con SendGrid...");
      await sgMail.send(msg);

      console.log("Email enviado exitosamente con SendGrid:", {
        to: clientEmail,
        reservationId,
        fromEmail: fromEmail,
      });

      return response.status(200).json({
        success: true,
        message: "Ticket enviado exitosamente a tu correo electrónico.",
      });
    } catch (error) {
      console.error("Error sending ticket email:", error);
      console.error("Error stack:", error.stack);
      console.error("Error response:", error.response?.body || "No response body");
      console.error("Error message:", error.message);

      // Mensaje de error más descriptivo
      let errorMessage = "Error al enviar el ticket por correo.";
      let errorDetails = error.message;

      if (error.response?.body?.errors) {
        const sendGridErrors = error.response.body.errors;
        errorDetails = sendGridErrors.map((e) => e.message || e).join(", ");

        // Mensajes específicos de SendGrid
        if (
          sendGridErrors.some(
            (e) => (e.message || "").includes("verified") || (e.message || "").includes("sender")
          )
        ) {
          errorMessage =
            "El remitente no está verificado en SendGrid. Por favor, verifica el correo noreply@goaltime.site en SendGrid → Settings → Sender Authentication.";
        } else if (
          sendGridErrors.some(
            (e) =>
              (e.message || "").includes("API key") || (e.message || "").includes("Unauthorized")
          )
        ) {
          errorMessage =
            "La API Key de SendGrid no es válida o no tiene permisos. Verifica la configuración.";
        } else if (sendGridErrors.some((e) => (e.message || "").includes("sender"))) {
          errorMessage =
            "El remitente no está verificado. Asegúrate de que noreply@goaltime.site esté verificado en SendGrid.";
        }
      } else if (error.message && error.message.includes("Cannot find module")) {
        errorMessage =
          "El módulo @sendgrid/mail no está instalado. Ejecuta: cd functions && npm install @sendgrid/mail";
        errorDetails = error.message;
      } else if (error.message && error.message.includes("functions.config()")) {
        errorMessage =
          "Error de configuración: Firebase Functions v2 requiere variables de entorno. Ejecuta: firebase functions:secrets:set SENDGRID_API_KEY";
        errorDetails = error.message;
      }

      // Asegurar que siempre devolvemos JSON
      return response.status(500).json({
        error: errorMessage,
        details: errorDetails,
      });
    }
  });
});

// 👇 Función para enviar notificación por correo de cambio de estado de reserva
exports.sendReservationStatusChangeEmail = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Method Not Allowed" });
    }

    let decodedToken;
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return response.status(401).json({ error: "Unauthorized: No token." });
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return response.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    const {
      reservationId,
      newStatus,
      previousStatus,
      reason,
      clientName,
      clientEmail: providedEmail,
    } = request.body;
    if (!reservationId || !newStatus) {
      return response
        .status(400)
        .json({ error: "Bad Request: reservationId and newStatus are required." });
    }

    // Verificar que el usuario tenga permisos (asociado o admin)
    const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return response.status(403).json({ error: "Forbidden: User not found." });
    }

    const userData = userDoc.data();
    if (userData.role !== "asociado" && userData.role !== "admin") {
      return response.status(403).json({ error: "Forbidden: Insufficient permissions." });
    }

    try {
      // Obtener la reserva desde Firestore
      const reservationRef = admin.firestore().collection("reservations").doc(reservationId);
      const reservationDoc = await reservationRef.get();

      if (!reservationDoc.exists) {
        return response.status(404).json({ error: "Reservation not found." });
      }

      const reservationData = reservationDoc.data();

      // Obtener el email del cliente: usar el proporcionado si está disponible, sino obtenerlo desde Firestore
      let clientEmail = providedEmail || "";
      let finalClientName = clientName || "Cliente";

      // Si no se proporcionó el email, intentar obtenerlo desde la reserva
      if (!clientEmail && reservationData.clientId) {
        try {
          const clientUserDoc = await admin
            .firestore()
            .collection("users")
            .doc(reservationData.clientId)
            .get();
          if (clientUserDoc.exists) {
            const clientUserData = clientUserDoc.data();
            clientEmail = clientUserData.email || "";
            finalClientName = clientUserData.name || finalClientName;
          }
        } catch (error) {
          console.error("Error al obtener email del cliente:", error);
        }
      }

      // Si aún no tenemos el email, usar el que viene en reservationData si está disponible
      if (!clientEmail && reservationData.clientEmail) {
        clientEmail = reservationData.clientEmail;
      }

      if (!clientEmail) {
        return response.status(400).json({
          error: "No se pudo obtener el correo electrónico del cliente de la reserva.",
        });
      }

      const sgMail = require("@sendgrid/mail");
      const sendGridApiKey = SENDGRID_API_KEY;

      if (!sendGridApiKey) {
        return response.status(500).json({
          error: "SendGrid API Key not configured.",
        });
      }

      sgMail.setApiKey(sendGridApiKey);
      const fromEmail = SENDGRID_FROM_EMAIL;

      // Mapear estados a texto en español
      const statusMap = {
        pending: "Pendiente",
        confirmed: "Confirmada",
        cancelled: "Cancelada",
        completed: "Completada",
      };

      const statusText = statusMap[newStatus] || newStatus;
      const previousStatusText = previousStatus
        ? statusMap[previousStatus] || previousStatus
        : reservationData.status || "Pendiente";

      // Generar HTML del correo
      const statusColor =
        {
          pending: "#FF9800",
          confirmed: "#4CAF50",
          cancelled: "#F44336",
          completed: "#2196F3",
        }[newStatus] || "#757575";

      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">GoalTime</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Notificación de Cambio de Estado</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;">Hola <strong>${finalClientName}</strong>,</p>
              <p style="margin: 0 0 15px 0;">Te informamos que el estado de tu reserva ha sido actualizado.</p>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: white; border: 2px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">Detalles de la Reserva</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%;">Cancha:</td>
                  <td style="padding: 8px 0; color: #333;">${
                    reservationData.fieldName || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Fecha:</td>
                  <td style="padding: 8px 0; color: #333;">${reservationData.date || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Hora:</td>
                  <td style="padding: 8px 0; color: #333;">${
                    reservationData.startTime || "N/A"
                  } - ${reservationData.endTime || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Estado Anterior:</td>
                  <td style="padding: 8px 0; color: #333;">${previousStatusText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Nuevo Estado:</td>
                  <td style="padding: 8px 0;">
                    <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.875rem;">
                      ${statusText}
                    </span>
                  </td>
                </tr>
                ${
                  reason
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; vertical-align: top;">Razón:</td>
                  <td style="padding: 8px 0; color: #333;">${reason}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Total:</td>
                  <td style="padding: 8px 0; color: #4CAF50; font-weight: bold;">$${(
                    reservationData.totalPrice || 0
                  ).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.</p>
              <p style="margin: 5px 0;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: clientEmail,
        from: {
          email: fromEmail,
          name: "GoalTime",
        },
        subject: `Cambio de Estado - Reserva ${reservationData.fieldName || "Cancha"}`,
        html: emailHTML,
        text: `
          Notificación de Cambio de Estado - GoalTime
          
          Hola ${finalClientName},
          
          Te informamos que el estado de tu reserva ha sido actualizado.
          
          Detalles de la Reserva:
          - Cancha: ${reservationData.fieldName || "N/A"}
          - Fecha: ${reservationData.date || "N/A"}
          - Hora: ${reservationData.startTime || "N/A"} - ${reservationData.endTime || "N/A"}
          - Estado Anterior: ${previousStatusText}
          - Nuevo Estado: ${statusText}
          ${reason ? `- Razón: ${reason}` : ""}
          - Total: $${(reservationData.totalPrice || 0).toLocaleString()}
          
          © ${new Date().getFullYear()} GoalTime. Todos los derechos reservados.
        `,
      };

      await sgMail.send(msg);

      console.log("Email de cambio de estado enviado exitosamente:", {
        to: clientEmail,
        reservationId,
        newStatus,
      });

      return response.status(200).json({
        success: true,
        message: "Notificación enviada exitosamente.",
      });
    } catch (error) {
      console.error("Error sending status change email:", error);
      console.error("Error details:", error.response?.body || error.message);

      let errorMessage = "Error al enviar la notificación por correo.";
      let errorDetails = error.message;

      if (error.response?.body?.errors) {
        const sendGridErrors = error.response.body.errors;
        errorDetails = sendGridErrors.map((e) => e.message || e).join(", ");
      }

      return response.status(500).json({
        error: errorMessage,
        details: errorDetails,
      });
    }
  });
});
