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
    // ... (Verificaciones de método POST, token, y rol de admin, igual que en toggleUserStatus) ...
    let decodedToken; /* ... */
    if (!idToken)
      /* ... */
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (e) {
        /* ... */
      }
    if (decodedToken.role !== "admin") {
      /* ... */
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

      // Opcional: Forzar el refresco del token del usuario afectado (requiere más lógica)

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
