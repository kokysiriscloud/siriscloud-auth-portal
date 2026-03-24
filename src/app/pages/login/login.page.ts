import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { TenantConfigService } from '../../services/tenant-config.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 class="text-2xl font-semibold">Login</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Correo</span>
            <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="email" />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Contraseña</span>
            <input type="password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="password" />
          </label>

          <button class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60" [disabled]="loading">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
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
  private readonly tenantConfig = inject(TenantConfigService);
  private readonly router = inject(Router);

  loading = false;
  error = '';
  ok = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.error = '';
    this.ok = '';
    if (this.form.invalid) return;

    const domain = new URL(window.location.href).searchParams.get('domain') || window.location.hostname;
    const { email, password } = this.form.getRawValue();

    this.loading = true;
    this.authApi
      .login({ domain, email: email ?? '', password: password ?? '' })
      .subscribe({
        next: (res) => {
          this.session.save(res);
          this.ok = `Bienvenido ${res.user.email}`;
          this.loading = false;

          const targetAppUrl = this.tenantConfig.resolveClientAppUrl(res.tenant?.domain || domain);
          if (targetAppUrl && !targetAppUrl.includes(window.location.host)) {
            const payload = encodeURIComponent(btoa(JSON.stringify(res)));
            const joiner = targetAppUrl.includes('?') ? '&' : '?';
            window.location.href = `${targetAppUrl}${joiner}session=${payload}`;
            return;
          }

          void this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'No fue posible iniciar sesión.';
          this.loading = false;
        },
      });
  }
}
