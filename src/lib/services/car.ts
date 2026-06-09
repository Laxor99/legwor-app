import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { carExpenses } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { calcCarTripAmount } from '$lib/utils/calculations';
import { getAllConfig } from './config';

export async function getCarTrips({ year, month }: YearMonth) {
	return db.query.carExpenses.findMany({
		where: and(eq(carExpenses.year, year), eq(carExpenses.month, month)),
		orderBy: (t, { asc }) => [asc(t.tripDate), asc(t.id)]
	});
}

export async function getCarDefaults() {
	const cfg = await getAllConfig();
	return {
		navFuelPrice: Number(cfg.nav_fuel_price) || 595,
		consumptionNorm: Number(cfg.car_consumption) || 8.6,
		amortization: Number(cfg.car_amortization) || 25,
		carPlate: cfg.car_plate,
		carType: cfg.car_type,
		carFuelType: cfg.car_fuel_type,
		navFuelUrl: cfg.nav_fuel_url
	};
}

export async function addCarTrip(data: {
	year: number;
	month: number;
	fromLocation: string;
	toLocation: string;
	distanceKm: number;
	tripDate: string;
	description?: string;
	navFuelPrice?: number;
	consumptionNorm?: number;
	amortization?: number;
}) {
	const defaults = await getCarDefaults();
	const navFuelPrice = data.navFuelPrice ?? defaults.navFuelPrice;
	const consumptionNorm = data.consumptionNorm ?? defaults.consumptionNorm;
	const amortization = data.amortization ?? defaults.amortization;
	const calculatedAmount = calcCarTripAmount(
		data.distanceKm,
		consumptionNorm,
		navFuelPrice,
		amortization
	);

	const [row] = await db
		.insert(carExpenses)
		.values({
			year: data.year,
			month: data.month,
			fromLocation: data.fromLocation,
			toLocation: data.toLocation,
			distanceKm: data.distanceKm.toString(),
			tripDate: data.tripDate,
			description: data.description,
			navFuelPrice: navFuelPrice.toString(),
			consumptionNorm: consumptionNorm.toString(),
			amortization: amortization.toString(),
			calculatedAmount: calculatedAmount.toString()
		})
		.returning();
	return row;
}

export async function updateCarTrip(
	id: number,
	data: Partial<{
		fromLocation: string;
		toLocation: string;
		distanceKm: number;
		tripDate: string;
		description: string;
	}>
) {
	const existing = await db.query.carExpenses.findFirst({ where: eq(carExpenses.id, id) });
	if (!existing) return null;

	const distanceKm = data.distanceKm ?? Number(existing.distanceKm);
	const navFuelPrice = Number(existing.navFuelPrice);
	const consumptionNorm = Number(existing.consumptionNorm);
	const amortization = Number(existing.amortization);
	const calculatedAmount = calcCarTripAmount(
		distanceKm,
		consumptionNorm,
		navFuelPrice,
		amortization
	);

	await db
		.update(carExpenses)
		.set({
			fromLocation: data.fromLocation ?? existing.fromLocation,
			toLocation: data.toLocation ?? existing.toLocation,
			distanceKm: distanceKm.toString(),
			tripDate: data.tripDate ?? existing.tripDate,
			description: data.description ?? existing.description,
			calculatedAmount: calculatedAmount.toString()
		})
		.where(eq(carExpenses.id, id));
	return true;
}

export async function deleteCarTrip(id: number) {
	await db.delete(carExpenses).where(eq(carExpenses.id, id));
}

export async function setMotorwayVignette(
	{ year, month }: YearMonth,
	cost: number,
	notes?: string
) {
	const trips = await getCarTrips({ year, month });
	const vignetteRow = trips.find((t) => !t.fromLocation && !t.toLocation && t.motorwayCost);
	if (vignetteRow) {
		await db
			.update(carExpenses)
			.set({ motorwayCost: cost.toString(), motorwayNotes: notes ?? '' })
			.where(eq(carExpenses.id, vignetteRow.id));
		return;
	}
	await db.insert(carExpenses).values({
		year,
		month,
		motorwayCost: cost.toString(),
		motorwayNotes: notes ?? '',
		distanceKm: '0',
		calculatedAmount: '0'
	});
}

export async function getCarSummary({ year, month }: YearMonth) {
	const trips = await getCarTrips({ year, month });
	let totalKm = 0;
	let tripAmount = 0;
	let motorwayCost = 0;

	for (const t of trips) {
		if (t.fromLocation || t.toLocation) {
			totalKm += Number(t.distanceKm ?? 0);
			tripAmount += Number(t.calculatedAmount ?? 0);
		}
		if (t.motorwayCost) {
			motorwayCost += Number(t.motorwayCost);
		}
	}

	return {
		trips: trips.filter((t) => t.fromLocation || t.toLocation),
		totalKm,
		tripAmount,
		motorwayCost,
		totalAmount: tripAmount + motorwayCost
	};
}
