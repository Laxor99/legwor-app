// @ts-expect-error pdfmake ships without TS types
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { YearMonth } from '$lib/utils/dates';
import { formatMonthHu } from '$lib/utils/dates';
import { getCarSummary, getCarDefaults } from './car';
import { getAllConfig } from './config';

const fonts = {
	Roboto: {
		normal: 'Helvetica',
		bold: 'Helvetica-Bold',
		italics: 'Helvetica-Oblique',
		bolditalics: 'Helvetica-BoldOblique'
	}
};

export async function buildCarPdf(ym: YearMonth): Promise<Buffer> {
	const [summary, defaults, config] = await Promise.all([
		getCarSummary(ym),
		getCarDefaults(),
		getAllConfig()
	]);

	const tableBody: Content[][] = [
		[
			{ text: 'Honnan', bold: true },
			{ text: 'Hová', bold: true },
			{ text: 'km', bold: true },
			{ text: 'Összeg (HUF)', bold: true }
		],
		...summary.trips.map((t) => [
			t.fromLocation ?? '',
			t.toLocation ?? '',
			String(t.distanceKm),
			String(Number(t.calculatedAmount).toLocaleString('hu-HU'))
		])
	];

	const docDefinition: TDocumentDefinitions = {
		pageSize: 'A4',
		content: [
			{ text: config.givaudan_client, style: 'header' },
			{ text: `Elszámolási lap – ${formatMonthHu(ym)}`, style: 'subheader' },
			{ text: `Sorszám: ${ym.year}/${String(ym.month).padStart(2, '0')}`, margin: [0, 0, 0, 10] },
			{
				columns: [
					{ text: `Alkalmazott: ${config.employee_name}` },
					{ text: `Beosztás: ${config.employee_title}` }
				],
				margin: [0, 0, 0, 10]
			},
			{
				text: `Rendszám: ${defaults.carPlate} | Típus: ${defaults.carType} | Üzemanyag: ${defaults.carFuelType}`,
				margin: [0, 0, 0, 5]
			},
			{
				text: `Fogyasztás: ${defaults.consumptionNorm} l/100km | NAV ár: ${defaults.navFuelPrice} Ft/l | Amortizáció: ${defaults.amortization} Ft/km`,
				margin: [0, 0, 0, 5]
			},
			{ text: `NAV: ${defaults.navFuelUrl}`, fontSize: 8, color: 'blue', margin: [0, 0, 0, 15] },
			{ table: { headerRows: 1, widths: ['*', '*', 50, 80], body: tableBody }, margin: [0, 0, 0, 15] },
			{
				columns: [
					{ text: `TOTAL km: ${summary.totalKm}`, bold: true },
					{
						text: `Összesen: ${summary.totalAmount.toLocaleString('hu-HU')} HUF`,
						bold: true,
						alignment: 'right'
					}
				]
			}
		],
		styles: {
			header: { fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
			subheader: { fontSize: 12, margin: [0, 0, 0, 10] }
		},
		defaultStyle: { font: 'Roboto', fontSize: 10 }
	};

	const printer = new PdfPrinter(fonts);
	const pdfDoc = printer.createPdfKitDocument(docDefinition);

	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
		pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
		pdfDoc.on('error', reject);
		pdfDoc.end();
	});
}
