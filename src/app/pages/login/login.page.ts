import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthApiService, DiscoveredTenant } from '../../services/auth-api.service';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div class="flex items-center justify-center gap-4">
          <a
            href="https://www.siriscloud.com.co"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0 cursor-pointer"
            aria-label="Ir a siriscloud.com.co"
            title="Ir a SirisCloud"
          >
            <img
              src="/logo.png"
              alt="SirisCloud"
              width="64"
              height="64"
              class="h-16 w-16 object-contain drop-shadow"
              loading="eager"
              decoding="async"
            />
          </a>
          <div class="text-left">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">SirisCloud</p>
            <h1 class="text-2xl font-semibold text-slate-900">Ingresar</h1>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Correo</span>
            <input
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="email"
              autocomplete="email"
              (blur)="onEmailBlur()"
            />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Contraseña</span>
            <input
              type="password"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="password"
              autocomplete="current-password"
            />
          </label>

          @if (tenants.length > 1) {
            <div class="space-y-2">
              <p class="text-sm text-slate-700">Organización</p>
              <ul class="space-y-2">
                @for (t of tenants; track t.tenantId) {
                  <li>
                    <button
                      type="button"
                      class="w-full rounded-lg border px-3 py-2 text-left transition"
                      [class.border-indigo-500]="selectedTenant?.tenantId === t.tenantId"
                      [class.bg-indigo-50]="selectedTenant?.tenantId === t.tenantId"
                      [class.border-slate-300]="selectedTenant?.tenantId !== t.tenantId"
                      (click)="selectTenant(t)"
                    >
                      <span class="block text-sm font-medium text-slate-900">{{ t.name }}</span>
                      <span class="block text-xs text-slate-500">{{ t.domain }}</span>
                    </button>
                  </li>
                }
              </ul>
            </div>
          }

          <button
            class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60"
            [disabled]="loading"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }
        @if (ok) {
          <p class="text-sm text-emerald-600">{{ ok }}</p>
        }

        <div class="text-sm space-y-1">
          <a routerLink="/forgot-password" class="block text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</a>
          <a routerLink="/forgot-username" class="block text-indigo-600 hover:underline">¿Olvidaste tu usuario?</a>
        </div>
      </section>
    </main>
  `,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);

  /** Si el usuario entra con `?domain=<tenant>`, se respeta y se salta el descubrimiento. */
  private readonly forcedDomain: string | null;

  constructor() {
    const currentUrl = new URL(window.location.href);
    const requestedRedirectUrl = currentUrl.searchParams.get('redirect');

    if (requestedRedirectUrl && !this.session.isAuthenticated()) {
      this.session.clear();
    }

    this.forcedDomain = currentUrl.searchParams.get('domain');
  }

  loading = false;
  error = '';
  ok = '';
  tenants: DiscoveredTenant[] = [];
  selectedTenant: DiscoveredTenant | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /** Al salir del input de email, intenta descubrir tenants para mostrar selector si hay varios. */
  onEmailBlur(): void {
    if (this.forcedDomain) return;
    const email = String(this.form.value.email ?? '').trim().toLowerCase();
    if (!email || this.form.get('email')?.invalid) {
      this.tenants = [];
      this.selectedTenant = null;
      return;
    }

    this.authApi.discoverTenantsByEmail({ email }).subscribe({
      next: (res) => {
        const list = res.tenants ?? [];
        this.tenants = list;
        this.selectedTenant = list.length === 1 ? list[0] : null;
      },
      error: () => {
        this.tenants = [];
        this.selectedTenant = null;
      },
    });
  }

  selectTenant(tenant: DiscoveredTenant): void {
    this.selectedTenant = tenant;
  }

  submit(): void {
    this.error = '';
    this.ok = '';
    if (this.form.invalid) return;

    const email = String(this.form.value.email ?? '');
    const password = String(this.form.value.password ?? '');

    if (!this.forcedDomain && this.tenants.length > 1 && !this.selectedTenant) {
      this.error = 'Selecciona la organización con la que quieres ingresar.';
      return;
    }

    const domain =
      this.forcedDomain ||
      this.selectedTenant?.domain ||
      this.tenants[0]?.domain ||
      window.location.hostname;

    this.loading = true;
    this.authApi.login({ domain, email, password }).subscribe({
      next: (res) => {
        this.session.clear();
        this.session.save(res);
        this.ok = `Bienvenido ${res.user.email}`;
        this.loading = false;

        const currentUrl = new URL(window.location.href);
        const requestedRedirectUrl = currentUrl.searchParams.get('redirect');
        const requestedReturnUrl = currentUrl.searchParams.get('returnUrl');
        const dashboardUrl = new URL('/dashboard', window.location.origin);
        if (requestedRedirectUrl) dashboardUrl.searchParams.set('redirect', requestedRedirectUrl);
        if (requestedReturnUrl) dashboardUrl.searchParams.set('returnUrl', requestedReturnUrl);
        window.location.href = dashboardUrl.toString();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'No fue posible iniciar sesión.';
        this.loading = false;
      },
    });
  }
}
