import { buildCarExcel } from '$lib/services/excel-export';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;

	const buffer = await buildCarExcel({ year, month });
	const filename = `Car ${year} ${String(month).padStart(2, '0')}.xlsx`;

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
