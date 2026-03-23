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
- Endpoint de aceptación de invitación en:
  - `src/app/services/auth-api.service.ts`

Ajusta la ruta backend si tu endpoint final cambia.
