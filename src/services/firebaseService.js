// src/services/firebaseService.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYNTJFFdA7pPR3WGJv0mUTc328FRZ3gg8",
  authDomain: "goaltime-68101.firebaseapp.com",
  projectId: "goaltime-68101",
  storageBucket: "goaltime-68101.appspot.com",
  messagingSenderId: "208497272561",
  appId: "1:208497272561:web:38bc4f42784da077dbeb50",
  measurementId: "G-66L288MXFS",
};

// --- INICIALIZACIÓN SIMPLE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// --- FIN DE LA INICIALIZACIÓN ---

// 👇 FUNCIÓN registerUser SIMPLIFICADA
// Ya no acepta 'navigate' ni 'setIsActionLoading'
export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userProfile = {
    uid: user.uid,
    name,
    email,
    role: "cliente",
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", user.uid), userProfile);
  return userProfile; // Devuelve el perfil
};

// 👇 FUNCIÓN loginUser SIMPLIFICADA
// Ya no acepta 'navigate' ni 'setIsActionLoading'
export const loginUser = async (email, password, rememberMe) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data(); // Devuelve el perfil
  }
  // Si no hay perfil, devuelve uno básico.
  return { uid: user.uid, email: user.email, name: user.email, role: "cliente" };
};

// --- EL RESTO DE FUNCIONES YA ESTÁN CORRECTAS ---

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      role: "cliente",
      createdAt: serverTimestamp(),
    });
  }
  const finalProfileSnap = await getDoc(userDocRef);
  return finalProfileSnap.data();
};

// 👇 FUNCIÓN PARA ENVIAR EMAIL DE RESTABLECIMIENTO DE CONTRASEÑA
export const sendPasswordReset = async (email) => {
  try {
    // Firebase redirigirá a esta URL con el parámetro oobCode
    // La URL debe estar autorizada en Firebase Console > Authentication > Settings > Authorized domains
    const continueUrl = `${window.location.origin}/authentication/reset-password/confirm`;

    console.log("Enviando email de restablecimiento de contraseña:");
    console.log("- Email:", email);
    console.log("- Continue URL:", continueUrl);
    console.log("- Origin:", window.location.origin);
    console.log("- Hostname:", window.location.hostname);

    await sendPasswordResetEmail(auth, email, {
      url: continueUrl,
      handleCodeInApp: false, // Firebase maneja la redirección y pasa el oobCode como parámetro
    });

    console.log("Email de restablecimiento enviado exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error al enviar email de restablecimiento:", error);
    console.error("- Error code:", error.code);
    console.error("- Error message:", error.message);
    console.error("- Error details:", error);
    throw error;
  }
};

// 👇 FUNCIÓN PARA CONFIRMAR EL RESTABLECIMIENTO DE CONTRASEÑA
export const resetPassword = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error;
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export const callCreateUserRequest = async (userData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay un usuario autenticado.");
    }
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/createUser";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a createUser (onRequest):", error);
    throw new Error(error.message || "Error al conectar con la función.");
  }
};

export const callCheckAuthContextRequest = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay un usuario autenticado.");
    }
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/checkAuthContext";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a checkAuthContext (onRequest):", error);
    throw new Error(error.message || "Error al verificar contexto (onRequest).");
  }
};

export const callToggleUserStatusRequest = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/toggleUserStatus";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }), // Envía el ID del usuario a modificar
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a toggleUserStatus:", error);
    throw new Error(error.message || "Error al cambiar estado del usuario.");
  }
};

export const callSetUserRoleRequest = async (userId, newRole) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/setUserRole";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, newRole }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error detallado al llamar a setUserRole:", error);
    throw new Error(error.message || "Error al cambiar rol del usuario.");
  }
};

// 👇 FUNCIONES PARA CANCHAS

// Crear una nueva cancha (asociado)
export const createField = async (fieldData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const fieldDoc = {
      ...fieldData,
      ownerId: user.uid,
      status: "pending", // Todas las canchas empiezan como pendientes
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "canchas"), fieldDoc);
    return { id: docRef.id, ...fieldDoc };
  } catch (error) {
    console.error("Error al crear cancha:", error);
    throw new Error(error.message || "Error al crear la cancha.");
  }
};

// Actualizar una cancha (asociado)
export const updateField = async (fieldId, fieldData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const fieldRef = doc(db, "canchas", fieldId);
    const fieldSnap = await getDoc(fieldRef);

    if (!fieldSnap.exists()) {
      throw new Error("La cancha no existe.");
    }

    const field = fieldSnap.data();
    // Solo el dueño puede editar su cancha
    if (field.ownerId !== user.uid) {
      throw new Error("No tienes permiso para editar esta cancha.");
    }

    // Si la cancha estaba aprobada, vuelve a pendiente al editar
    const updatedData = {
      ...fieldData,
      status: field.status === "approved" ? "pending" : field.status,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(fieldRef, updatedData);
    return { id: fieldId, ...updatedData };
  } catch (error) {
    console.error("Error al actualizar cancha:", error);
    throw new Error(error.message || "Error al actualizar la cancha.");
  }
};

// Actualizar una cancha (admin - puede editar cualquier cancha y cambiar estado)
export const updateFieldAsAdmin = async (fieldId, fieldData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const fieldRef = doc(db, "canchas", fieldId);
    const fieldSnap = await getDoc(fieldRef);

    if (!fieldSnap.exists()) {
      throw new Error("La cancha no existe.");
    }

    // El admin puede actualizar cualquier campo, incluyendo el estado
    const updatedData = {
      ...fieldData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(fieldRef, updatedData);
    return { id: fieldId, ...updatedData };
  } catch (error) {
    console.error("Error al actualizar cancha como admin:", error);
    throw new Error(error.message || "Error al actualizar la cancha.");
  }
};

// Deshabilitar o habilitar una cancha (asociado) - Cloud Function
export const toggleFieldStatus = async (fieldId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/toggleFieldStatus";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fieldId }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error al cambiar estado de cancha:", error);
    throw new Error(error.message || "Error al cambiar el estado de la cancha.");
  }
};

// Aprobar o rechazar cancha (admin) - Cloud Function
export const callApproveFieldRequest = async (fieldId, action) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/approveField";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fieldId, action }), // action: "approve" o "reject"
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error("Error al aprobar/rechazar cancha:", error);
    throw new Error(error.message || "Error al procesar la solicitud.");
  }
};

// 👇 FUNCIONES PARA RESERVAS

// Crear una reserva (cliente)
export const createReservation = async (reservationData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const reservationDoc = {
      ...reservationData,
      clientId: user.uid,
      status: "pending", // Las reservas empiezan como pendientes
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reservations"), reservationDoc);
    return { id: docRef.id, ...reservationDoc };
  } catch (error) {
    console.error("Error al crear reserva:", error);
    throw new Error(error.message || "Error al crear la reserva.");
  }
};

// 👇 FUNCIONES PARA NOTIFICACIONES

// Crear una notificación
export const createNotification = async (notificationData) => {
  try {
    const notificationDoc = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "notifications"), notificationDoc);
    return { id: docRef.id, ...notificationDoc };
  } catch (error) {
    console.error("Error al crear notificación:", error);
    throw new Error(error.message || "Error al crear la notificación.");
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    throw new Error(error.message || "Error al actualizar la notificación.");
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    // Obtener todas las notificaciones no leídas del usuario
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const notificationsSnapshot = await getDocs(notificationsQuery);
    const updatePromises = notificationsSnapshot.docs.map((docSnap) =>
      updateDoc(doc(db, "notifications", docSnap.id), {
        read: true,
        readAt: serverTimestamp(),
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error al marcar todas las notificaciones como leídas:", error);
    throw new Error(error.message || "Error al actualizar las notificaciones.");
  }
};

// Obtener notificaciones en tiempo real (hook helper)
export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return () => {};

  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    },
    (error) => {
      console.error("Error al obtener notificaciones:", error);
      callback([]);
    }
  );
};

// Crear notificación cuando se aprueba una cancha
export const notifyFieldApproved = async (fieldId, fieldName, ownerId) => {
  try {
    await createNotification({
      userId: ownerId,
      type: "field_approved",
      title: "Cancha Aprobada",
      message: `Tu cancha "${fieldName}" ha sido aprobada y ahora está visible para los clientes.`,
      relatedId: fieldId,
      actionUrl: "/associate/fields",
      icon: "check_circle",
      color: "success",
    });
  } catch (error) {
    console.error("Error al crear notificación de aprobación:", error);
  }
};

// Crear notificación cuando se rechaza una cancha
export const notifyFieldRejected = async (fieldId, fieldName, ownerId) => {
  try {
    await createNotification({
      userId: ownerId,
      type: "field_rejected",
      title: "Cancha Rechazada",
      message: `Tu cancha "${fieldName}" ha sido rechazada. Por favor, revisa la información y contacta al administrador si tienes dudas.`,
      relatedId: fieldId,
      actionUrl: "/associate/fields",
      icon: "cancel",
      color: "error",
    });
  } catch (error) {
    console.error("Error al crear notificación de rechazo:", error);
  }
};

// Crear notificación cuando se crea una reserva (para cliente)
export const notifyReservationCreated = async (reservationId, fieldName, clientId) => {
  try {
    await createNotification({
      userId: clientId,
      type: "reservation_created",
      title: "Reserva Confirmada",
      message: `Tu reserva para "${fieldName}" ha sido creada exitosamente. El dueño de la cancha la revisará pronto.`,
      relatedId: reservationId,
      actionUrl: "/profile",
      icon: "event_available",
      color: "info",
    });
  } catch (error) {
    console.error("Error al crear notificación de reserva:", error);
  }
};

// Crear notificación cuando se crea una reserva (para asociado)
export const notifyReservationReceived = async (reservationId, fieldName, ownerId, clientName) => {
  try {
    await createNotification({
      userId: ownerId,
      type: "reservation_received",
      title: "Nueva Reserva",
      message: `Has recibido una nueva reserva para "${fieldName}" de ${clientName}.`,
      relatedId: reservationId,
      actionUrl: "/associate/reservations",
      icon: "notifications_active",
      color: "info",
    });
  } catch (error) {
    console.error("Error al crear notificación de reserva recibida:", error);
  }
};

// Crear notificación cuando se confirma una reserva (para cliente)
export const notifyReservationConfirmed = async (reservationId, fieldName, clientId) => {
  try {
    await createNotification({
      userId: clientId,
      type: "reservation_confirmed",
      title: "Reserva Confirmada",
      message: `Tu reserva para "${fieldName}" ha sido confirmada por el dueño de la cancha.`,
      relatedId: reservationId,
      actionUrl: "/profile",
      icon: "check_circle",
      color: "success",
    });
  } catch (error) {
    console.error("Error al crear notificación de reserva confirmada:", error);
  }
};

// Crear notificación cuando se cancela una reserva (para cliente)
export const notifyReservationCancelled = async (reservationId, fieldName, clientId) => {
  try {
    await createNotification({
      userId: clientId,
      type: "reservation_cancelled",
      title: "Reserva Cancelada",
      message: `Tu reserva para "${fieldName}" ha sido cancelada por el dueño de la cancha.`,
      relatedId: reservationId,
      actionUrl: "/profile",
      icon: "cancel",
      color: "error",
    });
  } catch (error) {
    console.error("Error al crear notificación de reserva cancelada:", error);
  }
};

export { auth, db };
