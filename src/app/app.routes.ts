import { Routes } from '@angular/router';
import { AcceptOwnerInvitePageComponent } from './pages/accept-owner-invite/accept-owner-invite.page';
import { LoginPageComponent } from './pages/login/login.page';
import { ForgotPasswordPageComponent } from './pages/forgot-password/forgot-password.page';
import { ForgotUsernamePageComponent } from './pages/forgot-username/forgot-username.page';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password.page';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'accept-owner-invite', component: AcceptOwnerInvitePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'forgot-username', component: ForgotUsernamePageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
