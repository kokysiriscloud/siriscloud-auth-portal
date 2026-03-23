import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantConfigService {
  private readonly apiByDomain: Record<string, string> = {
    'mallamaseps.siriscloud.com.co': 'https://api.mallamaseps.siriscloud.com.co'
  };

  resolveApiUrl(domain?: string | null): string {
    if (domain && this.apiByDomain[domain]) return this.apiByDomain[domain];
    return environment.defaultApiUrl;
  }
}
