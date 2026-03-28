import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantConfigService {
  private readonly apiByDomain: Record<string, string> = {
    'mallamaseps.siriscloud.com.co': 'https://api.mallamaseps.siriscloud.com.co',
  };

  private readonly appByDomain: Record<string, { local: string; prod: string }> = {
    'mallamaseps.siriscloud.com.co': {
      local: 'http://localhost:4300',
      prod: 'https://app.mallamaseps.siriscloud.com.co',
    },
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

  resolveClientAppUrl(domain?: string | null): string {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (domain && this.appByDomain[domain]) {
      return isLocal ? this.appByDomain[domain].local : this.appByDomain[domain].prod;
    }

    return isLocal ? 'http://localhost:4300' : 'https://mallamaseps.siriscloud.com.co';
  }
}
