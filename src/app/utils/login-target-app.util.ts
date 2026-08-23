import type { TenantLauncherApp } from '../services/auth-api.service';

export interface LoginTargetApp {
  appKey?: string;
  appName: string;
  sectionLabel?: string;
}

const LYNEX_APP_KEY = 'lynex-platform';
const LYNEX_APP_NAME = 'Lynex';

const LYNEX_PATH_SECTIONS: Record<string, string> = {
  correo: 'Correo',
  whatsapp: 'WhatsApp',
  'chat-web': 'Chat Web',
  inbox: 'WhatsApp',
  plan: 'Plan y facturación',
  bot: 'Bot',
  flows: 'Flows',
  usuarios: 'Usuarios',
  equipos: 'Equipos',
  status: 'Estado',
  billing: 'Facturación',
  connect: 'Conexión Meta',
};

function extractLynexSection(pathname: string): string | undefined {
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  const rootIdx = parts.findIndex((p) => p === 'lynex' || p === 'meta');
  if (rootIdx === -1) return undefined;
  const section = parts[rootIdx + 1];
  if (!section) return undefined;
  return LYNEX_PATH_SECTIONS[section] ?? section.replace(/-/g, ' ');
}

function isLynexProductPath(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return path.includes('/lynex') || path.includes('/meta/');
}

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** Resuelve la app destino desde query (`appKey`, `appName`, `redirect`). */
export function resolveLoginTargetFromUrl(searchParams: URLSearchParams): LoginTargetApp | null {
  const redirectRaw = searchParams.get('redirect');
  const appKey = searchParams.get('appKey')?.trim() || undefined;
  const appName = searchParams.get('appName')?.trim() || undefined;

  if (!redirectRaw && !appKey && !appName) return null;

  let resolved: LoginTargetApp = {
    appKey,
    appName: appName || 'Aplicación SirisCloud',
  };

  const redirectUrl = redirectRaw ? tryParseUrl(redirectRaw) : null;
  if (redirectUrl && isLynexProductPath(redirectUrl.pathname)) {
    resolved.appKey = appKey || LYNEX_APP_KEY;
    resolved.appName = appName || LYNEX_APP_NAME;
    const section = extractLynexSection(redirectUrl.pathname);
    if (section) resolved.sectionLabel = section;
  }

  if (appName) resolved.appName = appName;
  if (appKey) resolved.appKey = appKey;

  return resolved;
}

/** Cruza el redirect con apps del launcher del tenant para obtener el nombre del catálogo. */
export function refineLoginTargetFromLauncherApps(
  redirectRaw: string | null,
  apps: TenantLauncherApp[],
  current: LoginTargetApp | null,
): LoginTargetApp | null {
  if (!redirectRaw) return current;

  const redirectUrl = tryParseUrl(redirectRaw);
  if (!redirectUrl) return current;

  const matched = apps.find((app) => {
    const launch = tryParseUrl(app.launchUrl);
    return launch && launch.origin === redirectUrl.origin;
  });

  if (!matched) return current;

  const section = isLynexProductPath(redirectUrl.pathname)
    ? extractLynexSection(redirectUrl.pathname)
    : current?.sectionLabel;

  return {
    appKey: matched.appKey,
    appName: matched.name,
    sectionLabel: section ?? current?.sectionLabel,
  };
}

export function formatLoginTargetLabel(target: LoginTargetApp): string {
  if (target.sectionLabel) {
    return `${target.appName} · ${target.sectionLabel}`;
  }
  return target.appName;
}
