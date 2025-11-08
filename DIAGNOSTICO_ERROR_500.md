# 🔍 Diagnóstico del Error 500 en sendTicketByEmail

## El problema

Estás recibiendo un error 500 (Internal Server Error) al intentar enviar el ticket por correo. El log que compartiste muestra que la función está fallando, pero necesitamos ver el error específico.

## Pasos para diagnosticar

### 1. Ver los logs detallados de la función

Ejecuta este comando para ver los logs en tiempo real:

```bash
firebase functions:log --only sendTicketByEmail
```

O ve directamente a la consola de Firebase:
1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto `goaltime-68101`
3. Ve a **Functions** → **sendTicketByEmail** → **Logs**
4. Busca los logs más recientes con severity "ERROR"

Los logs ahora incluyen información detallada sobre:
- Si la API Key está configurada
- El correo remitente que se está usando
- El error específico de SendGrid (si aplica)

### 2. Verificar la configuración de Firebase Functions

Ejecuta:

```bash
firebase functions:config:get
```

Deberías ver algo como:

```json
{
  "sendgrid": {
    "api_key": "SG.xxxxx",
    "from_email": "noreply@goaltime.site"
  }
}
```

**Si falta la API Key**, configúrala:

```bash
firebase functions:config:set sendgrid.api_key="SG.tu-api-key-aqui"
```

**Si falta el correo remitente**, configúralo:

```bash
firebase functions:config:set sendgrid.from_email="noreply@goaltime.site"
```

### 3. Verificar en SendGrid

1. Ve a https://app.sendgrid.com/
2. **Settings** → **Sender Authentication**
3. Verifica que `noreply@goaltime.site` aparezca como **"Verified"** (con check verde)
4. Si no está verificado, haz clic en "Verify a Single Sender" y sigue los pasos

### 4. Redesplegar la función

Después de verificar la configuración, redespliega la función:

```bash
firebase deploy --only functions:sendTicketByEmail
```

### 5. Probar nuevamente

Intenta enviar el ticket por correo nuevamente y revisa los logs para ver el error específico.

---

## Errores comunes y soluciones

### Error: "SendGrid API Key not configured"
**Solución:**
```bash
firebase functions:config:set sendgrid.api_key="SG.tu-api-key-aqui"
firebase deploy --only functions:sendTicketByEmail
```

### Error: "The from address does not match a verified Sender Identity"
**Solución:**
1. Verifica que `noreply@goaltime.site` esté verificado en SendGrid
2. Si usas Moho Mail, asegúrate de que el correo esté configurado correctamente
3. Verifica la configuración: `firebase functions:config:get`

### Error: "Unauthorized" o "Invalid API Key"
**Solución:**
1. Verifica que la API Key tenga permisos de "Mail Send" en SendGrid
2. Crea una nueva API Key si es necesario
3. Actualiza la configuración: `firebase functions:config:set sendgrid.api_key="SG.nueva-api-key"`

### Error: "Cannot find module '@sendgrid/mail'"
**Solución:**
```bash
cd functions
npm install @sendgrid/mail
firebase deploy --only functions:sendTicketByEmail
```

---

## Información adicional en los logs

Con los cambios recientes, los logs ahora mostrarán:
- ✅ Si la API Key está configurada (sin mostrar la clave por seguridad)
- ✅ El correo remitente que se está usando
- ✅ El error específico de SendGrid con detalles
- ✅ El tipo de error para facilitar el diagnóstico

---

## Próximos pasos

1. **Ejecuta** `firebase functions:log --only sendTicketByEmail` para ver los logs detallados
2. **Comparte** el error específico que aparece en los logs
3. **Verifica** la configuración con `firebase functions:config:get`
4. **Redespliega** la función después de cualquier cambio en la configuración

