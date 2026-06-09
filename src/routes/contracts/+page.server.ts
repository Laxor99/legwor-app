import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { contracts } from '$lib/db/schema';
import { deleteUpload, savePdfUpload } from '$lib/services/uploads';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const list = await db.query.contracts.findMany({
			orderBy: (t, { desc }) => [desc(t.createdAt)]
		});
		return { year, month, contracts: list };
	} catch {
		return { year, month, contracts: [], dbError: true };
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		try {
			let filePath: string | null = null;
			const file = form.get('pdf') as File | null;
			if (file && file.size > 0) {
				filePath = await savePdfUpload(file, 'contracts');
			}
			await db.insert(contracts).values({
				clientName: String(form.get('clientName')),
				contractNumber: String(form.get('contractNumber')),
				startDate: String(form.get('startDate')) || null,
				endDate: String(form.get('endDate')) || null,
				dailyRate: String(form.get('dailyRate') ?? '0'),
				currency: String(form.get('currency') ?? 'EUR'),
				paymentTerms: String(form.get('paymentTerms') ?? ''),
				status: String(form.get('status') ?? 'active'),
				notes: String(form.get('notes') ?? ''),
				filePath
			});
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Mentés sikertelen.' });
		}
	},
	uploadPdf: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const file = form.get('pdf') as File | null;
		if (!file || file.size === 0) return fail(400, { error: 'Válassz PDF fájlt.' });
		try {
			const current = await db.query.contracts.findFirst({ where: eq(contracts.id, id) });
			if (current?.filePath) await deleteUpload(current.filePath);
			const filePath = await savePdfUpload(file, 'contracts');
			await db.update(contracts).set({ filePath }).where(eq(contracts.id, id));
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Feltöltés sikertelen.' });
		}
	},
	toggleStatus: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const current = await db.query.contracts.findFirst({ where: eq(contracts.id, id) });
		if (current) {
			await db
				.update(contracts)
				.set({ status: current.status === 'active' ? 'inactive' : 'active' })
				.where(eq(contracts.id, id));
		}
		return { success: true };
	}
};
