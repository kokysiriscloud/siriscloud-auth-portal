import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

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
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.25em] text-sky-400">SirisCloud Auth Portal</p>
              <h1 class="mt-3 text-5xl font-semibold tracking-tight text-white">Hub central del ecosistema</h1>
              <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                Autentica una sola vez y navega entre productos SirisCloud reutilizando la sesión.
                Este portal actúa como punto de entrada común para soluciones especializadas.
              </p>
            </div>
            <button class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white" (click)="logout()">Cerrar sesión</button>
          </div>
        </header>

        <section class="grid gap-4 md:grid-cols-4">
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Tenant</p>
            <p class="mt-3 text-lg font-semibold text-white">{{ tenantName }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Usuario</p>
            <p class="mt-3 text-lg font-semibold text-white">{{ userEmail }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Rol</p>
            <p class="mt-3 text-lg font-semibold text-white">{{ userRole }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Apps</p>
            <p class="mt-3 text-lg font-semibold text-white">1 activa</p>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p class="text-sm font-medium text-slate-300">Contexto de sesión</p>
            <div class="mt-5 space-y-3 text-sm text-slate-300">
              <div class="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Dominio</p>
                <p class="mt-2 text-white">{{ tenantDomain }}</p>
              </div>
              <div class="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
                <p class="mt-2 text-emerald-300">Sesión central activa</p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-slate-300">Launcher de aplicaciones</p>
                <p class="mt-1 text-xs text-slate-500">Accede a las soluciones conectadas al auth portal.</p>
              </div>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <button class="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5 text-left transition hover:bg-sky-400/15" (click)="openMetaApp()">
                <p class="text-xs uppercase tracking-[0.2em] text-sky-300">Meta Platform</p>
                <h3 class="mt-3 text-xl font-semibold text-white">App Meta SirisCloud</h3>
                <p class="mt-2 text-sm leading-6 text-slate-300">
                  Onboarding, Embedded Signup, callbacks, session reuse y operación sobre integraciones con Meta.
                </p>
                <span class="mt-4 inline-flex rounded-full bg-slate-950/60 px-3 py-1 text-xs text-slate-200">Abrir app</span>
              </button>

              <div class="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-left">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Próximamente</p>
                <h3 class="mt-3 text-xl font-semibold text-white">Más apps del ecosistema</h3>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  Este espacio queda listo para lanzar más productos compartiendo autenticación y contexto multi-tenant.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  `,
})
export class DashboardPageComponent {
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);

  private readonly data = this.session.get();

  tenantName = this.data?.tenant?.name ?? '-';
  tenantDomain = this.data?.tenant?.domain ?? '-';
  userEmail = this.data?.user?.email ?? '-';
  userRole = this.data?.user?.role ?? '-';

  openMetaApp(): void {
    window.location.href = 'http://localhost:4300/meta/connect';
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }
}
