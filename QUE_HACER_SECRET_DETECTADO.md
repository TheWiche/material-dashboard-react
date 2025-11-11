# 🔒 Qué Hacer Cuando GitHub Detecta un Secret

## ✅ Lo que ya está hecho

He eliminado todas las referencias a la API Key real de los archivos de documentación. Ahora los archivos usan placeholders genéricos como `TU_API_KEY_AQUI`.

## 📋 Pasos Inmediatos

### 1. Verificar que no hay más referencias a la API Key

Ejecuta este comando para verificar:

```bash
grep -r "SG\." . --exclude-dir=node_modules --exclude-dir=.git
```

Si encuentra algo, elimínalo antes de hacer commit.

### 2. Hacer Commit de los Cambios

Los archivos de documentación ya están actualizados sin la API Key. Ahora puedes hacer commit:

```bash
git add CONFIGURAR_SENDGRID_SECRETS.md PASOS_IMPLEMENTAR_SECRETS.md SOLUCION_ERROR_SENDGRID_401.md
git commit -m "Eliminar API Key de SendGrid de archivos de documentación"
```

### 3. Hacer Push

```bash
git push
```

Ahora GitHub debería permitir el push sin bloquearlo.

## ⚠️ IMPORTANTE: Si la API Key ya está en el Historial de Git

Si ya hiciste commit anteriormente con la API Key, necesitas eliminarla del historial:

### Opción A: Usar git-filter-repo (Recomendado)

```bash
# Instalar git-filter-repo si no lo tienes
pip install git-filter-repo

# Eliminar la API Key del historial
git filter-repo --invert-paths --path CONFIGURAR_SENDGRID_SECRETS.md
```

### Opción B: Usar BFG Repo-Cleaner

```bash
# Descargar BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Eliminar la API Key
java -jar bfg.jar --replace-text passwords.txt
```

### Opción C: Crear un Nuevo Commit que Revoca la API Key

Si la API Key ya está expuesta en GitHub:

1. **Ve a SendGrid Dashboard** inmediatamente
2. **Revoca la API Key expuesta**: Settings → API Keys → Revoke
3. **Crea una nueva API Key**
4. **Actualiza Firebase Secrets** con la nueva:
   ```bash
   cd functions
   firebase functions:secrets:set SENDGRID_API_KEY
   ```
5. **Vuelve a desplegar las funciones**:
   ```bash
   firebase deploy --only functions:sendTicketByEmail,functions:sendReservationStatusChangeEmail
   ```

## 🔐 Prevención Futura

### 1. Usar .gitignore correctamente

Asegúrate de que estos archivos estén en `.gitignore`:
- `functions/.env`
- `*.runtimeconfig.json`
- Cualquier archivo con API Keys

### 2. Verificar antes de hacer commit

Siempre ejecuta antes de hacer commit:

```bash
# Buscar posibles secrets
grep -r "SG\." . --exclude-dir=node_modules --exclude-dir=.git
grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
```

### 3. Usar GitHub Secret Scanning

GitHub automáticamente escanea tus repositorios. Si detecta un secret:
- **NO hagas "Bypass"** - Esto es peligroso
- **Elimina el secret del código** primero
- **Revoca el secret expuesto** en el servicio correspondiente
- **Crea un nuevo secret** y actualiza la configuración

## ✅ Checklist de Seguridad

- [ ] API Key eliminada de todos los archivos de documentación
- [ ] Verificado que no hay más referencias con `grep`
- [ ] Commit hecho con los cambios
- [ ] Push exitoso sin bloqueos
- [ ] (Si estaba expuesta) API Key revocada en SendGrid
- [ ] (Si estaba expuesta) Nueva API Key creada y configurada en Firebase Secrets
- [ ] Funciones redesplegadas con la nueva API Key

## 🎯 Resumen

1. **Ya eliminé** la API Key de los archivos de documentación
2. **Haz commit** de los cambios
3. **Haz push** - debería funcionar ahora
4. **Si la API Key ya estaba expuesta**: Revócala y crea una nueva

---

**¡Nunca más subas secrets al código!** Usa siempre Firebase Secrets o variables de entorno. 🔒

