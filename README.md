# siriscloud-auth-portal

Starter frontend (Angular + Tailwind) para flujos de autenticación multi-tenant:
- `/accept-owner-invite`
- `/login`
- `/forgot-password`
- `/reset-password`

## Ejecutar

```bash
npm install
npm run start
```

Abrir:
`http://localhost:4200/accept-owner-invite?token=...&domain=mallamaseps.siriscloud.com.co`

## Notas

- Configuración por dominio en:
  - `src/app/services/tenant-config.service.ts`
- Launcher dinámico por tenant:
  - backend `GET /api/auth/launcher/tenant-apps` y `POST /api/auth/launcher/tenant-apps` (asignaciones `tenant_launcher_app_assignments`)
  - depuración UI: abre `/dashboard?launcherDebug=1` (consola + panel con `_debug` del API si aplica)
  - SQL recomendado en `siriscloud-auth`: `sql/005_launcher_apps_catalog.sql` (`launcher_apps` + `tenant_launcher_app_assignments`)
- Endpoint de aceptación de invitación en:
  - `src/app/services/auth-api.service.ts`

Ajusta la ruta backend si tu endpoint final cambia.
