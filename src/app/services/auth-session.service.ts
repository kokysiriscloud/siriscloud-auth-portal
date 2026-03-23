import { Injectable } from '@angular/core';
import { LoginResponse } from './auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly key = 'siriscloud_auth_session';

  save(session: LoginResponse): void {
    localStorage.setItem(this.key, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  get(): LoginResponse | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }
}
