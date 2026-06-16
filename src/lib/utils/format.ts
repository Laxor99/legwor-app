import type { Locale } from '$lib/i18n';
import { intlLocale } from '$lib/i18n';

export function formatHuf(
	amount: number | string | null | undefined,
	locale: Locale = 'hu'
): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat(intlLocale(locale), {
		style: 'currency',
		currency: 'HUF',
		maximumFractionDigits: 0
	}).format(n);
}

export function formatEur(
	amount: number | string | null | undefined,
	locale: Locale = 'hu'
): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat(intlLocale(locale), {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(n);
}

export function formatNumber(
	amount: number | string | null | undefined,
	decimals = 2,
	locale: Locale = 'hu'
): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat(intlLocale(locale), {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(n);
}

export function formatRate(rate: number | string | null | undefined): string {
	return formatNumber(rate, 4);
}

export function parseNumber(value: string | number | null | undefined): number {
	if (value === null || value === undefined || value === '') return 0;
	const n = Number(String(value).replace(/\s/g, '').replace(/,/g, ''));
	return Number.isFinite(n) ? n : 0;
}

/** Format digits with comma thousands separators while typing */
export function formatInputNumber(value: string | number, decimals = 0): string {
	if (value === '' || value === null || value === undefined) return '';

	let str = String(value).replace(/,/g, '');
	if (!str) return '';

	const trailingDot = str.endsWith('.');
	const [rawInt = '', rawDec = ''] = str.split('.');
	const intDigits = rawInt.replace(/\D/g, '');
	if (!intDigits && !rawDec && !trailingDot) return '';

	const formattedInt = (intDigits || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	const displayInt = intDigits ? formattedInt : '0';

	if (decimals === 0) {
		return intDigits ? formattedInt : '';
	}

	const dec = rawDec.replace(/\D/g, '').slice(0, decimals);
	if (trailingDot && !dec) return `${displayInt}.`;
	if (dec) return `${displayInt}.${dec}`;
	return displayInt;
}
