import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-verify-signup-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div class="flex items-center justify-center gap-4">
          <img
            src="/logo.png"
            alt="SirisCloud"
            width="64"
            height="64"
            class="h-16 w-16 object-contain drop-shadow"
            loading="eager"
            decoding="async"
          />
          <div class="text-left">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">SirisCloud</p>
            <h1 class="text-2xl font-semibold text-slate-900">Verificar registro</h1>
          </div>
        </div>

        @if (loading) {
          <p class="text-sm text-slate-600">Verificando tu solicitud...</p>
        }

        @if (ok) {
          <div class="space-y-3">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p class="font-semibold">Organización creada correctamente.</p>
              @if (domain) {
                <p class="mt-1 text-emerald-800">Dominio: {{ domain }}</p>
              }
            </div>

            <div class="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700 space-y-2">
              <p class="font-semibold text-slate-900">Siguiente paso: crea tu contraseña</p>
              <p>
                Todavía no puedes ingresar. Te enviamos un segundo correo a
                <span class="font-medium text-slate-900">{{ ownerEmail }}</span>
                con el asunto de acceso inicial / invitación.
              </p>
              <ol class="list-decimal space-y-1 pl-5 text-slate-600">
                <li>Abre ese correo (revisa spam si no lo ves).</li>
                <li>Haz clic en <span class="font-medium">Activar acceso</span>.</li>
                <li>Define tu nombre y contraseña.</li>
                <li>Luego sí podrás iniciar sesión.</li>
              </ol>
            </div>
          </div>
        }

        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }

        @if (ok) {
          <p class="text-xs text-slate-400">
            Cuando actives la cuenta, usa
            <a routerLink="/login" class="text-indigo-600 hover:underline">Ir a ingresar</a>.
          </p>
        } @else if (!loading) {
          <a routerLink="/login" class="block text-sm text-indigo-600 hover:underline">Ir a ingresar</a>
        }
      </section>
    </main>
  `,
})
export class VerifySignupPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  loading = true;
  ok = false;
  error = '';
  domain = '';
  ownerEmail = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.loading = false;
      this.error = 'Falta el token de verificación en la URL.';
      return;
    }

    this.authApi.verifySignup({ token }).subscribe({
      next: (res) => {
        this.ok = true;
        this.domain = res.domain || '';
        this.ownerEmail = res.ownerEmail || '';
        this.loading = false;
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'No fue posible verificar el registro. El enlace puede ser inválido o haber expirado.';
        this.loading = false;
      },
    });
  }
}
