import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantConfigService } from './tenant-config.service';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { sub: string; email: string; role: string };
  tenant: { id: string; identifier: string; slug: string; name: string; domain: string };
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly tenantConfig: TenantConfigService
  ) {}

  login(payload: { domain: string; email: string; password: string }): Observable<LoginResponse> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<LoginResponse>(`${apiUrl}/api/auth/login`, {
      email: payload.email,
      password: payload.password,
    });
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
    accessToken: string;
    password: string;
  }): Observable<{ ok: true; message: string }> {
    const apiUrl = this.tenantConfig.resolveApiUrl(payload.domain);
    return this.http.post<{ ok: true; message: string }>(`${apiUrl}/api/auth/reset-password`, {
      accessToken: payload.accessToken,
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
}
