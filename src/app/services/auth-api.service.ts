import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantConfigService } from './tenant-config.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly tenantConfig: TenantConfigService
  ) {}

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
