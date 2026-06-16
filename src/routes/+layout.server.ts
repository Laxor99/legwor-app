import { getSelectedRate } from '$lib/services/exchange-rate';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const year = Number(url.searchParams.get('year')) || getDefaultActiveMonth().year;
	const month = Number(url.searchParams.get('month')) || getDefaultActiveMonth().month;
	let eurRate: number | null = null;
	try {
		eurRate = await getSelectedRate({ year, month });
	} catch {
		eurRate = null;
	}
	return { year, month, eurRate, locale: locals.locale };
};
