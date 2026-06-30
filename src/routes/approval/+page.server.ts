import { fail } from '@sveltejs/kit';
import { t } from '$lib/i18n';
import { getAllConfig } from '$lib/services/config';
import { getDashboardData } from '$lib/services/dashboard';
import {
	getApproval,
	getOrCreateApproval,
	setApprovalFile,
	submitForApproval
} from '$lib/services/approvals';
import { resolveMonthStatus } from '$lib/services/month-status';
import { STORAGE_SUBDIRS } from '$lib/services/storage-config';
import { saveFile } from '$lib/services/storage';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [dashboard, approval, config, status] = await Promise.all([
			getDashboardData({ year, month }),
			getOrCreateApproval({ year, month }),
			getAllConfig(),
			resolveMonthStatus({ year, month })
		]);
		return { year, month, dashboard, approval, config, status };
	} catch {
		return {
			year,
			month,
			dashboard: null,
			approval: null,
			config: {},
			status: 'folyamatban' as const,
			dbError: true
		};
	}
};

function ymFromForm(form: FormData, url: URL) {
	const def = getDefaultActiveMonth();
	const year = Number(form.get('year')) || Number(url.searchParams.get('year')) || def.year;
	const month = Number(form.get('month')) || Number(url.searchParams.get('month')) || def.month;
	return { year, month };
}

export const actions: Actions = {
	submit: async ({ request, url, locals }) => {
		const form = await request.formData();
		const { year, month } = ymFromForm(form, url);
		try {
			await submitForApproval({ year, month });
			return { success: true, action: 'submit' };
		} catch (e) {
			console.error('approval submit failed:', e);
			return fail(500, { error: t(locals.locale, 'errors.saveFailed') });
		}
	},
	uploadFile: async ({ request, url, locals }) => {
		const form = await request.formData();
		const { year, month } = ymFromForm(form, url);
		const file = form.get('approvalFile');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: t(locals.locale, 'errors.uploadFailed') });
		}
		try {
			const rel = await saveFile(
				STORAGE_SUBDIRS.approvalDocs,
				file,
				file.name
			);
			await setApprovalFile({ year, month }, rel);
			return { success: true, action: 'upload' };
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : t(locals.locale, 'errors.uploadFailed')
			});
		}
	}
};
