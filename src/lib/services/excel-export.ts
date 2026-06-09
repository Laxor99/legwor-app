import * as XLSX from 'xlsx';
import type { YearMonth } from '$lib/utils/dates';
import { formatMonthHu } from '$lib/utils/dates';
import { calcPerKmRate } from '$lib/utils/calculations';
import { getCarSummary, getCarDefaults } from './car';
import { getAllConfig } from './config';

export async function buildCarExcel(ym: YearMonth): Promise<Buffer> {
	const [summary, defaults, config] = await Promise.all([
		getCarSummary(ym),
		getCarDefaults(),
		getAllConfig()
	]);

	const perKm = calcPerKmRate(
		defaults.consumptionNorm,
		defaults.navFuelPrice,
		defaults.amortization
	);
	const sheetName = `Car ${ym.year} ${String(ym.month).padStart(2, '0')}`;
	const serial = `${ym.year}/${String(ym.month).padStart(2, '0')}`;

	const rows: (string | number | null)[][] = [
		['Givaudan Business Solutions Kft. – Car Expense Report'],
		[`Period: ${formatMonthHu(ym)}`, '', `Serial: ${serial}`],
		[],
		['Employee', config.employee_name, 'Title', config.employee_title],
		['Company', config.company_short, 'Tax ID', config.company_tax],
		[],
		['Vehicle data'],
		['Plate', defaults.carPlate, 'Type', defaults.carType],
		['Fuel', defaults.carFuelType, 'Consumption (l/100km)', defaults.consumptionNorm],
		['NAV fuel price (Ft/l)', defaults.navFuelPrice, 'Amortization (Ft/km)', defaults.amortization],
		['Rate (Ft/km)', perKm, 'NAV link', defaults.navFuelUrl],
		[],
		['#', 'Date', 'From', 'To', 'Distance (km)', 'Amount (HUF)', 'Description', 'Project / Notes']
	];

	summary.trips.forEach((t, i) => {
		rows.push([
			i + 1,
			t.tripDate ?? '',
			t.fromLocation ?? '',
			t.toLocation ?? '',
			Number(t.distanceKm),
			Number(t.calculatedAmount),
			t.description ?? '',
			''
		]);
	});

	if (summary.motorwayCost > 0) {
		rows.push([
			'',
			'',
			'',
			'Motorway vignette',
			'',
			summary.motorwayCost,
			'Autópálya matrica',
			''
		]);
	}

	rows.push([]);
	rows.push(['', '', '', 'SUBTOTAL (trips)', summary.totalKm, summary.tripAmount, '', '']);
	rows.push(['', '', '', 'Motorway', '', summary.motorwayCost, '', '']);
	rows.push(['', '', '', 'TOTAL PAYABLE (HUF)', '', summary.totalAmount, '', '']);
	rows.push([]);
	rows.push(['Prepared by:', config.employee_name, 'Date:', new Date().toISOString().slice(0, 10)]);

	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet(rows);

	ws['!cols'] = [
		{ wch: 5 },
		{ wch: 12 },
		{ wch: 22 },
		{ wch: 22 },
		{ wch: 14 },
		{ wch: 14 },
		{ wch: 28 },
		{ wch: 20 }
	];

	XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

	const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
	return buf as Buffer;
}
