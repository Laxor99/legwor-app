export function formatHuf(amount: number | string | null | undefined): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat('hu-HU', {
		style: 'currency',
		currency: 'HUF',
		maximumFractionDigits: 0
	}).format(n);
}

export function formatEur(amount: number | string | null | undefined): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat('hu-HU', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(n);
}

export function formatNumber(amount: number | string | null | undefined, decimals = 2): string {
	const n = Number(amount ?? 0);
	return new Intl.NumberFormat('hu-HU', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(n);
}

export function formatRate(rate: number | string | null | undefined): string {
	return formatNumber(rate, 4);
}

export function parseNumber(value: string | number | null | undefined): number {
	if (value === null || value === undefined || value === '') return 0;
	const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
	return Number.isFinite(n) ? n : 0;
}
