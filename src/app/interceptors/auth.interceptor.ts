import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSessionService } from '../services/auth-session.service';

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/forgot-username',
  '/api/auth/owner/accept-invite',
  '/api/auth/reset-password',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSessionService);

  const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));
  if (isPublicAuthPath) return next(req);

  const token = session.getAccessToken();
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
