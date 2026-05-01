import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 class="text-2xl font-semibold">Recuperar contraseña</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Correo de acceso</span>
            <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="email" />
          </label>

          <button class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60" [disabled]="loading">
            {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
          </button>
        </form>

        @if (message) {
          <p class="text-sm text-emerald-700">{{ message }}</p>
        }
        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }

        <a routerLink="/login" class="text-sm text-indigo-600 hover:underline">Volver a login</a>
      </section>
    </main>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  loading = false;
  message = '';
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    this.message = '';
    this.error = '';
    if (this.form.invalid) return;

    const domain = new URL(window.location.href).searchParams.get('domain') || window.location.hostname;
    const { email } = this.form.getRawValue();

    this.loading = true;
    this.authApi.forgotPassword({ domain, email: email ?? '' }).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'No fue posible procesar la solicitud.';
        this.loading = false;
      },
    });
  }
}
