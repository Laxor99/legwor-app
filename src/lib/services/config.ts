import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { appConfig } from '$lib/db/schema';

export const DEFAULT_CONFIG: Record<string, string> = {
	nav_fuel_url:
		'https://nav.gov.hu/ugyfeliranytu/uzemanyag/2026-ban-alkalmazhato-uzemanyagarak',
	annual_day_limit: '220',
	car_plate: 'SSU-813',
	car_type: 'BMW 218i',
	car_fuel_type: 'Benzin',
	car_consumption: '8.6',
	car_amortization: '25',
	nav_fuel_price: '595',
	employee_name: 'Ferenc Kiss',
	employee_title: 'Automation Technology Manager / IT Local Business Partner',
	employee_tax_id: '',
	company_name: 'LEGWOR LABS SZÁMÍTÁSTECHNIKAI KERESKEDELMI ÉS SZOLGÁLTATÓ BETÉTI TÁRSASÁG',
	company_short: 'Legwor Labs Bt.',
	company_address: '9700 Szombathely, Irottkő u. 5.',
	company_tax: '21480799-2-18',
	company_reg: '18 06 104897',
	givaudan_client: 'Givaudan Business Solutions Kft.',
	vincent_name: 'Vincent Dupuis',
	vincent_email: '',
	marica_name: 'Marica',
	marica_email: ''
};

export async function getConfig(key: string): Promise<string> {
	const row = await db.query.appConfig.findFirst({ where: eq(appConfig.key, key) });
	return row?.value ?? DEFAULT_CONFIG[key] ?? '';
}

export async function getAllConfig(): Promise<Record<string, string>> {
	const rows = await db.select().from(appConfig);
	const result = { ...DEFAULT_CONFIG };
	for (const row of rows) {
		result[row.key] = row.value ?? '';
	}
	return result;
}

export async function setConfig(key: string, value: string): Promise<void> {
	await db
		.insert(appConfig)
		.values({ key, value, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: appConfig.key,
			set: { value, updatedAt: new Date() }
		});
}

export async function getAnnualLimit(year: number): Promise<number> {
	const yearKey = `annual_limit_${year}`;
	const yearCfg = await getConfig(yearKey);
	if (yearCfg) return Number(yearCfg) || 220;

	const { monthConfig } = await import('$lib/db/schema');
	const { desc } = await import('drizzle-orm');
	const row = await db.query.monthConfig.findFirst({
		where: (t, { eq: e }) => e(t.year, year),
		orderBy: (t) => [desc(t.month)]
	});
	if (row?.annualLimit) return row.annualLimit;

	const cfg = await getConfig('annual_day_limit');
	return Number(cfg) || 220;
}

export async function setAnnualLimit(year: number, limit: number): Promise<void> {
	await setConfig(`annual_limit_${year}`, String(limit));
	const { monthConfig } = await import('$lib/db/schema');
	const { eq: e } = await import('drizzle-orm');
	const rows = await db.select().from(monthConfig).where(e(monthConfig.year, year));
	for (const row of rows) {
		await db.update(monthConfig).set({ annualLimit: limit }).where(e(monthConfig.id, row.id));
	}
}
