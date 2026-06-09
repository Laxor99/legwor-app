import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { eurRates, monthConfig } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';

interface FrankfurterLatest {
	rates: { HUF: number };
	date: string;
}

interface FrankfurterRange {
	rates: Record<string, { HUF: number }>;
}

async function fetchJson<T>(url: string): Promise<T | null> {
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		return (await res.json()) as T;
	} catch {
		return null;
	}
}

function averageRates(rates: Record<string, { HUF: number }>): number | null {
	const values = Object.values(rates).map((r) => r.HUF);
	if (values.length === 0) return null;
	return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10000) / 10000;
}

export async function fetchEurRates() {
	const today = new Date().toISOString().slice(0, 10);
	const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	const [latest, range10, range30] = await Promise.all([
		fetchJson<FrankfurterLatest>('https://api.frankfurter.app/latest?from=EUR&to=HUF'),
		fetchJson<FrankfurterRange>(
			`https://api.frankfurter.app/${tenDaysAgo}..${today}?from=EUR&to=HUF`
		),
		fetchJson<FrankfurterRange>(
			`https://api.frankfurter.app/${thirtyDaysAgo}..${today}?from=EUR&to=HUF`
		)
	]);

	return {
		spotRate: latest?.rates.HUF ?? null,
		avg10d: range10 ? averageRates(range10.rates) : null,
		avg30d: range30 ? averageRates(range30.rates) : null,
		source: 'frankfurter.app',
		fetchedAt: today
	};
}

export async function getOrFetchRatesForMonth({ year, month }: YearMonth) {
	const existing = await db.query.eurRates.findFirst({
		where: and(eq(eurRates.year, year), eq(eurRates.month, month))
	});

	const fetched = await fetchEurRates();

	if (!fetched.spotRate && existing) {
		return {
			...existing,
			spotRate: existing.spotRate ? Number(existing.spotRate) : null,
			avg10d: existing.avg10d ? Number(existing.avg10d) : null,
			avg30d: existing.avg30d ? Number(existing.avg30d) : null,
			selectedRate: existing.selectedRate ? Number(existing.selectedRate) : null,
			fromCache: true,
			apiError: true
		};
	}

	const data = {
		year,
		month,
		spotRate: fetched.spotRate?.toString() ?? existing?.spotRate ?? null,
		avg10d: fetched.avg10d?.toString() ?? existing?.avg10d ?? null,
		avg30d: fetched.avg30d?.toString() ?? existing?.avg30d ?? null,
		selectedRate: existing?.selectedRate ?? null,
		selectedAt: existing?.selectedAt ?? null,
		source: fetched.source
	};

	if (existing) {
		await db
			.update(eurRates)
			.set({
				spotRate: data.spotRate,
				avg10d: data.avg10d,
				avg30d: data.avg30d,
				source: data.source
			})
			.where(eq(eurRates.id, existing.id));
	} else {
		await db.insert(eurRates).values(data);
	}

	const row = await db.query.eurRates.findFirst({
		where: and(eq(eurRates.year, year), eq(eurRates.month, month))
	});

	return {
		...row,
		spotRate: row?.spotRate ? Number(row.spotRate) : null,
		avg10d: row?.avg10d ? Number(row.avg10d) : null,
		avg30d: row?.avg30d ? Number(row.avg30d) : null,
		selectedRate: row?.selectedRate ? Number(row.selectedRate) : null,
		fromCache: false,
		apiError: !fetched.spotRate
	};
}

export async function selectRateForMonth(
	{ year, month }: YearMonth,
	rateType: 'spot' | 'avg10d' | 'avg30d',
	value: number
) {
	await db
		.update(eurRates)
		.set({ selectedRate: value.toString(), selectedAt: new Date() })
		.where(and(eq(eurRates.year, year), eq(eurRates.month, month)));

	const existing = await db.query.monthConfig.findFirst({
		where: and(eq(monthConfig.year, year), eq(monthConfig.month, month))
	});
	if (existing) {
		await db
			.update(monthConfig)
			.set({ activeEurRate: value.toString() })
			.where(eq(monthConfig.id, existing.id));
	} else {
		await db.insert(monthConfig).values({
			year,
			month,
			activeEurRate: value.toString()
		});
	}
}

export async function getSelectedRate({ year, month }: YearMonth): Promise<number | null> {
	const row = await db.query.eurRates.findFirst({
		where: and(eq(eurRates.year, year), eq(eurRates.month, month))
	});
	if (row?.selectedRate) return Number(row.selectedRate);

	const cfg = await db.query.monthConfig.findFirst({
		where: and(eq(monthConfig.year, year), eq(monthConfig.month, month))
	});
	if (cfg?.activeEurRate) return Number(cfg.activeEurRate);
	return null;
}
