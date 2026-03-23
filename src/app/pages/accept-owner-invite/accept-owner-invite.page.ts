import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-accept-owner-invite-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './accept-owner-invite.page.html'
})
export class AcceptOwnerInvitePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  loading = false;
  success = '';
  error = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  token = '';
  domain = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.domain = this.route.snapshot.queryParamMap.get('domain') ?? window.location.host;
    if (!this.token || !this.domain) {
      this.error = 'Token o dominio faltante en la URL.';
    }
  }

  submit(): void {
    this.error = '';
    this.success = '';
    if (this.form.invalid) return;

    const { password, confirmPassword, fullName } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.authApi
      .acceptOwnerInvite({
        token: this.token,
        domain: this.domain,
        fullName: fullName ?? '',
        password: password ?? ''
      })
      .subscribe({
        next: () => {
          this.success = 'Cuenta activada correctamente. Ya puedes iniciar sesión.';
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'No fue posible activar la invitación.';
          this.loading = false;
        }
      });
  }
}
