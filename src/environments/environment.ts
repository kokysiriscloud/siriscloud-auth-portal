export const environment = {
  production: false,
  defaultApiUrl: 'http://localhost:3000',
  // defaultApiUrl: 'https://api-auth.siriscloud.com.co',
  metaAppUrl: 'https://national-clam-ghastly.ngrok-free.app/meta/connect',
  /**
   * Hostnames del portal SSO (no son dominios de tenant en BD). Si abres login en esa URL sin `?domain=`,
   * se usa `defaultLoginTenantHost` como `x-tenant-host` para resolver el tenant.
   */
  centralAuthPortalHosts: ['auth.siriscloud.com.co'],
  /**
   * Dominio del tenant (p. ej. fila en `tenant_domains`) cuando el hostname del portal no es el del tenant
   * (localhost, IP privada o `centralAuthPortalHosts`).
   */
  defaultLoginTenantHost: 'mallamaseps.siriscloud.com.co',
};
