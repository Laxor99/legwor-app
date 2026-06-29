export const TRIP_LOCATIONS = ['Szombathely', 'Makó', 'Budapest', 'Vienna'] as const;

export type TripLocation = (typeof TRIP_LOCATIONS)[number];

export const DEFAULT_TRIP_FROM: TripLocation = 'Szombathely';
export const DEFAULT_TRIP_TO: TripLocation = 'Makó';

/** Symmetric route distances in km (highway). */
const TRIP_DISTANCES_KM: Record<string, number> = {
	'Szombathely|Makó': 416,
	'Szombathely|Budapest': 221,
	'Szombathely|Vienna': 131,
	'Makó|Budapest': 201,
	'Makó|Vienna': 438,
	'Budapest|Vienna': 245
};

function routeKey(from: TripLocation, to: TripLocation): string {
	const fromIdx = TRIP_LOCATIONS.indexOf(from);
	const toIdx = TRIP_LOCATIONS.indexOf(to);
	const [a, b] = fromIdx <= toIdx ? [from, to] : [to, from];
	return `${a}|${b}`;
}

export function lookupTripDistance(from: TripLocation, to: TripLocation): number | null {
	if (from === to) return null;
	return TRIP_DISTANCES_KM[routeKey(from, to)] ?? null;
}

export function firstTripLocationOtherThan(location: TripLocation): TripLocation {
	return TRIP_LOCATIONS.find((l) => l !== location) ?? TRIP_LOCATIONS[0];
}

export const DEFAULT_TRIP_DISTANCE_KM =
	lookupTripDistance(DEFAULT_TRIP_FROM, DEFAULT_TRIP_TO) ?? 416;
