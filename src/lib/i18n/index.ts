import type { Cookies } from '@sveltejs/kit';
import { messages as hu } from './hu';
import { messages as en } from './en';
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, type Messages } from './types';

const catalogs: Record<Locale, Messages> = { hu, en };

export type { Locale, Messages };
export { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from './types';

export function parseLocale(value: string | null | undefined): Locale {
	return value === 'en' ? 'en' : DEFAULT_LOCALE;
}

export function getLocaleFromCookies(cookies: Cookies): Locale {
	return parseLocale(cookies.get(LOCALE_COOKIE));
}

export function getMessages(locale: Locale): Messages {
	return catalogs[locale];
}

type Path = string;

function getByPath(obj: unknown, path: Path): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (acc && typeof acc === 'object' && key in acc) {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

export function t(locale: Locale, path: Path): string {
	const value = getByPath(getMessages(locale), path);
	return typeof value === 'string' ? value : path;
}

export function translateInvoiceCategory(locale: Locale, category: string): string {
	const map = getMessages(locale).invoices.categories as Record<string, string>;
	return map[category] ?? category;
}

export function translateIncomingStatus(locale: Locale, status: string): string {
	const map = getMessages(locale).invoices.incomingStatus as Record<string, string>;
	return map[status] ?? status;
}

export function translateOutgoingStatus(locale: Locale, status: string): string {
	const map = getMessages(locale).invoices.outgoingStatus as Record<string, string>;
	return map[status] ?? status;
}

export function translatePaymentType(
	locale: Locale,
	key: string
): { label: string; note: string } {
	const types = getMessages(locale).payments.types as Record<string, { label: string; note: string }>;
	return types[key] ?? { label: key, note: '' };
}

export function intlLocale(locale: Locale): string {
	return locale === 'hu' ? 'hu-HU' : 'en-US';
}
