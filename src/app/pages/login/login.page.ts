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
            <div class="relative mt-1">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11"
                formControlName="password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-slate-500 hover:text-slate-700 cursor-pointer"
                (click)="toggleShowPassword()"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [attr.title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                @if (showPassword) {
                  <!-- Eye off -->
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a18.16 18.16 0 0 1-3.2 4.36M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14.12 14.12A3 3 0 0 1 9.88 9.88"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M1 1l22 22"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                } @else {
                  <!-- Eye -->
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </button>
            </div>
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
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div class="flex gap-2">
              <svg class="mt-0.5 shrink-0 text-red-600" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.53A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.71-2.61l-8.4-14.53a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="min-w-0">
                <p class="font-semibold">No pudimos iniciar sesión</p>
                <p class="mt-0.5 text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        }
        @if (ok) {
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div class="flex gap-2">
              <svg class="mt-0.5 shrink-0 text-emerald-600" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="min-w-0">
                <p class="font-semibold">Listo</p>
                <p class="mt-0.5 text-emerald-700">{{ ok }}</p>
              </div>
            </div>
          </div>
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
  showPassword = false;
  tenants: DiscoveredTenant[] = [];
  selectedTenant: DiscoveredTenant | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revisa tu correo y contraseña e inténtalo de nuevo.';
      return;
    }

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
        const status = Number(err?.status ?? 0);
        if (status === 401 || status === 403) {
          this.error = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else {
          this.error = err?.error?.message ?? 'No fue posible iniciar sesión. Inténtalo de nuevo en unos minutos.';
        }
        this.loading = false;
      },
    });
  }
}
