import { fail } from '@sveltejs/kit';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { t } from '$lib/i18n';
import { getAllConfig, setConfig, setAnnualLimit } from '$lib/services/config';
import { getStorageConfig, saveStorageConfig } from '$lib/services/storage-config';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	try {
		const [config, storage] = await Promise.all([getAllConfig(), getStorageConfig()]);
		return { year, config, storage };
	} catch {
		return { year, config: {}, storage: null, dbError: true };
	}
};

export const actions: Actions = {
	saveGeneral: async ({ request, locals }) => {
		const form = await request.formData();
		const year = Number(form.get('year'));
		const keys = [
			'nav_fuel_url',
			'car_plate',
			'car_type',
			'car_fuel_type',
			'car_consumption',
			'car_amortization',
			'nav_fuel_price',
			'vincent_name',
			'vincent_email',
			'marica_name',
			'marica_email',
			'employee_name',
			'employee_title'
		];
		try {
			for (const key of keys) {
				const val = form.get(key);
				if (val !== null) await setConfig(key, String(val));
			}
			const limit = Number(form.get('annual_limit'));
			if (limit === 220 || limit === 228) {
				await setAnnualLimit(year, limit);
			}
			return { success: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'errors.saveFailed') });
		}
	},
	saveStorage: async ({ request, locals }) => {
		const form = await request.formData();
		const localRootPath = String(form.get('localRootPath') ?? '').trim();
		if (!localRootPath) {
			return fail(400, { error: t(locals.locale, 'settings.pickFolderRequired') });
		}
		try {
			await mkdir(path.resolve(localRootPath), { recursive: true });
			await saveStorageConfig({
				storageType: 'local',
				localRootPath
			});
			return { success: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'settings.pickFolderSaveFailed') });
		}
	}
};
