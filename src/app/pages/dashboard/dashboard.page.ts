import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthApiService, TenantLauncherApp } from '../../services/auth-api.service';

interface LauncherAppView {
  id: string;
  appKey: string;
  category: string;
  name: string;
  description: string;
  launchUrl: string;
  ctaLabel: string;
  usesSessionRedirect: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="relative min-h-screen overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -left-16 top-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"></div>
        <div class="absolute right-0 top-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
      </div>

      <section class="relative max-w-6xl mx-auto space-y-6">
        <header class="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-5">
              <a
                href="https://www.siriscloud.com.co"
                target="_blank"
                rel="noopener noreferrer"
                class="relative shrink-0 cursor-pointer mt-2 sm:mt-2.5"
                aria-label="Ir a siriscloud.com.co"
                title="Ir a SirisCloud"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none absolute -inset-2 rounded-full bg-sky-400/20 blur-xl sm:-inset-3 sm:bg-sky-400/25 sm:blur-2xl"
                ></span>
                <img
                  src="/logo.png"
                  alt="SirisCloud"
                  width="88"
                  height="88"
                  class="relative h-[4.25rem] w-[4.25rem] sm:h-20 sm:w-20 object-contain drop-shadow-[0_14px_34px_rgba(0,0,0,0.4)]"
                  loading="eager"
                  decoding="async"
                />
              </a>
              <div>
                <p class="text-sm uppercase tracking-[0.25em] text-sky-400">Centro de acceso SirisCloud</p>
                <h1 class="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Panel de aplicaciones SirisCloud
                </h1>
                <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  Autentica una sola vez y accede a los productos SirisCloud con la misma sesión.
                  Este portal es el punto de entrada común para las soluciones de tu organización.
                </p>
              </div>
            </div>
            <button class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white" (click)="logout()">Cerrar sesión</button>
          </div>
        </header>

        <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div class="shrink-0">
              <p class="text-xs uppercase tracking-[0.2em] text-sky-400/90">Contexto de sesión</p>
              <p class="mt-1 text-sm text-slate-500">Dominio y estado de la sesión central.</p>
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div class="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 sm:min-w-[12rem]">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Dominio</p>
                <p class="mt-1 break-all text-sm font-medium text-white">{{ tenantDomain }}</p>
              </div>
              <div class="shrink-0 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 sm:w-52">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
                <p class="mt-1 text-sm font-medium text-emerald-300">Sesión central activa</p>
              </div>
            </div>
          </div>
        </div>

        <section class="grid gap-4 md:grid-cols-4">
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Tenant</p>
            <p class="mt-2 text-base font-semibold text-white">{{ tenantName }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Usuario</p>
            <p class="mt-2 text-base font-semibold text-white">{{ userEmail }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Rol</p>
            <p class="mt-2 text-base font-semibold text-white">{{ userRole }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Apps</p>
            <p class="mt-2 text-base font-semibold text-white">{{ activeAppsLabel }}</p>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div class="mb-5">
            <p class="text-sm font-medium text-slate-300">Launcher de aplicaciones</p>
          </div>

          @if (!appsLoading && apps.length === 0) {
            <div class="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-left">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Aplicaciones</p>
              <h3 class="mt-3 text-xl font-semibold text-white">No hay aplicaciones conectadas</h3>
              <p class="mt-2 text-sm leading-6 text-slate-400">
                Cuando tu organización tenga aplicaciones disponibles, aparecerán aquí. Si necesitas acceso, contacta al administrador.
              </p>
            </div>
          }

          @if (apps.length > 0) {
            <div class="flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600">
              @for (app of apps; track app.id) {
                <button
                  type="button"
                  class="w-[min(100%,17.5rem)] shrink-0 snap-start rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5 text-left transition hover:bg-sky-400/15 sm:w-72"
                  (click)="openApp(app)"
                >
                  <p class="text-xs uppercase tracking-[0.2em] text-sky-300">{{ app.category }}</p>
                  <h3 class="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-white">{{ app.name }}</h3>
                  <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">{{ app.description }}</p>
                  <span class="mt-4 inline-flex rounded-full bg-slate-950/60 px-3 py-1 text-xs text-slate-200">{{
                    app.ctaLabel
                  }}</span>
                </button>
              }
            </div>
          }

          @if (launcherDebugPanel) {
            <div class="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
              <p class="text-xs font-medium uppercase tracking-wide text-amber-200/90">Debug launcher</p>
              <pre class="mt-2 max-h-64 overflow-auto text-xs leading-relaxed text-slate-200">{{ launcherDebugPanel }}</pre>
            </div>
          }
        </section>
      </section>
    </main>
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly session = inject(AuthSessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly data = this.session.get();

  tenantName = this.data?.tenant?.name ?? '-';
  tenantDomain = this.data?.tenant?.domain ?? '-';
  userEmail = this.data?.user?.email ?? '-';
  userRole = this.data?.user?.role ?? '-';
  apps: LauncherAppView[] = [];
  appsLoading = false;
  /** JSON visible si abres `/dashboard?launcherDebug=1` */
  launcherDebugPanel = '';

  ngOnInit(): void {
    this.loadLauncherApps();
  }

  get activeAppsLabel(): string {
    if (this.appsLoading) return 'Cargando...';
    const count = this.apps.length;
    if (count === 0) return 'Ninguna conectada';
    return `${count} activa${count === 1 ? '' : 's'}`;
  }

  openApp(app: LauncherAppView): void {
    const targetUrl = this.resolveTargetUrl(app);
    if (!targetUrl) return;

    if (app.usesSessionRedirect) {
      const payload = btoa(JSON.stringify(this.data));
      const url = new URL(targetUrl, window.location.origin);
      url.searchParams.set('session', payload);
      window.location.href = url.toString();
      return;
    }

    window.location.href = targetUrl;
  }

  private resolveTargetUrl(app: LauncherAppView): string | null {
    const requestedRedirect = this.route.snapshot.queryParamMap.get('redirect');
    if (!requestedRedirect) return app.launchUrl;

    const parsedAppUrl = this.tryParseUrl(app.launchUrl);
    const parsedRedirectUrl = this.tryParseUrl(requestedRedirect);
    if (!parsedRedirectUrl) return app.launchUrl;

    // Solo respeta ?redirect= si apunta al mismo origen del app seleccionado.
    if (parsedAppUrl && parsedRedirectUrl.origin === parsedAppUrl.origin) {
      return parsedRedirectUrl.toString();
    }

    return app.launchUrl;
  }

  private tryParseUrl(value: string): URL | null {
    try {
      return new URL(value, window.location.origin);
    } catch {
      return null;
    }
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }

  private loadLauncherApps(): void {
    const domain = this.data?.tenant?.domain ?? window.location.hostname;
    const launcherDebug = this.route.snapshot.queryParamMap.get('launcherDebug') === '1';
    this.launcherDebugPanel = '';

    if (!domain) {
      this.apps = [];
      return;
    }

    this.appsLoading = true;
    this.authApi.getLauncherApps({ domain, debug: launcherDebug }).subscribe({
      next: (response) => {
        this.apps = (response.apps ?? []).map((app) => this.toViewModel(app));
        this.appsLoading = false;
        if (launcherDebug) {
          const apiUrl = `${domain} → tenant-apps`;
          const payload = {
            apiUrlHint: apiUrl,
            sessionTenantId: this.data?.tenant?.id ?? null,
            sessionTenantDomain: this.data?.tenant?.domain ?? null,
            appsCount: response.apps?.length ?? 0,
            backendDebug: response._debug ?? '(sin _debug: en prod pon LAUNCHER_DEBUG=true y ?debug=1)',
          };
          this.launcherDebugPanel = JSON.stringify(payload, null, 2);
          console.debug('[launcher]', payload);
        }
      },
      error: (err: { status?: number; message?: string; url?: string }) => {
        this.apps = [];
        this.appsLoading = false;
        if (launcherDebug) {
          const payload = {
            error: err?.message ?? 'Error HTTP',
            status: err?.status ?? null,
            sessionTenantId: this.data?.tenant?.id ?? null,
            sessionTenantDomain: domain,
          };
          this.launcherDebugPanel = JSON.stringify(payload, null, 2);
          console.warn('[launcher]', payload, err);
        }
      },
    });
  }

  private toViewModel(app: TenantLauncherApp): LauncherAppView {
    return {
      id: app.id,
      appKey: app.appKey,
      category: app.category?.trim() || 'Aplicación',
      name: app.name,
      description: app.description,
      launchUrl: app.launchUrl,
      ctaLabel: app.ctaLabel || 'Abrir app',
      usesSessionRedirect: app.usesSessionRedirect,
    };
  }
}
