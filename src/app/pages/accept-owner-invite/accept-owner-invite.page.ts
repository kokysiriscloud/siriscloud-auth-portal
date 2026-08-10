import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-accept-owner-invite-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './accept-owner-invite.page.html',
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
export class AcceptOwnerInvitePageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);

  loading = false;
  error = '';
  showSuccessModal = false;
  redirectSeconds = 4;
  showPassword = false;
  showConfirmPassword = false;

  private redirectTimer: ReturnType<typeof setInterval> | null = null;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
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

  ngOnDestroy(): void {
    this.clearRedirectTimer();
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    this.error = '';
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
        password: password ?? '',
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.disable();
          this.openSuccessModal();
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'No fue posible activar la invitación.';
          this.loading = false;
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
