import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  template: `
    <main class="min-h-screen flex items-center justify-center p-4">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 class="text-2xl font-semibold">Restablecer contraseña</h1>
        <p class="text-slate-500">Pantalla base para aplicar token de recuperación y nueva clave.</p>
      </section>
    </main>
  `
})
export class ResetPasswordPageComponent {}
