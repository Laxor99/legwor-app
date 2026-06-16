import { buildMonthlyChecklist } from '$lib/services/monthly-checklist';
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
		const ym = { year, month };
		return {
			year,
			month,
			worktime: { normalDays: 0, extraDays: 0, totalDays: 0, yearlyWorked: 0, limit: 220 },
			revenue: { eur: 0, huf: 0, rate: null },
			expenses: { hotel: 0, car: 0, fleetcor: 0, other: 0, byCategory: {} },
			payments: [],
			checklist: buildMonthlyChecklist(ym, {
				eurRate: null,
				worktime: { totalDays: 0 },
				revenue: { eur: 0 },
				incomingCount: 0,
				car: { tripCount: 0, motorwayCost: 0 },
				payments: []
			}),
			dbError: true
		};
	}
};
