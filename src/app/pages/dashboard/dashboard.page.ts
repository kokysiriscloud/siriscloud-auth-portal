import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen bg-slate-950 p-6 text-slate-100">
      <section class="max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-6">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="text-sm uppercase tracking-[0.25em] text-sky-400">SirisCloud Auth Portal</p>
            <h1 class="mt-2 text-4xl font-semibold tracking-tight">Hub central de autenticación</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Desde aquí autenticas una sola vez y navegas a las demás apps del ecosistema SirisCloud reutilizando la misma sesión.
            </p>
          </div>
          <button class="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white" (click)="logout()">Cerrar sesión</button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
            <p><strong>Tenant:</strong> {{ tenantName }}</p>
            <p><strong>Dominio:</strong> {{ tenantDomain }}</p>
            <p><strong>Usuario:</strong> {{ userEmail }}</p>
            <p><strong>Rol:</strong> {{ userRole }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p class="text-sm font-medium">Apps disponibles</p>
            <div class="mt-4 grid gap-3">
              <button class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left hover:bg-slate-800" (click)="openMetaApp()">
                <span class="block text-sm font-semibold text-white">App Meta SirisCloud</span>
                <span class="mt-1 block text-xs text-slate-400">Onboarding y gestión de integraciones con Meta</span>
              </button>
            </div>
          </div>
        </div>
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
    window.location.href = 'http://localhost:4200/meta/connect';
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }
}
