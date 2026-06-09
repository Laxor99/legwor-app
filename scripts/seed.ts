import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema';

const DEFAULT_CONFIG: Record<string, string> = {
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
	givaudan_client: 'Givaudan Business Solutions Kft.'
};

const connectionString =
	process.env.DATABASE_URL ?? 'postgresql://legwor:legwor@localhost:5432/legwor';

async function seed() {
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });

	console.log('Seeding app_config...');
	for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
		await db
			.insert(schema.appConfig)
			.values({ key, value })
			.onConflictDoUpdate({
				target: schema.appConfig.key,
				set: { value }
			});
	}

	console.log('Seeding Helvetic contract...');
	const existing = await db.query.contracts.findFirst({
		where: (t, { eq }) => eq(t.clientName, 'Helvetic (Givaudan)')
	});
	if (!existing) {
		await db.insert(schema.contracts).values({
			clientName: 'Helvetic (Givaudan)',
			contractNumber: 'Helvetic',
			startDate: '2020-01-01',
			dailyRate: '8640',
			currency: 'EUR',
			paymentTerms: 'Havi elszámolás',
			status: 'active',
			notes: 'Aktív szerződés – Givaudan'
		});
	}

	console.log('Seed complete.');
	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
