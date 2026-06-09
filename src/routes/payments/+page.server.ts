import { fail } from '@sveltejs/kit';
import { getPaymentsForMonth, upsertPayment } from '$lib/services/payments';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const payments = await getPaymentsForMonth({ year, month });
		return { year, month, payments };
	} catch {
		return { year, month, payments: [], dbError: true };
	}
};

export const actions: Actions = {
	save: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		const paymentType = String(form.get('paymentType'));
		try {
			await upsertPayment({
				year,
				month,
				paymentType,
				actualAmount: Number(form.get('actualAmount')),
				isPaid: form.get('isPaid') === 'on',
				paidDate: String(form.get('paidDate') ?? '') || null,
				bankAccount: String(form.get('bankAccount') ?? ''),
				notes: String(form.get('notes') ?? '')
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Mentés sikertelen.' });
		}
	}
};
