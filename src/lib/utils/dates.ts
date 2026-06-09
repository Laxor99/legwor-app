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

export function formatMonthHu({ year, month }: YearMonth): string {
	return `${year}. ${MONTH_NAMES_HU[month - 1]}`;
}

export function formatMonthEn({ year, month }: YearMonth): string {
	const en = [
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
	return `${en[month - 1]} ${year}`;
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

export function formatDateHu(dateStr: string | Date | null | undefined): string {
	if (!dateStr) return '';
	const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
	return d.toLocaleDateString('hu-HU');
}
