import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen bg-slate-50 p-6">
      <section class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-3">
        <h1 class="text-2xl font-semibold">Dashboard privado</h1>
        <p class="text-slate-600">Autenticación funcionando para tenant:</p>

        <div class="text-sm bg-slate-100 rounded p-3">
          <p><strong>Tenant:</strong> {{ tenantName }}</p>
          <p><strong>Dominio:</strong> {{ tenantDomain }}</p>
          <p><strong>Usuario:</strong> {{ userEmail }}</p>
          <p><strong>Rol:</strong> {{ userRole }}</p>
        </div>

        <button class="rounded-lg bg-red-600 text-white px-4 py-2" (click)="logout()">Cerrar sesión</button>
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

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }
}
