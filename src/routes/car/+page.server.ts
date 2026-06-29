import { fail } from '@sveltejs/kit';
import { t } from '$lib/i18n';
import {
	addCarTrip,
	deleteCarTrip,
	getCarDefaults,
	getCarSummary,
	setMotorwayVignette
} from '$lib/services/car';
import { setConfig } from '$lib/services/config';
import { syncNavFuelPriceFromWebsite } from '$lib/services/nav-fuel-price';
import { getDefaultActiveMonth, yearMonthFromForm } from '$lib/utils/dates';
import { parseNumber } from '$lib/utils/format';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const ym = getDefaultActiveMonth();
	const year = Number(url.searchParams.get('year')) || ym.year;
	const month = Number(url.searchParams.get('month')) || ym.month;
	try {
		const [defaults, summary] = await Promise.all([
			getCarDefaults(),
			getCarSummary({ year, month })
		]);

		let navFuelSync: { monthLabel: string } | null = null;
		if (defaults.navFuelUrl) {
			const synced = await syncNavFuelPriceFromWebsite(defaults.navFuelUrl);
			if (synced) {
				defaults.navFuelPrice = synced.price;
				navFuelSync = { monthLabel: synced.monthLabel };
			}
		}

		return { year, month, defaults, navFuelSync, ...summary };
	} catch {
		return {
			year,
			month,
			defaults: {},
			trips: [],
			totalKm: 0,
			tripAmount: 0,
			motorwayCost: 0,
			totalAmount: 0,
			dbError: true
		};
	}
};

export const actions: Actions = {
	addTrip: async ({ request, url, locals }) => {
		const form = await request.formData();
		const { year, month } = yearMonthFromForm(form, url);
		const fromLocation = String(form.get('fromLocation'));
		const toLocation = String(form.get('toLocation'));
		if (fromLocation === toLocation) {
			return fail(400, { error: t(locals.locale, 'errors.sameTripLocation') });
		}
		try {
			await addCarTrip({
				year,
				month,
				fromLocation,
				toLocation,
				distanceKm: parseNumber(form.get('distanceKm')),
				tripDate: String(form.get('tripDate')),
				description: String(form.get('description') ?? '')
			});
			return { success: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'errors.tripAddFailed') });
		}
	},
	deleteTrip: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id) || id <= 0) {
			return fail(400, { error: t(locals.locale, 'errors.tripDeleteFailed') });
		}
		try {
			await deleteCarTrip(id);
			return { success: true };
		} catch {
			return fail(500, { error: t(locals.locale, 'errors.tripDeleteFailed') });
		}
	},
	setVignette: async ({ request, url }) => {
		const form = await request.formData();
		const { year, month } = yearMonthFromForm(form, url);
		await setMotorwayVignette(
			{ year, month },
			parseNumber(form.get('motorwayCost')),
			String(form.get('motorwayNotes') ?? '')
		);
		return { success: true };
	},
	updateConfig: async ({ request }) => {
		const form = await request.formData();
		const navFuelPrice = String(parseNumber(form.get('navFuelPrice')));
		const navFuelUrl = String(form.get('navFuelUrl'));
		if (navFuelPrice) await setConfig('nav_fuel_price', navFuelPrice);
		if (navFuelUrl) await setConfig('nav_fuel_url', navFuelUrl);
		return { success: true };
	}
};
