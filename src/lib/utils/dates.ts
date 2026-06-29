import type { Locale } from '$lib/i18n';

const MONTH_NAMES_HU = [
	'január',
	'február',
	'március',
	'április',
	'május',
	'június',
	'július',
	'augusztus',
	'szeptember',
	'október',
	'november',
	'december'
];

export interface YearMonth {
	year: number;
	month: number;
}

/** Active month = current calendar month minus 1 */
export function getDefaultActiveMonth(date = new Date()): YearMonth {
	const d = new Date(date);
	d.setMonth(d.getMonth() - 1);
	return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function yearMonthFromForm(form: FormData, url: URL): YearMonth {
	const fallback = getDefaultActiveMonth();
	const year = Number(form.get('year')) || Number(url.searchParams.get('year')) || fallback.year;
	const month = Number(form.get('month')) || Number(url.searchParams.get('month')) || fallback.month;
	return { year, month };
}

export function formatMonthHu({ year, month }: YearMonth): string {
	return `${year}. ${MONTH_NAMES_HU[month - 1]}`;
}

const MONTH_NAMES_EN = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export function formatMonthEn({ year, month }: YearMonth): string {
	return `${MONTH_NAMES_EN[month - 1]} ${year}`;
}

export function formatMonth(ym: YearMonth, locale: Locale = 'hu'): string {
	return locale === 'en' ? formatMonthEn(ym) : formatMonthHu(ym);
}

/** Month name only (no year) — for same-year lists. */
export function formatMonthLabel({ month }: YearMonth, locale: Locale = 'hu'): string {
	return locale === 'en' ? MONTH_NAMES_EN[month - 1] : MONTH_NAMES_HU[month - 1];
}

export function toMonthYear({ year, month }: YearMonth): string {
	return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseMonthYear(value: string): YearMonth | null {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (month < 1 || month > 12) return null;
	return { year, month };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
	const d = new Date(year, month - 1 + delta, 1);
	return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function monthOptions(count = 24): YearMonth[] {
	const start = getDefaultActiveMonth();
	const options: YearMonth[] = [];
	for (let i = 0; i < count; i++) {
		options.push(shiftMonth(start, -i));
	}
	return options;
}

/** All months in a calendar year (Jan → Dec). */
export function monthsInYear(year: number): YearMonth[] {
	return Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 }));
}

/** Years for selectors (newest first). */
export function yearOptions(fromYear = 2024): number[] {
	const current = new Date().getFullYear();
	const years: number[] = [];
	for (let y = current; y >= fromYear; y--) {
		years.push(y);
	}
	return years;
}

export function formatDateHu(dateStr: string | Date | null | undefined): string {
	if (!dateStr) return '';
	const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
	return d.toLocaleDateString('hu-HU');
}

export function formatDate(
	dateStr: string | Date | null | undefined,
	locale: Locale = 'hu'
): string {
	if (!dateStr) return '';
	const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
	return d.toLocaleDateString(locale === 'hu' ? 'hu-HU' : 'en-US');
}
