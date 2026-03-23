import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantConfigService {
  private readonly apiByDomain: Record<string, string> = {
    'mallamaseps.siriscloud.com.co': 'https://api.mallamaseps.siriscloud.com.co'
  };

  resolveApiUrl(domain?: string | null): string {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    // En desarrollo local usamos siempre el backend local
    // aunque el query param traiga el dominio real del tenant.
    if (isLocal) return environment.defaultApiUrl;

    if (domain && this.apiByDomain[domain]) return this.apiByDomain[domain];
    return environment.defaultApiUrl;
  }
}
