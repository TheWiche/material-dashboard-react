# Configuración de URL de Acción Personalizada en Firebase

## ⚠️ IMPORTANTE: NO Cambiar la URL de Acción

**La URL de acción personalizada debe mantenerse en `/__/auth/action` (valor por defecto de Firebase).**

### ¿Por qué?

Firebase usa **UNA SOLA URL de acción** para **TODAS** las acciones de email:

- ✅ Verificación de email (`verifyEmail`)
- ✅ Restablecimiento de contraseña (`resetPassword`)
- ✅ Cambio de email (`changeEmail`)
- ✅ Y otras acciones futuras

Si cambiamos la URL a `/authentication/verify-email`, entonces:

- ❌ El restablecimiento de contraseña también iría a esa página (incorrecto)
- ❌ Necesitaríamos lógica compleja para manejar múltiples casos
- ❌ El flujo sería más propenso a errores

### Solución: Mantener `/__/auth/action` y mejorar el componente

El componente `HandleFirebaseAction` maneja **todas** las acciones y redirige apropiadamente:

- `verifyEmail` → Redirige a `/authentication/verify-email` (después de aplicar el código)
- `resetPassword` → Redirige a `/authentication/reset-password/confirm` (con el código)

## Configuración en Firebase Console

### Paso 1: Verificar la configuración actual

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **goaltime-68101**
3. Ve a **Authentication** > **Settings** (Configuración)
4. Busca la sección **Email templates** (Plantillas de correo electrónico)
5. Haz clic en **Action URL** (URL de acción)

### Paso 2: Verificar/Ajustar la URL

**La URL debe ser (valor por defecto):**

```
https://www.goaltime.site/__/auth/action
```

**O si está en desarrollo:**

```
http://localhost:3000/__/auth/action
```

### Paso 3: Variables de Firebase

- `%ACTION_MODE%`: Firebase reemplaza esto con el modo (ej: `verifyEmail`, `resetPassword`)
- `%LINK%`: Firebase reemplaza esto con el código de acción (`oobCode`)

**NOTA:** Si la URL personalizada está vacía o no configurada, Firebase usa automáticamente `{DOMAIN}/__/auth/action`, que es exactamente lo que necesitamos.

## ¿Cómo funciona el flujo?

### Verificación de Email:

1. Usuario hace clic en enlace → `/__/auth/action?mode=verifyEmail&oobCode=...`
2. `HandleFirebaseAction` detecta `mode=verifyEmail`
3. Aplica el código de verificación (`verifyEmailWithCode`)
4. Redirige a `/authentication/verify-email`
5. La página detecta que está verificado y redirige a `/canchas` o `/dashboard`

### Restablecimiento de Contraseña:

1. Usuario hace clic en enlace → `/__/auth/action?mode=resetPassword&oobCode=...`
2. `HandleFirebaseAction` detecta `mode=resetPassword`
3. Redirige a `/authentication/reset-password/confirm?oobCode=...`
4. La página permite al usuario ingresar la nueva contraseña

## Verificación de Dominios Autorizados

**IMPORTANTE:** Asegúrate de que estos dominios estén en **Authentication > Settings > Authorized domains**:

- ✅ `goaltime.site`
- ✅ `www.goaltime.site`
- ✅ `localhost` (para desarrollo)

## ¿Qué hacer si la URL está configurada incorrectamente?

1. **Si la URL personalizada está configurada a otra cosa:**

   - Haz clic en "Restablecer a la URL predeterminada"
   - O cambia manualmente a: `https://www.goaltime.site/__/auth/action`

2. **Guardar:**
   - Haz clic en **Guardar**
   - Espera unos minutos para que los cambios se propaguen

## Pruebas

Después de verificar la configuración, prueba:

1. ✅ Registro de nuevo usuario → Verificación de email
2. ✅ Reenvío de email de verificación
3. ✅ Restablecimiento de contraseña
4. ✅ Cambio de email (si está implementado)

Todos deben funcionar correctamente con `/__/auth/action` como URL de acción.
