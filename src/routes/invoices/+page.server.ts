import { fail } from '@sveltejs/kit';
import {
	attachInvoiceFile,
	createFleetCorQuick,
	createInvoice,
	deleteInvoice,
	getInvoicesForMonth,
	updateInvoice
} from '$lib/services/invoices';
import { savePdfUpload } from '$lib/services/uploads';
import { db } from '$lib/db';
import { getDefaultActiveMonth, toMonthYear } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

async function optionalPdf(form: FormData, subdir: string): Promise<string | undefined> {
	const file = form.get('pdf') as File | null;
	if (!file || file.size === 0) return undefined;
	return savePdfUpload(file, subdir);
}

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [incoming, outgoing, allContracts] = await Promise.all([
			getInvoicesForMonth({ year, month }, 'incoming'),
			getInvoicesForMonth({ year, month }, 'outgoing'),
			db.query.contracts.findMany()
		]);
		return { year, month, incoming, outgoing, contracts: allContracts };
	} catch {
		return { year, month, incoming: [], outgoing: [], contracts: [], dbError: true };
	}
};

export const actions: Actions = {
	createIncoming: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		try {
			const filePath = await optionalPdf(form, 'invoices');
			await createInvoice({
				type: 'incoming',
				issuer: String(form.get('issuer')),
				invoiceNumber: String(form.get('invoiceNumber')),
				invoiceDate: String(form.get('invoiceDate')),
				netAmount: Number(form.get('netAmount')),
				vatAmount: Number(form.get('vatAmount')),
				grossAmount: Number(form.get('grossAmount')),
				currency: String(form.get('currency') ?? 'HUF'),
				category: String(form.get('category')),
				monthYear: toMonthYear({ year, month }),
				paymentStatus: String(form.get('paymentStatus') ?? 'Fizetendő'),
				notes: String(form.get('notes') ?? ''),
				filePath,
				year,
				month
			});
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Mentés sikertelen.' });
		}
	},
	createOutgoing: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		const contractId = form.get('contractId') ? Number(form.get('contractId')) : undefined;
		try {
			const filePath = await optionalPdf(form, 'invoices');
			await createInvoice({
				type: 'outgoing',
				recipient: String(form.get('recipient')),
				invoiceNumber: String(form.get('invoiceNumber')),
				invoiceDate: String(form.get('invoiceDate')),
				grossAmount: Number(form.get('grossAmount')),
				currency: String(form.get('currency') ?? 'EUR'),
				monthYear: toMonthYear({ year, month }),
				paymentStatus: String(form.get('paymentStatus') ?? 'Kiállítva'),
				contractId,
				filePath,
				year,
				month
			});
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Mentés sikertelen.' });
		}
	},
	fleetcor: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		const filePath = await optionalPdf(form, 'invoices');
		const row = await createFleetCorQuick(
			{ year, month },
			Number(form.get('grossAmount')),
			String(form.get('invoiceNumber'))
		);
		if (filePath && row) await attachInvoiceFile(row.id, filePath);
		return { success: true };
	},
	uploadPdf: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		try {
			const filePath = await optionalPdf(form, 'invoices');
			if (!filePath) return fail(400, { error: 'Válassz PDF fájlt.' });
			await attachInvoiceFile(id, filePath);
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Feltöltés sikertelen.' });
		}
	},
	markPaid: async ({ request }) => {
		const form = await request.formData();
		await updateInvoice(Number(form.get('id')), {
			paymentStatus: 'Fizetve',
			paymentDate: String(form.get('paymentDate') ?? new Date().toISOString().slice(0, 10))
		});
		return { success: true };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		await deleteInvoice(Number(form.get('id')));
		return { success: true };
	}
};
