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

/** Parse ESZ-95 unleaded petrol market price (piaci árszabás) from NAV HTML table. */
export function parseNavEsz95MarketPrice(html: string): NavFuelPriceResult | null {
	const rows = parseStyle9Table(html);
	if (!rows || rows.length < 2) return null;

	const header = rows[0];
	const colIdx = header.findIndex((cell) => {
		const normalized = cell.toLowerCase();
		return (
			normalized.includes('esz-95') &&
			normalized.includes('piaci árszabás') &&
			normalized.includes('motorbenzin')
		);
	});
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

export async function fetchNavEsz95MarketPrice(
	url: string
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
		return parseNavEsz95MarketPrice(html);
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export async function syncNavFuelPriceFromWebsite(navFuelUrl: string): Promise<{
	price: number;
	monthLabel: string;
} | null> {
	const result = await fetchNavEsz95MarketPrice(navFuelUrl);
	if (!result) return null;

	const { setConfig } = await import('./config');
	await setConfig('nav_fuel_price', String(result.price));
	return result;
}
