import { getSelectedRate } from '$lib/services/exchange-rate';
import { getMonthStatusList } from '$lib/services/month-status';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const year = Number(url.searchParams.get('year')) || getDefaultActiveMonth().year;
	const month = Number(url.searchParams.get('month')) || getDefaultActiveMonth().month;
	let eurRate: number | null = null;
	let monthStatuses: Awaited<ReturnType<typeof getMonthStatusList>> = [];
	try {
		[eurRate, monthStatuses] = await Promise.all([
			getSelectedRate({ year, month }),
			getMonthStatusList({ year, month })
		]);
	} catch {
		eurRate = null;
		monthStatuses = [];
	}
	return { year, month, eurRate, locale: locals.locale, monthStatuses };
};
