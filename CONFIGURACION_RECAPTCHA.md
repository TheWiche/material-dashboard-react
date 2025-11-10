# Configuración de Google reCAPTCHA

## Descripción
Se ha implementado Google reCAPTCHA v2 en el formulario de contacto para proteger contra spam y bots.

## Configuración Actual

### Desarrollo
Actualmente se está usando una **clave de prueba de Google** que siempre pasa la verificación. Esta clave es útil para desarrollo pero **NO es segura para producción**.

Clave de prueba (solo para desarrollo):
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

## Configuración para Producción

### Paso 1: Obtener Claves de reCAPTCHA

1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"+ Crear"** para crear un nuevo sitio
4. Completa el formulario:
   - **Etiqueta**: GoalTime Contact Form (o el nombre que prefieras)
   - **Tipo de reCAPTCHA**: Selecciona **reCAPTCHA v2** > **"No soy un robot" Checkbox**
   - **Dominios**: Agrega tus dominios:
     - `localhost` (para desarrollo local)
     - `goaltime.site` (o tu dominio de producción)
     - `www.goaltime.site` (si usas www)
   - Acepta los términos de servicio
5. Haz clic en **"Enviar"**
6. Google te proporcionará:
   - **Site Key** (clave pública) - Se usa en el frontend
   - **Secret Key** (clave secreta) - Se usa en el backend para verificar

### Paso 2: Configurar la Clave en el Proyecto

#### Opción A: Variable de Entorno (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto (si no existe):
   ```bash
   REACT_APP_RECAPTCHA_SITE_KEY=tu_site_key_aqui
   ```

2. Si estás usando Vercel u otro servicio de despliegue:
   - Ve a la configuración del proyecto
   - Agrega la variable de entorno `REACT_APP_RECAPTCHA_SITE_KEY` con tu Site Key
   - Reinicia el despliegue

#### Opción B: Modificar Directamente el Código

1. Abre `src/layouts/homepage/components/ContactSection.js`
2. Reemplaza la línea:
   ```javascript
   const RECAPTCHA_SITE_KEY =
     process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
   ```
   
   Por:
   ```javascript
   const RECAPTCHA_SITE_KEY = "tu_site_key_aqui";
   ```

### Paso 3: Verificación en el Backend (Opcional pero Recomendado)

Si quieres verificar el captcha en el backend (altamente recomendado para seguridad):

1. El token del captcha se envía en el campo `g-recaptcha-response` del formulario
2. En tu backend (o servicio como Formspree), verifica el token usando la Secret Key:

```javascript
// Ejemplo de verificación en Node.js
const axios = require('axios');

async function verifyRecaptcha(token) {
  const secretKey = 'tu_secret_key_aqui';
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
  );
  
  return response.data.success;
}
```

## Características Implementadas

✅ reCAPTCHA v2 "No soy un robot" checkbox
✅ Validación antes de enviar el formulario
✅ Mensaje de error si el captcha no está completado
✅ Botón deshabilitado hasta completar el captcha
✅ Reset automático del captcha después de enviar exitosamente
✅ Manejo de expiración del captcha

## Notas Importantes

- ⚠️ **La clave de prueba NO es segura para producción** - Solo para desarrollo
- ⚠️ **Nunca expongas tu Secret Key** - Solo úsala en el backend
- ⚠️ **Agrega todos tus dominios** en la configuración de reCAPTCHA
- ✅ El captcha se carga automáticamente cuando se renderiza el componente
- ✅ El captcha se resetea después de un envío exitoso

## Solución de Problemas

### El captcha no se muestra
- Verifica que la Site Key sea correcta
- Verifica que el dominio esté autorizado en Google reCAPTCHA Console
- Verifica la conexión a internet (reCAPTCHA requiere conexión a los servidores de Google)

### Error "Invalid site key"
- Verifica que estés usando la Site Key correcta (no la Secret Key)
- Verifica que el dominio esté autorizado en Google reCAPTCHA Console

### El formulario no se envía aunque el captcha esté completado
- Verifica la consola del navegador para ver errores
- Verifica que el servicio de backend (Formspree) esté funcionando correctamente

## Recursos

- [Documentación de Google reCAPTCHA](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha en npm](https://www.npmjs.com/package/react-google-recaptcha)
- [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

