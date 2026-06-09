import { fail } from '@sveltejs/kit';
import {
	addCarTrip,
	deleteCarTrip,
	getCarDefaults,
	getCarSummary,
	setMotorwayVignette
} from '$lib/services/car';
import { setConfig } from '$lib/services/config';
import { getDefaultActiveMonth } from '$lib/utils/dates';
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
		return { year, month, defaults, ...summary };
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
	addTrip: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		try {
			await addCarTrip({
				year,
				month,
				fromLocation: String(form.get('fromLocation')),
				toLocation: String(form.get('toLocation')),
				distanceKm: Number(form.get('distanceKm')),
				tripDate: String(form.get('tripDate')),
				description: String(form.get('description') ?? '')
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Út hozzáadása sikertelen.' });
		}
	},
	deleteTrip: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		await deleteCarTrip(id);
		return { success: true };
	},
	setVignette: async ({ request, url }) => {
		const ym = getDefaultActiveMonth();
		const year = Number(url.searchParams.get('year')) || ym.year;
		const month = Number(url.searchParams.get('month')) || ym.month;
		const form = await request.formData();
		await setMotorwayVignette(
			{ year, month },
			Number(form.get('motorwayCost')),
			String(form.get('motorwayNotes') ?? '')
		);
		return { success: true };
	},
	updateConfig: async ({ request }) => {
		const form = await request.formData();
		const navFuelPrice = String(form.get('navFuelPrice'));
		const navFuelUrl = String(form.get('navFuelUrl'));
		if (navFuelPrice) await setConfig('nav_fuel_price', navFuelPrice);
		if (navFuelUrl) await setConfig('nav_fuel_url', navFuelUrl);
		return { success: true };
	}
};
