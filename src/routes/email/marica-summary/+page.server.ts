import { getDashboardData } from '$lib/services/dashboard';
import { getInvoicesForMonth } from '$lib/services/invoices';
import { getConfig } from '$lib/services/config';
import { getDefaultActiveMonth, formatMonthHu } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { setConfig } from '$lib/services/config';
import { t } from '$lib/i18n';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [dashboard, invoices, maricaSent] = await Promise.all([
			getDashboardData({ year, month }),
			getInvoicesForMonth({ year, month }, 'incoming'),
			getConfig(`marica_sent_${year}_${month}`)
		]);
		return {
			year,
			month,
			dashboard,
			invoices,
			monthHu: formatMonthHu({ year, month }),
			maricaSent: maricaSent === '1' || maricaSent === 'true'
		};
	} catch {
		return {
			year,
			month,
			dashboard: null,
			invoices: [],
			monthHu: formatMonthHu({ year, month }),
			maricaSent: false,
			dbError: true
		};
	}
};

export const actions: Actions = {
	markSent: async ({ request, url, locals }) => {
		const form = await request.formData();
		const year = Number(form.get('year')) || Number(url.searchParams.get('year'));
		const month = Number(form.get('month')) || Number(url.searchParams.get('month'));
		try {
			await setConfig(`marica_sent_${year}_${month}`, '1');
			return { success: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'errors.saveFailed') });
		}
	}
};
