import { getMonthStatusList } from '$lib/services/month-status';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const year = Number(url.searchParams.get('year')) || getDefaultActiveMonth().year;
	const month = Number(url.searchParams.get('month')) || getDefaultActiveMonth().month;
	let monthStatuses: Awaited<ReturnType<typeof getMonthStatusList>> = [];
	try {
		monthStatuses = await getMonthStatusList({ year, month });
	} catch {
		monthStatuses = [];
	}
	return { year, month, locale: locals.locale, monthStatuses };
};
