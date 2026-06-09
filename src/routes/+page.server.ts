import { redirect } from '@sveltejs/kit';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = url.searchParams.get('year') ?? String(ym.year);
	const month = url.searchParams.get('month') ?? String(ym.month);
	throw redirect(302, `/dashboard?year=${year}&month=${month}`);
};
