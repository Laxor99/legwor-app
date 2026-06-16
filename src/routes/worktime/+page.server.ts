import { fail } from '@sveltejs/kit';
import { t } from '$lib/i18n';
import { setAnnualLimit } from '$lib/services/config';
import {
	getWorkDaysMap,
	getWorkMonth,
	getWorktimeSummary,
	upsertWorkMonth,
	type WorkDayType
} from '$lib/services/worktime';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [summary, workMonth, workDaysMap] = await Promise.all([
			getWorktimeSummary({ year, month }),
			getWorkMonth({ year, month }),
			getWorkDaysMap({ year, month })
		]);
		return { year, month, ...summary, notes: workMonth?.notes ?? '', workDaysMap };
	} catch {
		return {
			year,
			month,
			normalDays: 0,
			extraDays: 0,
			totalDays: 0,
			yearlyWorked: 0,
			limit: 220,
			notes: '',
			workDaysMap: {},
			dbError: true
		};
	}
};

function parseWorkDaysJson(raw: string): Record<string, WorkDayType> | undefined {
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw) as Record<string, string>;
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined;
		const result: Record<string, WorkDayType> = {};
		for (const [date, type] of Object.entries(parsed)) {
			if (type === 'normal' || type === 'extra') result[date] = type;
		}
		return result;
	} catch {
		return undefined;
	}
}

function monthFromRequest(form: FormData, url: URL) {
	const ym = getDefaultActiveMonth();
	const year = Number(form.get('year')) || Number(url.searchParams.get('year')) || ym.year;
	const month = Number(form.get('month')) || Number(url.searchParams.get('month')) || ym.month;
	return { year, month };
}

export const actions: Actions = {
	saveCalendar: async ({ request, url, locals }) => {
		const form = await request.formData();
		const { year, month } = monthFromRequest(form, url);
		const raw = String(form.get('workDaysJson') ?? '');
		const workDaysMap = raw ? parseWorkDaysJson(raw) : undefined;
		const normalDays = Number(form.get('normalDays'));
		const extraDays = Number(form.get('extraDays'));
		const notes = String(form.get('notes') ?? '');

		if (normalDays < 0 || extraDays < 0) {
			return fail(400, { error: t(locals.locale, 'errors.negativeDays') });
		}

		try {
			await upsertWorkMonth({
				year,
				month,
				normalDays,
				extraDays,
				notes,
				workDaysMap
			});
			return { success: true };
		} catch (e) {
			console.error('worktime save failed:', e);
			return fail(500, { error: t(locals.locale, 'errors.saveFailed') });
		}
	},
	setLimit: async ({ request, url, locals }) => {
		const form = await request.formData();
		const { year } = monthFromRequest(form, url);
		const limit = Number(form.get('limit'));
		if (limit !== 220 && limit !== 228) {
			return fail(400, { error: t(locals.locale, 'errors.invalidLimit') });
		}
		try {
			await setAnnualLimit(year, limit);
			return { success: true, limitUpdated: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'errors.limitSaveFailed') });
		}
	}
};
