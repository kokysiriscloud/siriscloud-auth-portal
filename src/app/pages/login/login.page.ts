import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthApiService, DiscoveredTenant } from '../../services/auth-api.service';
import { AuthSessionService } from '../../services/auth-session.service';

type Step = 'email' | 'tenant' | 'password';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 class="text-2xl font-semibold">Login</h1>

        <!-- Paso 1: email -->
        <form *ngIf="step === 'email'" [formGroup]="emailForm" (ngSubmit)="submitEmail()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Correo</span>
            <input
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="email"
              autocomplete="email"
            />
          </label>
          <button
            class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60"
            [disabled]="loading"
          >
            {{ loading ? 'Buscando...' : 'Continuar' }}
          </button>
        </form>

        <!-- Paso 2: selector de tenant -->
        <div *ngIf="step === 'tenant'" class="space-y-3">
          <p class="text-sm text-slate-700">Selecciona la organización con la que quieres ingresar</p>
          <ul class="space-y-2">
            <li *ngFor="let t of tenants">
              <button
                type="button"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-left hover:bg-slate-50"
                (click)="selectTenant(t)"
              >
                <span class="block text-sm font-medium text-slate-900">{{ t.name }}</span>
                <span class="block text-xs text-slate-500">{{ t.domain }}</span>
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="text-sm text-slate-500 hover:text-slate-700"
            (click)="backToEmail()"
          >
            ← Cambiar correo
          </button>
        </div>

        <!-- Paso 3: contraseña -->
        <form *ngIf="step === 'password'" [formGroup]="passwordForm" (ngSubmit)="submitPassword()" class="space-y-3">
          <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p class="text-slate-500 text-xs">Ingresando como</p>
            <p class="font-medium text-slate-900">{{ emailForm.value.email }}</p>
            <p class="text-xs text-slate-500">{{ selectedTenant?.name }} ({{ selectedTenant?.domain }})</p>
          </div>

          <label class="block">
            <span class="text-sm text-slate-700">Contraseña</span>
            <input
              type="password"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="password"
              autocomplete="current-password"
            />
          </label>

          <button
            class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60"
            [disabled]="loading"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <button
            type="button"
            class="text-sm text-slate-500 hover:text-slate-700"
            (click)="backToEmail()"
          >
            ← Cambiar correo
          </button>
        </form>

        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>
        <p *ngIf="ok" class="text-sm text-emerald-600">{{ ok }}</p>

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

  constructor() {
    const currentUrl = new URL(window.location.href);
    const requestedRedirectUrl = currentUrl.searchParams.get('redirect');

    if (requestedRedirectUrl && !this.session.isAuthenticated()) {
      this.session.clear();
    }

    const forcedDomain = currentUrl.searchParams.get('domain');
    if (forcedDomain) {
      this.selectedTenant = {
        tenantId: '',
        slug: '',
        name: forcedDomain,
        domain: forcedDomain,
        role: 'user',
      };
    }
  }

  step: Step = 'email';
  loading = false;
  error = '';
  ok = '';
  tenants: DiscoveredTenant[] = [];
  selectedTenant: DiscoveredTenant | null = null;

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required]],
  });

  submitEmail(): void {
    this.error = '';
    this.ok = '';
    if (this.emailForm.invalid) return;
    const email = this.emailForm.value.email ?? '';
    const forcedDomain = new URL(window.location.href).searchParams.get('domain') || undefined;

    // Si venía ?domain= en la URL, saltamos descubrimiento.
    if (this.selectedTenant?.domain) {
      this.step = 'password';
      return;
    }

    this.loading = true;
    this.authApi.discoverTenantsByEmail({ email, domain: forcedDomain }).subscribe({
      next: (res) => {
        this.loading = false;
        const list = res.tenants ?? [];
        if (list.length === 0) {
          // Evita enumeración: dejamos continuar al paso contraseña; el login fallará con credenciales.
          this.selectedTenant = null;
          this.step = 'password';
          return;
        }
        if (list.length === 1) {
          this.selectedTenant = list[0];
          this.step = 'password';
          return;
        }
        this.tenants = list;
        this.step = 'tenant';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'No fue posible validar el correo.';
      },
    });
  }

  selectTenant(tenant: DiscoveredTenant): void {
    this.selectedTenant = tenant;
    this.step = 'password';
    this.error = '';
    this.ok = '';
  }

  backToEmail(): void {
    this.step = 'email';
    this.selectedTenant = null;
    this.tenants = [];
    this.passwordForm.reset();
    this.error = '';
    this.ok = '';
  }

  submitPassword(): void {
    this.error = '';
    this.ok = '';
    if (this.passwordForm.invalid) return;

    const email = this.emailForm.value.email ?? '';
    const password = this.passwordForm.value.password ?? '';
    const domain = this.selectedTenant?.domain
      || new URL(window.location.href).searchParams.get('domain')
      || window.location.hostname;

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
