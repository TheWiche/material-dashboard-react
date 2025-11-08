// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// 👇 Importa el middleware de CORS
const cors = require("cors")({ origin: true });

admin.initializeApp();

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
          error: "Forbidden: Only the super administrator can change roles of other administrators.",
        });
      }

      // Si el usuario objetivo es admin y se intenta cambiar a otro rol, solo el super admin puede hacerlo
      if (targetUserRole === "admin" && newRole !== "admin" && decodedToken.uid !== SUPER_ADMIN_ID) {
        return response.status(403).send({
          error: "Forbidden: Only the super administrator can remove admin role from other administrators.",
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
      return response
        .status(400)
        .send({ error: "Bad Request: fieldId and action are required." });
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

    // Verificar que sea asociado o admin
    if (decodedToken.role !== "asociado" && decodedToken.role !== "admin") {
      return response
        .status(403)
        .send({ error: "Forbidden: Associate or admin role required." });
    }

    const { fieldId } = request.body;
    if (!fieldId) {
      return response.status(400).send({ error: "Bad Request: fieldId is required." });
    }

    try {
      const fieldRef = admin.firestore().collection("canchas").doc(fieldId);
      const fieldDoc = await fieldRef.get();

      if (!fieldDoc.exists) {
        return response.status(404).send({ error: "Not Found: Field does not exist." });
      }

      const field = fieldDoc.data();

      // Si no es admin, verificar que sea el dueño de la cancha
      if (decodedToken.role !== "admin" && field.ownerId !== decodedToken.uid) {
        return response
          .status(403)
          .send({ error: "Forbidden: You can only modify your own fields." });
      }

      // Cambiar el estado: si está disabled, cambiar a pending; si no, cambiar a disabled
      const newStatus = field.status === "disabled" ? "pending" : "disabled";

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
