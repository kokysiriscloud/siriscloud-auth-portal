import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-forgot-username-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 class="text-2xl font-semibold">¿Olvidaste tu usuario?</h1>
        <p class="text-sm text-slate-500">Ingresa el identifier de tu empresa (ej. NIT o código).</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Identifier</span>
            <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" formControlName="identifier" />
          </label>

          <button class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60" [disabled]="loading">
            {{ loading ? 'Validando...' : 'Recordar usuario' }}
          </button>
        </form>

        <p *ngIf="maskedEmail" class="text-sm text-emerald-700">Correo asociado: {{ maskedEmail }}</p>
        <p *ngIf="message" class="text-sm text-slate-700">{{ message }}</p>
        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>

        <a routerLink="/login" class="text-sm text-indigo-600 hover:underline">Volver a login</a>
      </section>
    </main>
  `,
})
export class ForgotUsernamePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  loading = false;
  error = '';
  message = '';
  maskedEmail = '';

  form = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(2)]],
  });

  submit(): void {
    this.error = '';
    this.message = '';
    this.maskedEmail = '';
    if (this.form.invalid) return;

    const domain = new URL(window.location.href).searchParams.get('domain') || window.location.hostname;
    const { identifier } = this.form.getRawValue();

    this.loading = true;
    this.authApi.forgotUsername({ domain, identifier: identifier ?? '' }).subscribe({
      next: (res) => {
        this.maskedEmail = res.maskedEmail ?? '';
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
