import { fail } from '@sveltejs/kit';
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

function parseWorkDaysJson(raw: string | null): Record<string, WorkDayType> | undefined {
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw) as Record<string, string>;
		const result: Record<string, WorkDayType> = {};
		for (const [date, type] of Object.entries(parsed)) {
			if (type === 'normal' || type === 'extra') result[date] = type;
		}
		return result;
	} catch {
		return undefined;
	}
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		const workDaysMap = parseWorkDaysJson(String(form.get('workDaysJson') ?? ''));
		const normalDays = Number(form.get('normalDays'));
		const extraDays = Number(form.get('extraDays'));
		const notes = String(form.get('notes') ?? '');

		if (normalDays < 0 || extraDays < 0) {
			return fail(400, { error: 'A napok száma nem lehet negatív.' });
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
		} catch {
			return fail(500, { error: 'Mentés sikertelen.' });
		}
	},
	setLimit: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const form = await request.formData();
		const limit = Number(form.get('limit'));
		if (limit !== 220 && limit !== 228) {
			return fail(400, { error: 'Érvénytelen limit.' });
		}
		try {
			await setAnnualLimit(year, limit);
			return { success: true, limitUpdated: true };
		} catch {
			return fail(500, { error: 'Limit mentése sikertelen.' });
		}
	}
};
