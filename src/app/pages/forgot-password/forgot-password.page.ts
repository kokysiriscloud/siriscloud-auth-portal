import { Component } from '@angular/core';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  template: `
    <main class="min-h-screen flex items-center justify-center p-4">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 class="text-2xl font-semibold">Recuperar contraseña</h1>
        <p class="text-slate-500">Pantalla base para enviar correo de recuperación.</p>
      </section>
    </main>
  `
})
export class ForgotPasswordPageComponent {}
