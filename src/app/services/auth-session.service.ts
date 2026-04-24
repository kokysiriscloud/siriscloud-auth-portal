import { Injectable } from '@angular/core';
import { LoginResponse } from './auth-api.service';

type StoredSession = LoginResponse & {
  expiresAt?: number;
};

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly key = 'siriscloud_auth_session';

  save(session: LoginResponse): void {
    const expiresAt = Number.isFinite(session.expiresIn) ? Date.now() + session.expiresIn * 1000 : undefined;
    const storedSession: StoredSession = { ...session, expiresAt };
    localStorage.setItem(this.key, JSON.stringify(storedSession));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  get(): StoredSession | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
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
    const session = this.get();
    const token = session?.accessToken;
    if (!token) return false;

    try {
      const payload = this.decodeAccessTokenPayload(token);
      if (payload?.exp != null) {
        // JWT estándar usa `exp` en segundos; el backend Siris (`body.signature`) usa ms absolutos.
        const expMs = payload.exp > 1e11 ? payload.exp : payload.exp * 1000;
        return Date.now() < expMs;
      }
    } catch {
      // token no parseable
    }

    return typeof session.expiresAt === 'number' && Date.now() < session.expiresAt;
  }

  /** Soporta JWT (3 segmentos) y tokens del auth API (payload firmado en el 1.er segmento). */
  private decodeAccessTokenPayload(token: string): { exp?: number } | null {
    const parts = token.split('.');
    const encoded = parts.length >= 3 ? parts[1] : parts[0];
    if (!encoded) return null;
    const json = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { exp?: number };
  }
}
