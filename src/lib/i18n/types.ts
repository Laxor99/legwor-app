export type Locale = 'hu' | 'en';

export const LOCALES: Locale[] = ['hu', 'en'];
export const DEFAULT_LOCALE: Locale = 'hu';
export const LOCALE_COOKIE = 'legwor_locale';

export type Messages = typeof import('./hu').messages;
