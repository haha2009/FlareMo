// CONTRACT:
// Locale bundles are standalone. Adding a locale requires updating Locale,
// AVAILABLE_LOCALES, browser-language detection, and the locale file itself.
export type Locale =
  | 'en'
  | 'zh-CN'
  | 'zh-TW'
  | 'ru'
  | 'es';

import enMessages from './i18n/locales/en';
import zhCNMessages from './i18n/locales/zh-CN';
import zhTWMessages from './i18n/locales/zh-TW';
import ruMessages from './i18n/locales/ru';
import esMessages from './i18n/locales/es';

const LOCALE_STORAGE_KEY = 'flarermo.locale';

type MessageTable = Record<string, string>;

export const AVAILABLE_LOCALES: readonly { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
];

const ALL_MESSAGES: Record<Locale, MessageTable> = {
  'en': enMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
  'ru': ruMessages,
  'es': esMessages,
};

function isLocale(value: unknown): value is Locale {
  return AVAILABLE_LOCALES.some((item) => item.value === value);
}

function resolveInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // ignore storage errors
  }
  if (typeof navigator !== 'undefined') {
    const langs = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const lang of langs) {
      const normalized = String(lang || '').toLowerCase();
      if (normalized === 'zh-tw' || normalized === 'zh-hk' || normalized === 'zh-mo' || normalized.includes('hant')) return 'zh-TW';
      if (normalized.startsWith('zh')) return 'zh-CN';
      if (normalized.startsWith('ru')) return 'ru';
      if (normalized.startsWith('es')) return 'es';
    }
  }
  return 'zh-CN';
}

let locale: Locale = resolveInitialLocale();
let activeMessages: MessageTable = ALL_MESSAGES[locale];

function syncDocumentLanguage(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
}

syncDocumentLanguage();

export type I18nParams = Record<string, string | number | null | undefined>;

export function t(key: string, params?: I18nParams): string {
  const template = activeMessages[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
}

export function translateServerError(message: string | null | undefined, fallback: string): string {
  const normalized = String(message || '').trim();
  if (!normalized) return fallback;

  const rateLimitMatch = normalized.match(/^Rate limit exceeded\. Try again in (\d+) seconds\.$/i);
  if (rateLimitMatch) {
    return t('txt_rate_limit_try_again_seconds', { seconds: rateLimitMatch[1] });
  }

  const key = {
    'Account is disabled': 'txt_server_error_account_disabled',
    'Client IP is required': 'txt_server_error_client_ip_required',
    'ClientId or clientSecret is incorrect. Try again': 'txt_server_error_client_credentials_incorrect',
    'Email already registered': 'txt_server_error_email_already_registered',
    'Email and password are required': 'txt_server_error_email_password_required',
    'Email is required': 'txt_server_error_email_required',
    'Invite code is invalid or expired': 'txt_server_error_invite_invalid_or_expired',
    'Invite code is required': 'txt_server_error_invite_required',
    'Invalid refresh token': 'txt_server_error_invalid_refresh_token',
    'Invalid request payload': 'txt_server_error_invalid_request_payload',
    'JWT_SECRET is not set': 'txt_server_error_jwt_secret_missing',
    'JWT_SECRET is using the default/sample value. Please change it.': 'txt_server_error_jwt_secret_default',
    'JWT_SECRET must be at least 32 characters': 'txt_server_error_jwt_secret_too_short',
    'Parameter error': 'txt_server_error_parameter_error',
    'Refresh token is required': 'txt_server_error_refresh_token_required',
    'Registration is temporarily unavailable, retry once': 'txt_server_error_registration_retry',
    'TOTP token is required': 'txt_server_error_totp_token_required',
    'Two factor required.': 'txt_server_error_two_factor_required',
    'Two-step token is invalid. Try again.': 'txt_server_error_two_factor_invalid',
    'Username or password is incorrect. Try again': 'txt_server_error_username_password_incorrect',
  }[normalized];

  return key ? t(key) : normalized;
}

export function getLocale(): Locale {
  return locale;
}

export async function setLocale(next: Locale): Promise<void> {
  if (!isLocale(next)) return;
  locale = next;
  activeMessages = ALL_MESSAGES[next];
  syncDocumentLanguage();
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // ignore storage errors
  }
}

export async function initI18n(): Promise<void> {
  syncDocumentLanguage();
}
