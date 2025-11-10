// src/layouts/authentication/verify-email/index.js

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, LinearProgress } from "@mui/material";
import { Email, CheckCircle, Error as ErrorIcon, Refresh, MailOutline } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import SplitScreenLayout from "layouts/authentication/components/SplitScreenLayout";
import bgImage from "assets/images/bg-sign-up-cover.png";
import {
  auth,
  resendVerificationEmail,
  checkEmailVerification,
  subscribeToEmailVerification,
  verifyEmailWithCode,
} from "services/firebaseService";
import { useAuth } from "context/AuthContext";
import { useSearchParams } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [successSB, setSuccessSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [checkCount, setCheckCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);
  const unsubscribeRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const { userProfile, initialAuthLoading, currentUser } = useAuth();

  // Cargar cooldown desde localStorage al montar
  useEffect(() => {
    if (currentUser) {
      const storedCooldown = localStorage.getItem(`emailCooldown_${currentUser.uid}`);
      const storedTime = localStorage.getItem(`emailCooldownTime_${currentUser.uid}`);

      if (storedCooldown && storedTime) {
        const elapsed = Math.floor((Date.now() - parseInt(storedTime)) / 1000);
        const remaining = Math.max(0, parseInt(storedCooldown) - elapsed);

        if (remaining > 0) {
          setCooldownSeconds(remaining);
        } else {
          // Limpiar si ya expiró
          localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
          localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
        }
      }
    }
  }, [currentUser]);

  // Función para obtener el oobCode de diferentes lugares (igual que en reset password)
  const getOobCodeFromUrl = useCallback(() => {
    // Intentar obtener de searchParams (React Router)
    const fromSearchParams = searchParams.get("oobCode") || searchParams.get("oobcode");
    if (fromSearchParams) return fromSearchParams;

    // Intentar obtener directamente de window.location (por si Firebase redirige)
    const urlParams = new URLSearchParams(window.location.search);
    const fromWindow = urlParams.get("oobCode") || urlParams.get("oobcode");
    if (fromWindow) return fromWindow;

    // Intentar obtener del hash (algunos casos de Firebase)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const fromHash = hashParams.get("oobCode") || hashParams.get("oobcode");
    if (fromHash) return fromHash;

    return null;
  }, [searchParams]);

  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);

  // Verificar estado inicial y configurar monitoreo en tiempo real
  useEffect(() => {
    const checkInitialState = async () => {
      // Primero, verificar si estamos en /__/auth/action y procesar el código
      if (window.location.pathname === "/__/auth/action") {
        const urlParams = new URLSearchParams(window.location.search);
        const actionCode = urlParams.get("oobCode");
        const mode = urlParams.get("mode");
        const continueUrl = urlParams.get("continueUrl");

        if (mode === "verifyEmail" && actionCode) {
          console.log("Procesando código de verificación de email desde /__/auth/action");
          try {
            // Aplicar el código de verificación
            await verifyEmailWithCode(actionCode);
            console.log("Email verificado exitosamente con código");

            // Redirigir a la página de verificación (o continueUrl si existe)
            let redirectUrl;
            if (continueUrl && continueUrl.startsWith("http")) {
              try {
                redirectUrl = decodeURIComponent(continueUrl);
              } catch (e) {
                redirectUrl = continueUrl;
              }
            } else {
              redirectUrl = `${window.location.origin}/authentication/verify-email`;
            }

            // Limpiar la URL y redirigir
            window.location.href = redirectUrl;
            return;
          } catch (error) {
            console.error("Error aplicando código de verificación:", error);
            setErrorMessage(
              "El enlace de verificación no es válido o ha expirado. Por favor, solicita uno nuevo."
            );
            openErrorSB();
            setIsChecking(false);
            return;
          }
        }
      }

      // Verificar si hay un oobCode en la URL (después de redirección desde /__/auth/action)
      const oobCode = getOobCodeFromUrl();
      if (oobCode) {
        console.log("Procesando código de verificación de email desde URL");
        try {
          await verifyEmailWithCode(oobCode);
          console.log("Email verificado exitosamente con código");
          // Limpiar la URL removiendo el oobCode
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        } catch (error) {
          console.error("Error aplicando código de verificación:", error);
          setErrorMessage(
            "El enlace de verificación no es válido o ha expirado. Por favor, solicita uno nuevo."
          );
          openErrorSB();
        }
      }

      const user = auth.currentUser;

      if (!user) {
        // Si no hay usuario, redirigir a sign-up
        navigate("/authentication/sign-up");
        return;
      }

      setUserEmail(user.email || "");

      // Verificar estado inicial
      try {
        const verified = await checkEmailVerification();
        setIsVerified(verified);
        setIsChecking(false);

        // Mostrar mensaje si el email no se envió durante el registro
        if (userProfile?.emailVerificationError) {
          const error = userProfile.emailVerificationError;
          if (error.code === "auth/unauthorized-continue-uri") {
            setErrorMessage(
              `El dominio "${window.location.hostname}" no está autorizado en Firebase. Por favor, contacta al administrador o agrega este dominio en Firebase Console > Authentication > Settings > Authorized domains.`
            );
            openErrorSB();
          } else if (error.code === "auth/too-many-requests") {
            setCooldownSeconds(300); // 5 minutos
            setErrorMessage(
              "Has enviado demasiados emails de verificación. Por favor, espera 5 minutos antes de intentar nuevamente."
            );
            openErrorSB();
          }
        }

        if (verified) {
          // Si ya está verificado, redirigir después de un breve delay
          setTimeout(() => {
            navigate("/canchas");
          }, 2000);
          return;
        }
      } catch (error) {
        console.error("Error verificando email:", error);
        setIsChecking(false);
      }

      // Configurar suscripción en tiempo real
      unsubscribeRef.current = subscribeToEmailVerification((verified, user) => {
        if (verified) {
          setIsVerified(true);
          setIsChecking(false);
          setSuccessMessage("¡Email verificado exitosamente! Redirigiendo...");
          openSuccessSB();

          // Redirigir después de 2 segundos
          setTimeout(() => {
            navigate("/canchas");
          }, 2000);
        } else if (user) {
          setIsVerified(false);
          setIsChecking(false);
        } else {
          // Usuario no autenticado
          navigate("/authentication/sign-up");
        }
      });

      // También verificar periódicamente cada 3 segundos (fallback)
      checkIntervalRef.current = setInterval(async () => {
        try {
          const verified = await checkEmailVerification();
          if (verified && !isVerified) {
            setIsVerified(true);
            setIsChecking(false);
            setSuccessMessage("¡Email verificado exitosamente! Redirigiendo...");
            openSuccessSB();

            setTimeout(() => {
              navigate("/canchas");
            }, 2000);
          }
          setCheckCount((prev) => prev + 1);
        } catch (error) {
          console.error("Error en verificación periódica:", error);
        }
      }, 3000);
    };

    if (!initialAuthLoading) {
      checkInitialState();
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [navigate, initialAuthLoading, isVerified]);

  // Cooldown de 60 segundos entre reenvíos
  const COOLDOWN_DURATION = 60; // segundos

  // Efecto para manejar el cooldown y persistirlo en localStorage
  useEffect(() => {
    if (cooldownSeconds > 0 && currentUser) {
      // Guardar en localStorage
      localStorage.setItem(`emailCooldown_${currentUser.uid}`, cooldownSeconds.toString());
      localStorage.setItem(`emailCooldownTime_${currentUser.uid}`, Date.now().toString());

      cooldownIntervalRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          const newValue = prev <= 1 ? 0 : prev - 1;

          // Actualizar localStorage
          if (currentUser) {
            if (newValue === 0) {
              localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
              localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
            } else {
              localStorage.setItem(`emailCooldown_${currentUser.uid}`, newValue.toString());
            }
          }

          return newValue;
        });
      }, 1000);
    } else {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }

      // Limpiar localStorage si el cooldown terminó
      if (cooldownSeconds === 0 && currentUser) {
        localStorage.removeItem(`emailCooldown_${currentUser.uid}`);
        localStorage.removeItem(`emailCooldownTime_${currentUser.uid}`);
      }
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownSeconds, currentUser]);

  const handleResendEmail = async () => {
    // Verificar cooldown
    if (cooldownSeconds > 0) {
      setErrorMessage(
        `Por favor, espera ${cooldownSeconds} segundo${
          cooldownSeconds !== 1 ? "s" : ""
        } antes de solicitar otro email.`
      );
      openErrorSB();
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationEmail();
      setSuccessMessage("Email de verificación reenviado. Revisa tu bandeja de entrada.");
      openSuccessSB();
      // Iniciar cooldown
      setCooldownSeconds(COOLDOWN_DURATION);
      setLastResendTime(Date.now());
    } catch (error) {
      let message = error.message || "Error al reenviar el email. Por favor, inténtalo más tarde.";

      // Manejo específico para too-many-requests
      if (error.code === "auth/too-many-requests") {
        // Cooldown más largo si Firebase bloquea
        setCooldownSeconds(300); // 5 minutos
        message =
          error.message ||
          "Has enviado demasiados emails. Por favor, espera 5 minutos antes de intentar nuevamente.";
      } else if (error.code === "auth/unauthorized-continue-uri") {
        // Error de dominio no autorizado - mensaje más detallado
        message =
          error.message ||
          `El dominio no está autorizado en Firebase. Por favor, agrega "${window.location.hostname}" en Firebase Console > Authentication > Settings > Authorized domains.`;
        // No aplicar cooldown para este error, es un problema de configuración
      } else {
        // Cooldown normal para otros errores
        setCooldownSeconds(COOLDOWN_DURATION);
      }

      setErrorMessage(message);
      openErrorSB();
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate("/authentication/sign-in");
  };

  // Right Panel Content (40% - Image with Overlay)
  const rightContent = (
    <MDBox
      width="100%"
      height="100%"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <MDBox sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Email sx={{ fontSize: 80, color: "white", mb: 2, opacity: 0.9 }} />
        <MDTypography variant="h3" fontWeight="bold" color="white" mb={2}>
          Verifica tu Email
        </MDTypography>
        <MDTypography variant="body1" color="white" sx={{ opacity: 0.9, maxWidth: "300px" }}>
          Hemos enviado un enlace de verificación a tu correo electrónico. Haz clic en el enlace
          para completar tu registro.
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  // Left Panel Content (60% - White Form)
  const leftContent = (
    <MDBox
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={{ xs: 3, sm: 6, md: 8 }}
      py={4}
      sx={{ position: "relative" }}
    >
      <MDBox maxWidth="480px" mx="auto" width="100%">
        {/* Estado de verificación */}
        {isChecking ? (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <CircularProgress size={60} sx={{ color: (theme) => theme.palette.goaltime.main }} />
            </MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="dark" mb={2} textAlign="center">
              Verificando...
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3} textAlign="center">
              Estamos verificando el estado de tu email. Por favor, espera un momento.
            </MDTypography>
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 1,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: (theme) => theme.palette.goaltime.main,
                },
              }}
            />
          </>
        ) : isVerified ? (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <CheckCircle sx={{ fontSize: 80, color: "success.main" }} />
            </MDBox>
            <MDTypography
              variant="h4"
              fontWeight="bold"
              color="success.main"
              mb={2}
              textAlign="center"
            >
              ¡Email Verificado!
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={4} textAlign="center">
              Tu email ha sido verificado exitosamente. Serás redirigido en breve...
            </MDTypography>
          </>
        ) : (
          <>
            <MDBox display="flex" justifyContent="center" mb={3}>
              <MailOutline sx={{ fontSize: 80, color: (theme) => theme.palette.goaltime.main }} />
            </MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="dark" mb={2} textAlign="center">
              Verifica tu Email
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3} textAlign="center">
              Hemos enviado un enlace de verificación a:
            </MDTypography>
            <MDBox
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: "grey.100",
                border: "1px solid",
                borderColor: "grey.300",
              }}
            >
              <MDTypography variant="body1" fontWeight="medium" color="dark" textAlign="center">
                {userEmail}
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text" mb={4} textAlign="center">
              Haz clic en el enlace del email para verificar tu cuenta. Esta página se actualizará
              automáticamente cuando verifiques tu email.
            </MDTypography>

            {/* Botón de reenvío */}
            <MDButton
              variant="outlined"
              fullWidth
              onClick={handleResendEmail}
              disabled={isResending || cooldownSeconds > 0}
              sx={{
                mb: 2,
                borderColor: (theme) => theme.palette.goaltime.main,
                color: (theme) => theme.palette.goaltime.main,
                textTransform: "none",
                py: 1.5,
                "&:hover": {
                  borderColor: (theme) => theme.palette.goaltime.dark,
                  backgroundColor: (theme) => `${theme.palette.goaltime.main}10`,
                },
                "&:disabled": {
                  borderColor: "grey.300",
                  color: "grey.500",
                },
              }}
              startIcon={isResending ? <CircularProgress size={20} /> : <Refresh />}
            >
              {isResending
                ? "Reenviando..."
                : cooldownSeconds > 0
                ? `Espera ${cooldownSeconds}s antes de reenviar`
                : "Reenviar Email de Verificación"}
            </MDButton>

            {/* Botón para ir a iniciar sesión */}
            <MDButton
              variant="text"
              fullWidth
              onClick={handleGoToSignIn}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Ya verifiqué mi email, ir a iniciar sesión
            </MDButton>
          </>
        )}

        {/* Información adicional */}
        {!isVerified && !isChecking && (
          <>
            {/* Mensaje de advertencia si el email no se envió durante el registro */}
            {userProfile?.emailVerificationError && (
              <MDBox
                mt={4}
                mb={2}
                p={2}
                borderRadius={2}
                sx={{
                  backgroundColor: "warning.lighter",
                  border: "1px solid",
                  borderColor: "warning.main",
                }}
              >
                <MDTypography variant="caption" color="warning.dark" display="block" mb={1}>
                  <strong>⚠️ Email no enviado durante el registro</strong>
                </MDTypography>
                <MDTypography variant="caption" color="warning.dark">
                  {userProfile.emailVerificationError.code === "auth/unauthorized-continue-uri"
                    ? `El dominio no está autorizado en Firebase. Por favor, contacta al administrador o intenta reenviar el email usando el botón de abajo.`
                    : userProfile.emailVerificationError.code === "auth/too-many-requests"
                    ? "Has enviado demasiados emails. Por favor, espera unos minutos antes de intentar reenviar."
                    : "Hubo un problema al enviar el email de verificación. Por favor, intenta reenviar el email usando el botón de abajo."}
                </MDTypography>
              </MDBox>
            )}

            <MDBox
              mt={userProfile?.emailVerificationError ? 0 : 4}
              p={2}
              borderRadius={2}
              sx={{
                backgroundColor: "info.lighter",
                border: "1px solid",
                borderColor: "info.main",
              }}
            >
              <MDTypography variant="caption" color="info.dark" display="block" mb={1}>
                <strong>¿No recibiste el email?</strong>
              </MDTypography>
              <MDTypography variant="caption" color="info.dark">
                • Revisa tu carpeta de spam o correo no deseado
                <br />• Asegúrate de que el email sea correcto
                <br />• Espera unos minutos y haz clic en &quot;Reenviar Email de Verificación&quot;
              </MDTypography>
            </MDBox>
          </>
        )}
      </MDBox>

      {/* Snackbars */}
      <MDSnackbar
        color="error"
        icon="warning"
        title="Error"
        content={errorMessage}
        dateTime="justo ahora"
        open={errorSB}
        onClose={closeErrorSB}
        close={closeErrorSB}
        bgWhite
      />
      <MDSnackbar
        color="success"
        icon="check"
        title="Éxito"
        content={successMessage}
        dateTime="justo ahora"
        open={successSB}
        onClose={closeSuccessSB}
        close={closeSuccessSB}
        bgWhite
      />
    </MDBox>
  );

  return (
    <SplitScreenLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftWidth="60%"
      rightWidth="40%"
      showLeftOnMobile={true}
    />
  );
}

export default VerifyEmail;
