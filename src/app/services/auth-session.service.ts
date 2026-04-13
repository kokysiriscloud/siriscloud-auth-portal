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

  getAccessToken(): string | null {
    return this.get()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.get()?.refreshToken ?? null;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const [body] = token.split('.');
      if (!body) return false;
      const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      if (!payload?.exp) return false;
      return Date.now() < payload.exp;
    } catch {
      return false;
    }
  }
}
