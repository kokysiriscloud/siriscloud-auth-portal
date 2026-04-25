/**
 * Sustituye a `environment.ts` en build `ng build --configuration=production`
 * (ver `fileReplacements` en `angular.json`).
 */
export const environment = {
  production: true,
  defaultApiUrl: 'https://api-auth.siriscloud.com.co',
  /** Solo se usa en local; en prod `TenantConfigService` usa el fallback de Mallamas si aplica. */
  metaAppUrl: 'https://mallamaseps.siriscloud.com.co',
  centralAuthPortalHosts: ['auth.siriscloud.com.co'],
  defaultLoginTenantHost: 'mallamaseps.siriscloud.com.co',
};
