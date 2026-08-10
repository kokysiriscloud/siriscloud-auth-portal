import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantConfigService } from './tenant-config.service';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { sub: string; email: string; role: string };
  tenant: { id: string; identifier: string; slug: string; name: string; domain: string };
}

export interface TenantLauncherApp {
  id: string;
  appKey: string;
  category: string | null;
  name: string;
  description: string;
  launchUrl: string;
  ctaLabel: string;
  usesSessionRedirect: boolean;
  sortOrder: number;
  isActive?: boolean;
}

export interface LauncherAppsResponse {
  apps: TenantLauncherApp[];
  /** Solo si el backend acepta `?debug=1` (dev o LAUNCHER_DEBUG=true). */
  _debug?: Record<string, unknown>;
}

export interface SelfServiceCatalogApp {
  appKey: string;
  category: string | null;
  name: string;
  description: string;
  ctaLabel: string;
  allowSelfService: true;
  alreadyActive: boolean;
}

export interface SelfServiceCatalogResponse {
  apps: SelfServiceCatalogApp[];
}

export interface UpsertLauncherAppPayload {
  appKey: string;
  /** URL propia del tenant; si se omite se usa la del catálogo en backend. */
  launchUrl?: string;
  ctaLabel?: string;
  usesSessionRedirect?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpsertLauncherAppResponse {
  app: TenantLauncherApp;
}

export interface DiscoveredTenant {
  tenantId: string;
  slug: string;
  name: string;
  domain: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
}

export interface DiscoverTenantsResponse {
  tenants: DiscoveredTenant[];
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly tenantConfig: TenantConfigService
  ) {}

  /**
   * Multi-tenant: dado un email, devuelve los tenants donde está registrado.
   * El portal SSO lo usa para armar `tenantHost` antes del login cuando no hay `?domain=`.
   */
  discoverTenantsByEmail(payload: { email: string; domain?: string }): Observable<DiscoverTenantsResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<DiscoverTenantsResponse>(
      `${apiUrl}/api/auth/tenants/by-email`,
      { email: payload.email },
    );
  }

  login(payload: { domain: string; email: string; password: string }): Observable<LoginResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    const tenantHost = this.resolveLoginTenantHost(payload.domain);
    const body: { email: string; password: string; tenantHost?: string } = {
      email: payload.email,
      password: payload.password,
    };
    if (tenantHost) {
      body.tenantHost = tenantHost;
    }
    return this.http.post<LoginResponse>(`${apiUrl}/api/auth/login`, body);
  }

  /**
   * Host para `x-tenant-host`: `?domain=` si es un dominio de tenant;
   * si el portal es local, IP privada o host del SSO central (`centralAuthPortalHosts`), usa
   * `localStorage['siris-dev-login-tenant-host']` o `defaultLoginTenantHost`.
   */
  private resolveLoginTenantHost(domain: string): string {
    const raw = String(domain || '').split(':')[0].trim().toLowerCase();
    if (raw && !this.isLocalPortalHostname(raw) && !this.isCentralAuthPortalHost(raw)) {
      return raw;
    }
    try {
      const ls = localStorage.getItem('siris-dev-login-tenant-host');
      const fromLs = ls?.split(':')[0]?.trim().toLowerCase();
      if (fromLs) {
        return fromLs;
      }
    } catch {
      /* ignore */
    }
    if (environment.defaultLoginTenantHost) {
      const fromEnv = String(environment.defaultLoginTenantHost)
        .split(':')[0]
        .trim()
        .toLowerCase();
      if (fromEnv) {
        return fromEnv;
      }
    }
    return '';
  }

  /** Hostname del portal SSO central (no coincide con `tenant_domains` del tenant). */
  private isCentralAuthPortalHost(host: string): boolean {
    const h = host.trim().toLowerCase();
    const list = environment.centralAuthPortalHosts ?? [];
    return list.some((x) => String(x).trim().toLowerCase() === h);
  }

  /** Hostname del propio dev server (no es el dominio del tenant en BD). */
  private isLocalPortalHostname(host: string): boolean {
    const h = host.trim().toLowerCase();
    if (!h || h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') {
      return true;
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) {
      return true;
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) {
      return true;
    }
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) {
      return true;
    }
    return false;
  }

  forgotPassword(payload: { domain: string; email: string }): Observable<{ ok: true; message: string }> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<{ ok: true; message: string }>(`${apiUrl}/api/auth/forgot-password`, {
      email: payload.email,
    });
  }

  forgotUsername(payload: {
    domain: string;
    identifier: string;
  }): Observable<{ ok: true; maskedEmail?: string; message: string }> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<{ ok: true; maskedEmail?: string; message: string }>(
      `${apiUrl}/api/auth/forgot-username`,
      { identifier: payload.identifier },
    );
  }

  resetPassword(payload: {
    domain: string;
    accessToken?: string;
    token?: string;
    password: string;
  }): Observable<{ ok: true; message: string }> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<{ ok: true; message: string }>(`${apiUrl}/api/auth/reset-password`, {
      accessToken: payload.accessToken,
      token: payload.token,
      password: payload.password,
    });
  }

  acceptOwnerInvite(payload: {
    token: string;
    domain: string;
    fullName: string;
    password: string;
  }): Observable<unknown> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post(`${apiUrl}/api/auth/owner/accept-invite`, payload);
  }

  signupTenant(payload: {
    companyName: string;
    identifier: string;
    slug: string;
    adminEmail: string;
    requestedDomain: string;
  }): Observable<{ requestId: string; status: 'pending_email_verification' }> {
    const apiUrl = this.tenantConfig.resolveApiUrl();
    return this.http.post<{ requestId: string; status: 'pending_email_verification' }>(
      `${apiUrl}/api/auth/signup-tenant`,
      payload,
    );
  }

  verifySignup(payload: { token: string }): Observable<{
    requestId: string;
    status: 'verified';
    tenantId: string;
    domain: string;
    ownerEmail: string;
  }> {
    const apiUrl = this.tenantConfig.resolveApiUrl();
    return this.http.post<{
      requestId: string;
      status: 'verified';
      tenantId: string;
      domain: string;
      ownerEmail: string;
    }>(`${apiUrl}/api/auth/verify-signup`, payload);
  }

  resendSignupVerification(payload: {
    adminEmail: string;
  }): Observable<{ ok: true; sent: boolean; message: string }> {
    const apiUrl = this.tenantConfig.resolveApiUrl();
    return this.http.post<{ ok: true; sent: boolean; message: string }>(
      `${apiUrl}/api/auth/resend-signup-verification`,
      payload,
    );
  }

  getLauncherApps(payload: { domain: string; debug?: boolean }): Observable<LauncherAppsResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    const q = payload.debug ? '?debug=1' : '';
    return this.http.get<LauncherAppsResponse>(`${apiUrl}/api/auth/launcher/tenant-apps${q}`);
  }

  getSelfServiceCatalog(payload: { domain: string }): Observable<SelfServiceCatalogResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.get<SelfServiceCatalogResponse>(`${apiUrl}/api/auth/launcher/self-service/catalog`);
  }

  activateSelfServiceApp(payload: {
    domain: string;
    appKey: string;
  }): Observable<UpsertLauncherAppResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<UpsertLauncherAppResponse>(`${apiUrl}/api/auth/launcher/self-service/activate`, {
      appKey: payload.appKey,
    });
  }

  upsertLauncherApp(payload: { domain: string } & UpsertLauncherAppPayload): Observable<UpsertLauncherAppResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    const { domain: _domain, ...body } = payload;
    return this.http.post<UpsertLauncherAppResponse>(`${apiUrl}/api/auth/launcher/tenant-apps`, body);
  }
}
