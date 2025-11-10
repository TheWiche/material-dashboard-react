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
  FacebookAuthProvider,
  signInWithPopup,
  getIdToken,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
  onAuthStateChanged,
  reload,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

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
const storage = getStorage(app);

// Manejar errores de red de Firestore (bloqueadores de anuncios, etc.)
// Esto ayuda a que la app funcione incluso si hay extensiones bloqueando Firestore
if (typeof window !== "undefined") {
  // Intentar habilitar la red si está deshabilitada
  enableNetwork(db).catch(() => {
    // Ignorar errores silenciosamente - puede ser bloqueado por extensiones del navegador
    // No mostrar nada en consola para evitar spam
  });

  // Interceptar errores de red de Firestore globalmente
  const originalError = console.error;
  console.error = (...args) => {
    // Filtrar errores de Firestore bloqueados por cliente
    const errorString = args.join(" ");
    if (errorString.includes("ERR_BLOCKED_BY_CLIENT") && errorString.includes("firestore")) {
      return; // No mostrar estos errores
    }
    originalError.apply(console, args);
  };
}
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

  // Enviar email de verificación
  try {
    let continueUrl;

    // Determinar la URL correcta según el entorno (igual que en sendPasswordReset)
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      // Desarrollo: usar HTTP
      continueUrl = `${window.location.origin}/authentication/verify-email`;
    } else {
      // Producción: forzar HTTPS (Firebase requiere HTTPS para dominios de producción)
      // Usar el hostname tal cual (con o sin www) para que funcione con ambos
      // IMPORTANTE: Ambos dominios deben estar autorizados en Firebase Console
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      continueUrl = `https://www.${hostname}${port}/authentication/verify-email`;
    }

    console.log("Enviando email de verificación:");
    console.log("- Email:", user.email);
    console.log("- Continue URL:", continueUrl);
    console.log("- Origin:", window.location.origin);
    console.log("- Hostname:", window.location.hostname);

    await sendEmailVerification(user, {
      url: continueUrl,
      handleCodeInApp: false,
    });

    console.log("Email de verificación enviado exitosamente");
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    // No lanzamos el error para que el registro continúe
  }

  return userProfile; // Devuelve el perfil
};

// 👇 FUNCIÓN loginUser SIMPLIFICADA
// Ya no acepta 'navigate' ni 'setIsActionLoading'
export const loginUser = async (email, password, rememberMe) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Verificar si el email está verificado
  // NO cerrar sesión, solo lanzar error para que el frontend redirija
  if (!user.emailVerified) {
    const error = new Error("Email no verificado");
    error.code = "auth/email-not-verified";
    throw error;
  }

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

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
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
    // IMPORTANTE: En producción, debe usar HTTPS y el dominio debe estar autorizado

    let continueUrl;

    // Determinar la URL correcta según el entorno
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      // Desarrollo: usar HTTP
      continueUrl = `${window.location.origin}/authentication/reset-password/confirm`;
    } else {
      // Producción: forzar HTTPS (Firebase requiere HTTPS para dominios de producción)
      // Usar el hostname tal cual (con o sin www) para que funcione con ambos
      // IMPORTANTE: Ambos dominios deben estar autorizados en Firebase Console
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      continueUrl = `https://www.${hostname}${port}/authentication/reset-password/confirm`;
    }

    console.log("Enviando email de restablecimiento de contraseña:");
    console.log("- Email:", email);
    console.log("- Continue URL:", continueUrl);
    console.log("- Origin:", window.location.origin);
    console.log("- Hostname:", window.location.hostname);
    console.log("- Protocol:", window.location.protocol);
    console.log("- Full URL:", window.location.href);

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

    // Si es un error de URL no autorizada, proporcionar más información
    if (error.code === "auth/unauthorized-continue-uri") {
      console.error("⚠️ SOLUCIÓN REQUERIDA:");
      console.error("   1. Ve a Firebase Console > Authentication > Settings > Authorized domains");
      console.error("   2. Asegúrate de que el dominio esté autorizado:");
      console.error("      - goaltime.site");
      console.error("      - www.goaltime.site (si usas www)");
      console.error("   3. La URL debe usar HTTPS en producción");
      console.error("   URL que intentó usar:", continueUrl);
    }

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
    const newField = { id: docRef.id, ...fieldDoc };

    // Crear notificaciones para admins sobre la nueva cancha pendiente
    try {
      // Obtener el nombre del usuario actual
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userName = userDoc.exists() ? userDoc.data().name : "Un asociado";

      await notifyAdminsFieldPending(docRef.id, fieldData.name || "Nueva cancha", userName);
    } catch (notificationError) {
      console.error("Error al crear notificaciones:", notificationError);
      // No fallar la operación principal si las notificaciones fallan
    }

    return newField;
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

// Verificar si hay conflictos de horario para una reserva
export const checkReservationConflict = async (
  fieldId,
  date,
  startTime,
  endTime,
  excludeReservationId = null
) => {
  try {
    // Convertir horas a minutos para facilitar comparaciones
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Buscar reservas confirmadas para la misma cancha y fecha
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("fieldId", "==", fieldId),
      where("date", "==", date),
      where("status", "==", "confirmed")
    );

    const snapshot = await getDocs(reservationsQuery);

    for (const doc of snapshot.docs) {
      // Excluir la reserva actual si se está editando
      if (excludeReservationId && doc.id === excludeReservationId) {
        continue;
      }

      const reservation = doc.data();
      const existingStart = timeToMinutes(reservation.startTime);
      const existingEnd = timeToMinutes(reservation.endTime);

      // Verificar si hay solapamiento
      // Hay conflicto si:
      // - La nueva reserva empieza durante una reserva existente
      // - La nueva reserva termina durante una reserva existente
      // - La nueva reserva contiene completamente una reserva existente
      // - Una reserva existente contiene completamente la nueva reserva
      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd) ||
        (startMinutes >= existingStart && endMinutes <= existingEnd)
      ) {
        return {
          hasConflict: true,
          conflictingReservation: {
            id: doc.id,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            clientName: reservation.clientName || "Cliente",
          },
        };
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("Error al verificar conflictos:", error);
    throw new Error("Error al verificar disponibilidad de la reserva.");
  }
};

// Obtener las horas disponibles para una cancha en una fecha específica
export const getAvailableTimeSlots = async (fieldId, date, openingTime, closingTime) => {
  try {
    // Convertir horas a minutos
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const openMinutes = timeToMinutes(openingTime);
    const closeMinutes = timeToMinutes(closingTime);

    // Obtener todas las reservas confirmadas para esta cancha y fecha
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("fieldId", "==", fieldId),
      where("date", "==", date),
      where("status", "==", "confirmed")
    );

    const snapshot = await getDocs(reservationsQuery);
    const bookedSlots = [];

    snapshot.docs.forEach((doc) => {
      const reservation = doc.data();
      bookedSlots.push({
        start: timeToMinutes(reservation.startTime),
        end: timeToMinutes(reservation.endTime),
      });
    });

    // Ordenar los slots ocupados por hora de inicio
    bookedSlots.sort((a, b) => a.start - b.start);

    // Generar todos los slots de 30 minutos disponibles
    const allSlots = [];
    let currentMin = openMinutes;

    while (currentMin < closeMinutes) {
      allSlots.push({
        time: minutesToTime(currentMin),
        minutes: currentMin,
        available: true,
      });
      currentMin += 30; // Intervalos de 30 minutos
    }

    // Marcar slots ocupados como no disponibles
    allSlots.forEach((slot) => {
      const slotEnd = slot.minutes + 30; // Cada slot dura 30 minutos
      bookedSlots.forEach((booked) => {
        // Un slot está ocupado si se solapa con alguna reserva
        if (
          (slot.minutes >= booked.start && slot.minutes < booked.end) ||
          (slotEnd > booked.start && slotEnd <= booked.end) ||
          (slot.minutes <= booked.start && slotEnd >= booked.end)
        ) {
          slot.available = false;
        }
      });
    });

    return allSlots.filter((slot) => slot.available).map((slot) => slot.time);
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    // En caso de error, devolver todas las horas del horario
    const allSlots = [];
    const [openHour, openMin] = openingTime.split(":").map(Number);
    const [closeHour, closeMin] = closingTime.split(":").map(Number);
    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      allSlots.push(
        `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`
      );
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    return allSlots;
  }
};

// Crear una reserva (cliente) con validación
export const createReservation = async (reservationData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    // Validar que no haya conflictos antes de crear
    const conflictCheck = await checkReservationConflict(
      reservationData.fieldId,
      reservationData.date,
      reservationData.startTime,
      reservationData.endTime
    );

    if (conflictCheck.hasConflict) {
      throw new Error(
        `El horario seleccionado (${reservationData.startTime} - ${reservationData.endTime}) ya está ocupado por otra reserva confirmada. Por favor, selecciona otro horario.`
      );
    }

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

// Actualizar el estado de una reserva con razón
export const updateReservationStatus = async (reservationId, newStatus, reason, changedBy) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const reservationRef = doc(db, "reservations", reservationId);
    const reservationDoc = await getDoc(reservationRef);

    if (!reservationDoc.exists()) {
      throw new Error("La reserva no existe.");
    }

    const reservationData = reservationDoc.data();
    const oldStatus = reservationData.status;

    // Si se está cambiando a "confirmed", validar conflictos
    if (newStatus === "confirmed") {
      const conflictCheck = await checkReservationConflict(
        reservationData.fieldId,
        reservationData.date,
        reservationData.startTime,
        reservationData.endTime,
        reservationId // Excluir la reserva actual
      );

      if (conflictCheck.hasConflict) {
        throw new Error(
          `No se puede confirmar esta reserva. El horario ya está ocupado por otra reserva confirmada.`
        );
      }
    }

    // Actualizar la reserva
    await updateDoc(reservationRef, {
      status: newStatus,
      statusChangedAt: serverTimestamp(),
      statusChangedBy: changedBy || user.uid,
      statusChangeReason: reason || "",
      previousStatus: oldStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      reservation: { id: reservationId, ...reservationData, status: newStatus },
    };
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error);
    throw new Error(error.message || "Error al actualizar el estado de la reserva.");
  }
};

// Enviar notificación por correo de cambio de estado
export const sendReservationStatusChangeEmail = async (
  reservationData,
  newStatus,
  reason,
  clientEmail,
  clientName
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const token = await getIdToken(user);
    const functionUrl =
      "https://us-central1-goaltime-68101.cloudfunctions.net/sendReservationStatusChangeEmail";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: clientEmail,
        reservationId: reservationData.id,
        reservationData: reservationData,
        newStatus: newStatus,
        previousStatus: reservationData.previousStatus || reservationData.status,
        reason: reason || "",
        clientName: clientName || "Cliente",
      }),
    });

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const textResponse = await response.text();
      console.error("Respuesta no-JSON recibida:", textResponse);
      throw new Error(
        textResponse ||
          `Error del servidor (${response.status}). Por favor, verifica la configuración.`
      );
    }

    if (!response.ok) {
      throw new Error(
        responseData.error || responseData.details || `HTTP error! status: ${response.status}`
      );
    }
    return responseData;
  } catch (error) {
    console.error("Error al enviar correo de cambio de estado:", error);
    throw new Error(error.message || "Error al enviar la notificación por correo.");
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
  if (!userId) {
    console.warn("subscribeToNotifications: userId no proporcionado");
    return () => {};
  }

  try {
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
        console.log(`Notificaciones recibidas para usuario ${userId}:`, notifications.length);
        callback(notifications);
      },
      (error) => {
        console.error("Error al obtener notificaciones:", error);
        // Si el error es por índice faltante, intentar sin orderBy
        if (error.code === "failed-precondition" || error.message?.includes("index")) {
          console.warn("Índice compuesto faltante. Obteniendo notificaciones sin ordenar...");
          const simpleQuery = query(collection(db, "notifications"), where("userId", "==", userId));

          const unsubscribeSimple = onSnapshot(
            simpleQuery,
            (snapshot) => {
              const notifications = snapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .sort((a, b) => {
                  // Ordenar manualmente por fecha
                  const dateA = a.createdAt?.seconds || a.createdAt?.toMillis?.() / 1000 || 0;
                  const dateB = b.createdAt?.seconds || b.createdAt?.toMillis?.() / 1000 || 0;
                  return dateB - dateA;
                });
              console.log(`Notificaciones recibidas (sin ordenar):`, notifications.length);
              callback(notifications);
            },
            (simpleError) => {
              console.error("Error al obtener notificaciones (sin ordenar):", simpleError);
              callback([]);
            }
          );

          // Retornar función de limpieza para la suscripción simple
          return unsubscribeSimple;
        }
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error al crear query de notificaciones:", error);
    return () => {};
  }
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

// Crear notificaciones para admins cuando se crea una cancha pendiente
export const notifyAdminsFieldPending = async (fieldId, fieldName, ownerName) => {
  try {
    // Obtener todos los usuarios admin
    const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
    const adminsSnapshot = await getDocs(adminsQuery);

    // Crear notificación para cada admin
    const notificationPromises = adminsSnapshot.docs.map((adminDoc) => {
      const adminId = adminDoc.id;
      return createNotification({
        userId: adminId,
        type: "field_pending",
        title: "Nueva Cancha Pendiente",
        message: `La cancha "${fieldName}" de ${
          ownerName || "un asociado"
        } está pendiente de aprobación.`,
        relatedId: fieldId,
        actionUrl: `/canchas?fieldId=${fieldId}&status=pending`,
        icon: "pending_actions",
        color: "warning",
      });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error al crear notificaciones para admins:", error);
  }
};

// Crear notificación cuando se crea una reserva (para cliente)
export const notifyReservationCreated = async (reservationId, fieldName, clientId) => {
  try {
    await createNotification({
      userId: clientId,
      type: "reservation_created",
      title: "Reserva Creada",
      message: `Tu reserva para "${fieldName}" ha sido creada exitosamente. El dueño de la cancha la revisará pronto.`,
      relatedId: reservationId,
      actionUrl: "/reservations",
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
      actionUrl: "/reservations",
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
      actionUrl: "/reservations",
      icon: "cancel",
      color: "error",
    });
  } catch (error) {
    console.error("Error al crear notificación de reserva cancelada:", error);
  }
};

// 👇 FUNCIONES PARA FAVORITOS

// Agregar cancha a favoritos
export const addToFavorites = async (fieldId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const favoriteRef = doc(db, "favorites", `${user.uid}_${fieldId}`);
    await setDoc(favoriteRef, {
      userId: user.uid,
      fieldId: fieldId,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
    throw new Error(error.message || "Error al agregar a favoritos.");
  }
};

// Remover cancha de favoritos
export const removeFromFavorites = async (fieldId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const favoriteRef = doc(db, "favorites", `${user.uid}_${fieldId}`);
    await deleteDoc(favoriteRef);
    return true;
  } catch (error) {
    console.error("Error al remover de favoritos:", error);
    throw new Error(error.message || "Error al remover de favoritos.");
  }
};

// Verificar si una cancha está en favoritos
export const isFavorite = async (fieldId) => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const favoriteRef = doc(db, "favorites", `${user.uid}_${fieldId}`);
    const favoriteSnap = await getDoc(favoriteRef);
    return favoriteSnap.exists();
  } catch (error) {
    console.error("Error al verificar favorito:", error);
    return false;
  }
};

// Obtener todas las canchas favoritas de un usuario
export const getUserFavorites = async (userId) => {
  try {
    const favoritesQuery = query(collection(db, "favorites"), where("userId", "==", userId));
    const favoritesSnap = await getDocs(favoritesQuery);
    return favoritesSnap.docs.map((doc) => doc.data().fieldId);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};

// Suscribirse a cambios en favoritos de un usuario
export const subscribeToFavorites = (userId, callback) => {
  try {
    const favoritesQuery = query(collection(db, "favorites"), where("userId", "==", userId));
    return onSnapshot(
      favoritesQuery,
      (snapshot) => {
        const favoriteIds = snapshot.docs.map((doc) => doc.data().fieldId);
        callback(favoriteIds);
      },
      (error) => {
        console.error("Error en suscripción a favoritos:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error al suscribirse a favoritos:", error);
    return () => {};
  }
};

// 👇 FUNCIÓN PARA ENVIAR TICKET POR CORREO

export const sendTicketByEmail = async (ticketData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");

    const token = await getIdToken(user);
    const functionUrl = "https://us-central1-goaltime-68101.cloudfunctions.net/sendTicketByEmail";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    // Verificar el Content-Type antes de parsear JSON
    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      // Si no es JSON, leer como texto para ver el error
      const textResponse = await response.text();
      console.error("Respuesta no-JSON recibida:", textResponse);
      throw new Error(
        textResponse ||
          `Error del servidor (${response.status}). Por favor, verifica la configuración de SendGrid.`
      );
    }

    if (!response.ok) {
      throw new Error(
        responseData.error || responseData.details || `HTTP error! status: ${response.status}`
      );
    }
    return responseData;
  } catch (error) {
    console.error("Error al enviar ticket por correo:", error);
    // Si el error ya tiene un mensaje descriptivo, usarlo; si no, usar uno genérico
    if (error.message && !error.message.includes("JSON")) {
      throw error;
    }
    throw new Error(
      error.message ||
        "Error al enviar el ticket por correo. Verifica la configuración de SendGrid."
    );
  }
};

// 👇 FUNCIONES PARA FOTOS DE PERFIL

// Subir foto de perfil
export const uploadProfilePhoto = async (file, userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("No autorizado para subir esta foto.");
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen.");
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("La imagen no puede ser mayor a 5MB.");
    }

    // Crear referencia en Storage con nombre único
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storageRef = ref(storage, `profile-photos/${userId}/${fileName}`);

    console.log("Subiendo foto a:", `profile-photos/${userId}/${fileName}`);

    // Subir archivo con metadata usando uploadBytesResumable para mejor manejo de CORS
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: timestamp.toString(),
      },
    };

    // Usar uploadBytesResumable que maneja mejor CORS y permite monitoreo de progreso
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Esperar a que la subida se complete
    const snapshot = await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progreso de la subida (opcional, para mostrar progreso)
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso de subida: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error("Error durante la subida:", error);
          reject(error);
        },
        () => {
          // Subida completada
          resolve(uploadTask.snapshot);
        }
      );
    });

    console.log("Foto subida exitosamente:", snapshot.ref.fullPath);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("URL de descarga obtenida:", downloadURL);

    // Actualizar perfil del usuario en Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    });

    console.log("Perfil actualizado en Firestore");
    return downloadURL;
  } catch (error) {
    console.error("Error al subir foto de perfil:", error);
    console.error("Detalles del error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    // Mensajes de error más específicos
    if (error.code === "storage/unauthorized") {
      throw new Error("No tienes permisos para subir archivos. Contacta al administrador.");
    } else if (error.code === "storage/canceled") {
      throw new Error("La subida fue cancelada.");
    } else if (error.code === "storage/unknown") {
      throw new Error("Error desconocido al subir la foto. Verifica tu conexión a internet.");
    }

    throw new Error(error.message || "Error al subir la foto de perfil.");
  }
};

// Eliminar foto de perfil
export const deleteProfilePhoto = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("No autorizado para eliminar esta foto.");
    }

    // Obtener URL actual de la foto
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const photoURL = userData.photoURL;

      // Si hay una foto, eliminarla de Storage
      if (photoURL && photoURL.includes("firebasestorage.googleapis.com")) {
        try {
          // Extraer la ruta del Storage desde la URL
          const urlParts = photoURL.split("/");
          const pathIndex = urlParts.findIndex((part) => part === "o");
          if (pathIndex !== -1 && pathIndex + 1 < urlParts.length) {
            const encodedPath = urlParts[pathIndex + 1].split("?")[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const storageRef = ref(storage, decodedPath);
            await deleteObject(storageRef);
          }
        } catch (storageError) {
          console.warn("Error al eliminar foto de Storage (puede que ya no exista):", storageError);
          // Continuar aunque falle la eliminación de Storage
        }
      }

      // Actualizar perfil del usuario en Firestore
      await updateDoc(userRef, {
        photoURL: null,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error al eliminar foto de perfil:", error);
    throw new Error(error.message || "Error al eliminar la foto de perfil.");
  }
};

// 👇 FUNCIONES PARA VERIFICACIÓN DE EMAIL
/**
 * Reenvía el email de verificación al usuario actual
 */
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado");
  }
  if (user.emailVerified) {
    throw new Error("El email ya está verificado");
  }

  let continueUrl;

  // Determinar la URL correcta según el entorno (igual que en sendPasswordReset)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    // Desarrollo: usar HTTP
    continueUrl = `${window.location.origin}/authentication/verify-email`;
  } else {
    // Producción: forzar HTTPS (Firebase requiere HTTPS para dominios de producción)
    // Usar el hostname tal cual (con o sin www) para que funcione con ambos
    // IMPORTANTE: Ambos dominios deben estar autorizados en Firebase Console
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : "";
    continueUrl = `https://www.${hostname}${port}/authentication/verify-email`;
  }

  console.log("Reenviando email de verificación:");
  console.log("- Email:", user.email);
  console.log("- Continue URL:", continueUrl);

  await sendEmailVerification(user, {
    url: continueUrl,
    handleCodeInApp: false,
  });
};

/**
 * Verifica si el email del usuario actual está verificado
 * Recarga el usuario para obtener el estado más reciente
 */
export const checkEmailVerification = async () => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  // Recargar el usuario para obtener el estado más reciente
  await reload(user);

  return user.emailVerified;
};

/**
 * Aplica el código de verificación de email (oobCode)
 * @param {string} oobCode - Código de verificación recibido por email
 */
export const verifyEmailWithCode = async (oobCode) => {
  try {
    await applyActionCode(auth, oobCode);
    return { success: true };
  } catch (error) {
    console.error("Error verificando email con código:", error);
    throw error;
  }
};

/**
 * Suscribe a cambios en el estado de autenticación y verificación de email
 * @param {Function} callback - Función que se ejecuta cuando cambia el estado
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToEmailVerification = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Recargar el usuario para obtener el estado más reciente
      try {
        await reload(user);
        callback(user.emailVerified, user);
      } catch (error) {
        console.error("Error recargando usuario:", error);
        callback(user.emailVerified, user);
      }
    } else {
      callback(false, null);
    }
  });
};

export { auth, db, storage };
