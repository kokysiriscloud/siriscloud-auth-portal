export const environment = {
  production: false,
  defaultApiUrl: 'http://localhost:3000',
  // defaultApiUrl: 'https://api-auth.siriscloud.com.co',
  metaAppUrl: 'https://national-clam-ghastly.ngrok-free.app/meta/connect',
  /**
   * Con portal en localhost / 127.0.0.1 / IP privada (192.168.x, 10.x, 172.16–31.x) y sin `?domain=`,
   * el login envía `x-tenant-host` con este valor (debe existir en `tenant_domains.domain` o equivalente).
   */
  defaultLoginTenantHost: 'mallamaseps.siriscloud.com.co',
};
