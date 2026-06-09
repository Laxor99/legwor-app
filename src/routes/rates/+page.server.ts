import { fail } from '@sveltejs/kit';
import { getOrFetchRatesForMonth, selectRateForMonth } from '$lib/services/exchange-rate';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const rates = await getOrFetchRatesForMonth({ year, month });
		return { year, month, rates };
	} catch {
		return {
			year,
			month,
			rates: {
				spotRate: null,
				avg10d: null,
				avg30d: null,
				selectedRate: null,
				apiError: true,
				fromCache: false
			},
			dbError: true
		};
	}
};

export const actions: Actions = {
	select: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		const rateType = String(form.get('rateType')) as 'spot' | 'avg10d' | 'avg30d';
		const value = Number(form.get('value'));

		if (!value || value <= 0) return fail(400, { error: 'Érvénytelen árfolyam.' });

		try {
			await selectRateForMonth({ year, month }, rateType, value);
			return { success: true };
		} catch {
			return fail(500, { error: 'Mentés sikertelen.' });
		}
	}
};
