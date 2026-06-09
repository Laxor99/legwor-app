import { getDashboardData } from '$lib/services/dashboard';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const data = await getDashboardData({ year, month });
		return { year, month, ...data };
	} catch {
		return {
			year,
			month,
			worktime: { normalDays: 0, extraDays: 0, totalDays: 0, yearlyWorked: 0, limit: 220 },
			revenue: { eur: 0, huf: 0, rate: null },
			expenses: { hotel: 0, car: 0, fleetcor: 0, other: 0, byCategory: {} },
			payments: [],
			dbError: true
		};
	}
};
