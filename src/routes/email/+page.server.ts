import { getDashboardData } from '$lib/services/dashboard';
import { getInvoicesForMonth } from '$lib/services/invoices';
import { getDefaultActiveMonth, formatMonthEn, formatMonthHu } from '$lib/utils/dates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [dashboard, invoices] = await Promise.all([
			getDashboardData({ year, month }),
			getInvoicesForMonth({ year, month }, 'incoming')
		]);
		return { year, month, dashboard, invoices, monthHu: formatMonthHu({ year, month }), monthEn: formatMonthEn({ year, month }) };
	} catch {
		return {
			year,
			month,
			dashboard: null,
			invoices: [],
			monthHu: formatMonthHu({ year, month }),
			monthEn: formatMonthEn({ year, month }),
			dbError: true
		};
	}
};
