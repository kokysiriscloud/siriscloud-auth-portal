import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main class="min-h-screen flex items-center justify-center p-4">
      <section class="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-3">
        <h1 class="text-2xl font-semibold">Login</h1>
        <p class="text-slate-500">Pantalla base lista para conectar con endpoint de login.</p>
        <a routerLink="/forgot-password" class="text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</a>
      </section>
    </main>
  `
})
export class LoginPageComponent {}
