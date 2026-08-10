import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

const DOMAIN_SUFFIX = '.siriscloud.com.co';

@Component({
  selector: 'app-register-page',
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
            <h1 class="text-2xl font-semibold text-slate-900">Registrar organización</h1>
          </div>
        </div>

        <p class="text-sm text-slate-500">
          Completa los datos de tu empresa. Te enviaremos un correo para verificar y activar la cuenta.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <label class="block">
            <span class="text-sm text-slate-700">Empresa</span>
            <input
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="companyName"
              autocomplete="organization"
            />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Identifier (NIT o código)</span>
            <input
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="identifier"
              autocomplete="off"
            />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Correo del administrador</span>
            <input
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              formControlName="adminEmail"
              type="email"
              autocomplete="email"
            />
          </label>

          <label class="block">
            <span class="text-sm text-slate-700">Dominio solicitado</span>
            <div class="mt-1 flex overflow-hidden rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-200">
              <input
                class="min-w-0 flex-1 border-0 px-3 py-2 outline-none"
                formControlName="domainSubdomain"
                placeholder="mi-empresa"
                autocomplete="off"
              />
              <span
                class="inline-flex shrink-0 items-center border-l border-slate-300 bg-slate-50 px-3 text-sm text-slate-500"
              >
                {{ domainSuffix }}
              </span>
            </div>
            <span class="mt-1 block text-xs text-slate-400">
              Solo minúsculas, números y guiones. Quedará como
              <span class="font-medium text-slate-600">{{ previewDomain }}</span>
            </span>
          </label>

          <button
            type="submit"
            class="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium disabled:opacity-60"
            [disabled]="loading || form.invalid || showSuccessModal"
          >
            {{ loading ? 'Enviando...' : 'Crear solicitud' }}
          </button>
        </form>

        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }
        @if (resendMessage) {
          <p class="text-sm text-emerald-700">{{ resendMessage }}</p>
        }

        <div class="space-y-2 text-sm">
          <button
            type="button"
            class="text-indigo-600 hover:underline disabled:opacity-60"
            [disabled]="resending || !canResend"
            (click)="resendVerification()"
          >
            {{ resending ? 'Reenviando...' : '¿No llegó el correo? Reenviar verificación' }}
          </button>
          <a routerLink="/login" class="block text-indigo-600 hover:underline">¿Ya tienes cuenta? Ingresar</a>
        </div>
      </section>
    </main>

    @if (showSuccessModal) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-success-title"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true"></div>

        <div
          class="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-900/20 animate-[fadeInUp_280ms_ease-out]"
        >
          <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400"></div>

          <div class="px-6 pb-6 pt-8 text-center">
            <div
              class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70"
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <h2 id="register-success-title" class="text-xl font-semibold tracking-tight text-slate-900">
              Solicitud creada
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              Revisa tu correo para verificar el email y continuar con la activación.
            </p>

            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              (click)="goToLogin()"
            >
              Ir a ingresar
            </button>

            <button
              type="button"
              class="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              [disabled]="resending"
              (click)="resendVerification(true)"
            >
              {{ resending ? 'Reenviando...' : 'Reenviar correo' }}
            </button>

            @if (resendMessage) {
              <p class="mt-3 text-sm leading-relaxed text-emerald-700">{{ resendMessage }}</p>
            }

            <p class="mt-3 text-xs text-slate-400">
              Te redirigimos automáticamente en {{ redirectSeconds }}s…
            </p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class RegisterPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly domainSuffix = DOMAIN_SUFFIX;

  loading = false;
  resending = false;
  error = '';
  resendMessage = '';
  showSuccessModal = false;
  redirectSeconds = 4;

  private redirectTimer: ReturnType<typeof setInterval> | null = null;

  form = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    identifier: ['', [Validators.required, Validators.minLength(2)]],
    adminEmail: ['', [Validators.required, Validators.email]],
    domainSubdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
  });

  get previewDomain(): string {
    const sub = String(this.form.value.domainSubdomain || '').trim().toLowerCase();
    return sub ? `${sub}${DOMAIN_SUFFIX}` : `tu-subdominio${DOMAIN_SUFFIX}`;
  }

  get canResend(): boolean {
    return !this.form.get('adminEmail')?.invalid;
  }

  ngOnDestroy(): void {
    this.clearRedirectTimer();
  }

  submit(): void {
    this.error = '';
    this.resendMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revisa los campos e inténtalo de nuevo.';
      return;
    }

    const value = this.form.getRawValue();
    const subdomain = String(value.domainSubdomain ?? '').trim().toLowerCase();
    this.loading = true;
    this.authApi
      .signupTenant({
        companyName: String(value.companyName ?? '').trim(),
        identifier: String(value.identifier ?? '').trim(),
        slug: subdomain,
        adminEmail: String(value.adminEmail ?? '').trim().toLowerCase(),
        requestedDomain: `${subdomain}${DOMAIN_SUFFIX}`,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.disable();
          this.openSuccessModal();
        },
        error: (err) => {
          const msg = err?.error?.message;
          this.error = Array.isArray(msg)
            ? msg.join(', ')
            : msg || 'No fue posible crear la solicitud. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  resendVerification(fromModal = false): void {
    this.error = '';
    this.resendMessage = '';
    const adminEmail = String(this.form.getRawValue().adminEmail ?? '').trim().toLowerCase();
    if (!adminEmail) {
      this.error = 'Ingresa el correo del administrador para reenviar.';
      return;
    }

    this.resending = true;
    this.authApi.resendSignupVerification({ adminEmail }).subscribe({
      next: (res) => {
        this.resending = false;
        this.resendMessage = res.message;
        if (fromModal && res.sent) {
          this.redirectSeconds = 4;
        }
      },
      error: (err) => {
        this.resending = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'No fue posible reenviar el correo.';
      },
    });
  }

  goToLogin(): void {
    this.clearRedirectTimer();
    void this.router.navigateByUrl('/login');
  }

  private openSuccessModal(): void {
    this.showSuccessModal = true;
    this.redirectSeconds = 4;
    this.clearRedirectTimer();
    this.redirectTimer = setInterval(() => {
      this.redirectSeconds -= 1;
      if (this.redirectSeconds <= 0) {
        this.goToLogin();
      }
    }, 1000);
  }

  private clearRedirectTimer(): void {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
      this.redirectTimer = null;
    }
  }
}
