import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 class="text-2xl font-semibold">Restablecer contraseña</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Nueva contraseña</span>
            <input type="password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="password" />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Confirmar nueva contraseña</span>
            <input type="password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="confirmPassword" />
          </label>

          <button class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60" [disabled]="loading || (!accessToken && !token)">
            {{ loading ? 'Guardando...' : 'Guardar nueva contraseña' }}
          </button>
        </form>

        <p *ngIf="!accessToken && !token" class="text-sm text-red-600">No se encontró token de recuperación en la URL.</p>
        <p *ngIf="message" class="text-sm text-emerald-700">{{ message }}</p>
        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="space-y-1">
          <a *ngIf="showRequestNewLink" routerLink="/forgot-password" class="block text-sm text-indigo-600 hover:underline">
            Solicitar nuevo enlace
          </a>
          <a routerLink="/login" class="block text-sm text-indigo-600 hover:underline">Volver a login</a>
        </div>
      </section>
    </main>
  `,
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  accessToken = '';
  token = '';
  loading = false;
  message = '';
  error = '';
  showRequestNewLink = false;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);
    this.accessToken = hashParams.get('access_token') || '';

    const queryParams = new URLSearchParams(window.location.search);
    this.token = queryParams.get('token') || '';
  }

  submit(): void {
    this.message = '';
    this.error = '';
    this.showRequestNewLink = false;
    if (this.form.invalid || (!this.accessToken && !this.token)) return;

    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const domain = new URL(window.location.href).searchParams.get('domain') || window.location.hostname;

    this.loading = true;
    this.authApi
      .resetPassword({
        domain,
        accessToken: this.accessToken || undefined,
        token: this.token || undefined,
        password: password ?? '',
      })
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'No fue posible actualizar la contraseña.';
          this.showRequestNewLink =
            this.error.toLowerCase().includes('expir') ||
            this.error.toLowerCase().includes('válido') ||
            this.error.toLowerCase().includes('valido');
          this.loading = false;
        },
      });
  }
}
