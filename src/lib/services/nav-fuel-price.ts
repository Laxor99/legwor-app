import { formatMonthHu, matchHungarianMonthLabel, shiftMonth, type YearMonth } from '$lib/utils/dates';

export interface NavFuelPriceResult {
	price: number;
	monthLabel: string;
}

function stripTags(html: string): string {
	return html
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseStyle9Table(html: string): string[][] | null {
	const tableMatch = html.match(/<table[^>]*class="[^"]*style9[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
	if (!tableMatch) return null;

	const rows: string[][] = [];
	for (const rowMatch of tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
		const cells: string[] = [];
		for (const cellMatch of rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)) {
			cells.push(stripTags(cellMatch[1]));
		}
		if (cells.length > 0) rows.push(cells);
	}
	return rows.length > 0 ? rows : null;
}

function findEsz95MarketPriceColumn(header: string[]): number {
	const marketIdx = header.findIndex((cell) => {
		const normalized = cell.toLowerCase();
		return (
			normalized.includes('esz-95') &&
			normalized.includes('piaci árszabás') &&
			normalized.includes('motorbenzin')
		);
	});
	if (marketIdx >= 0) return marketIdx;

	// Older NAV pages only list a single ESZ-95 petrol column.
	return header.findIndex((cell) => {
		const normalized = cell.toLowerCase();
		return (
			normalized.includes('esz-95') &&
			normalized.includes('motorbenzin') &&
			!normalized.includes('gázolaj')
		);
	});
}

/** Parse ESZ-95 unleaded petrol market price (piaci árszabás) for a specific month from NAV HTML. */
export function parseNavEsz95MarketPriceForMonth(
	html: string,
	target: YearMonth
): NavFuelPriceResult | null {
	const rows = parseStyle9Table(html);
	if (!rows || rows.length < 2) return null;

	const colIdx = findEsz95MarketPriceColumn(rows[0]);
	if (colIdx < 0) return null;

	for (let i = 1; i < rows.length; i++) {
		const monthLabel = rows[i][0]?.trim();
		if (!monthLabel || !matchHungarianMonthLabel(monthLabel, target.month)) continue;

		const raw = rows[i][colIdx]?.trim();
		if (!raw || raw === '-') continue;

		const price = Number(raw.replace(/\s/g, '').replace(',', '.'));
		if (!Number.isFinite(price) || price <= 0) continue;

		return { price, monthLabel: formatMonthHu(target) };
	}

	return null;
}

/** @deprecated Use parseNavEsz95MarketPriceForMonth with an explicit month instead. */
export function parseNavEsz95MarketPrice(html: string): NavFuelPriceResult | null {
	const rows = parseStyle9Table(html);
	if (!rows || rows.length < 2) return null;

	const colIdx = findEsz95MarketPriceColumn(rows[0]);
	if (colIdx < 0) return null;

	for (let i = 1; i < rows.length; i++) {
		const monthLabel = rows[i][0]?.trim();
		const raw = rows[i][colIdx]?.trim();
		if (!raw || raw === '-') continue;

		const price = Number(raw.replace(/\s/g, '').replace(',', '.'));
		if (!Number.isFinite(price) || price <= 0) continue;

		return { price, monthLabel: monthLabel || '' };
	}

	return null;
}

export function navFuelUrlsForYear(baseUrl: string, year: number): string[] {
	const urls = new Set<string>();
	const fromBase = baseUrl.replace(
		/\/(\d{4})-(ban|ben)-alkalmazhato-uzemanyagarak/i,
		`/${year}-$2-alkalmazhato-uzemanyagarak`
	);
	if (fromBase !== baseUrl) urls.add(fromBase);
	urls.add(`https://nav.gov.hu/ugyfeliranytu/uzemanyag/${year}-ban-alkalmazhato-uzemanyagarak`);
	urls.add(`https://nav.gov.hu/ugyfeliranytu/uzemanyag/${year}-ben-alkalmazhato-uzemanyagarak`);
	return [...urls];
}

export function navFuelUrlForYear(baseUrl: string, year: number): string {
	return navFuelUrlsForYear(baseUrl, year)[0];
}

export async function fetchNavEsz95MarketPrice(
	url: string,
	target: YearMonth
): Promise<NavFuelPriceResult | null> {
	if (!url) return null;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 12_000);

	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'LegworAPP/1.0 (NAV fuel price sync)',
				Accept: 'text/html,application/xhtml+xml'
			}
		});
		if (!res.ok) return null;

		const html = await res.text();
		return parseNavEsz95MarketPriceForMonth(html, target);
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

/** NAV fuel price for the month before the active travel month. */
export async function syncNavFuelPriceForActiveMonth(
	navFuelUrl: string,
	activeMonth: YearMonth
): Promise<NavFuelPriceResult | null> {
	const fuelMonth = shiftMonth(activeMonth, -1);
	for (const url of navFuelUrlsForYear(navFuelUrl, fuelMonth.year)) {
		const result = await fetchNavEsz95MarketPrice(url, fuelMonth);
		if (result) return result;
	}
	return null;
}
