import { Injectable, OnDestroy, inject } from '@angular/core';
import { AuthApiService } from './auth-api.service';
import { AuthSessionService } from './auth-session.service';

/** Intervalo de heartbeat en el portal (ms). El TTL idle en auth es ~3 min. */
const HEARTBEAT_INTERVAL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class SessionHeartbeatService implements OnDestroy {
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private started = false;

  start(domain: string): void {
    if (this.started) return;
    this.started = true;
    this.ping(domain);
    this.timer = setInterval(() => this.ping(domain), HEARTBEAT_INTERVAL_MS);
  }

  stop(): void {
    this.started = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private ping(domain: string): void {
    if (!this.session.isAuthenticated()) {
      this.stop();
      return;
    }
    this.authApi.sessionHeartbeat({ domain }).subscribe({
      error: () => {
        // Si la sesión murió en servidor, el próximo API call/logout limpiará.
      },
    });
  }
}
