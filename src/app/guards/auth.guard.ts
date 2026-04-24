import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  if (session.isAuthenticated()) return true;

  const loginQueryParams = (() => {
    if (!state.url) return undefined;
    const [path, queryString = ''] = state.url.split('?');
    if (path !== '/dashboard') {
      return { redirect: state.url };
    }
    const params = new URLSearchParams(queryString);
    const redirect = params.get('redirect');
    const returnUrl = params.get('returnUrl');
    const out: Record<string, string> = {};
    if (redirect) out['redirect'] = redirect;
    if (returnUrl) out['returnUrl'] = returnUrl;
    return Object.keys(out).length ? out : undefined;
  })();

  return router.createUrlTree(['/login'], {
    queryParams: loginQueryParams,
  });
};
