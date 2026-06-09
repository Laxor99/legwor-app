export function calcCarTripAmount(
	distanceKm: number,
	consumptionNorm: number,
	navFuelPrice: number,
	amortization: number
): number {
	const perKm = (consumptionNorm / 100) * navFuelPrice + amortization;
	return Math.round(distanceKm * perKm * 100) / 100;
}

export function calcPerKmRate(
	consumptionNorm: number,
	navFuelPrice: number,
	amortization: number
): number {
	return Math.round(((consumptionNorm / 100) * navFuelPrice + amortization) * 100) / 100;
}

export function calcAnnualProgress(
	workedDays: number,
	limit: number
): { percent: number; remaining: number; warning: 'none' | 'yellow' | 'red' } {
	const percent = limit > 0 ? (workedDays / limit) * 100 : 0;
	const remaining = Math.max(0, limit - workedDays);
	let warning: 'none' | 'yellow' | 'red' = 'none';
	if (workedDays >= limit) warning = 'red';
	else if (percent >= 90) warning = 'yellow';
	return { percent, remaining, warning };
}
