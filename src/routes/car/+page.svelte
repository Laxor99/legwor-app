<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import NavIcon from '$lib/components/NavIcon.svelte';
	import {
		DEFAULT_TRIP_DISTANCE_KM,
		DEFAULT_TRIP_FROM,
		DEFAULT_TRIP_TO,
		firstTripLocationOtherThan,
		lookupTripDistance,
		TRIP_LOCATIONS,
		type TripLocation
	} from '$lib/config/trip-locations';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatHuf, formatNumber } from '$lib/utils/format';
	import { calcPerKmRate } from '$lib/utils/calculations';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	let { data, form } = $props();

	const locale = $derived(data.locale);
	const perKm = $derived(
		calcPerKmRate(
			data.defaults.consumptionNorm ?? 8.6,
			data.defaults.navFuelPrice ?? 595,
			data.defaults.amortization ?? 25
		)
	);

	let tripFrom = $state<TripLocation>(DEFAULT_TRIP_FROM);
	let tripTo = $state<TripLocation>(DEFAULT_TRIP_TO);
	let tripDistance = $state<number | string | null>(DEFAULT_TRIP_DISTANCE_KM);

	function syncTripDistance() {
		const km = lookupTripDistance(tripFrom, tripTo);
		tripDistance = km ?? '';
	}

	function onFromChange() {
		if (tripFrom === tripTo) tripTo = firstTripLocationOtherThan(tripFrom);
		syncTripDistance();
	}

	function onToChange() {
		if (tripFrom === tripTo) tripFrom = firstTripLocationOtherThan(tripTo);
		syncTripDistance();
	}

	function resetTripForm() {
		tripFrom = DEFAULT_TRIP_FROM;
		tripTo = DEFAULT_TRIP_TO;
		tripDistance = DEFAULT_TRIP_DISTANCE_KM;
	}

	function monthUrl(): string {
		const pathname = get(page).url.pathname;
		return `${pathname}?year=${data.year}&month=${data.month}`;
	}

	function createMonthEnhance(onSuccess?: () => void) {
		return () =>
			async ({
				result,
				update
			}: {
				result: { type: string };
				update: (opts?: { invalidateAll?: boolean }) => Promise<void>;
			}) => {
				if (result.type === 'success') {
					onSuccess?.();
					await update({ invalidateAll: true });
					const url = get(page).url;
					if (
						Number(url.searchParams.get('year')) !== data.year ||
						Number(url.searchParams.get('month')) !== data.month ||
						url.searchParams.has('/deleteTrip')
					) {
						await goto(monthUrl(), {
							replaceState: true,
							keepFocus: true,
							noScroll: true
						});
					}
				} else {
					await update({ invalidateAll: true });
				}
			};
	}
</script>

<svelte:head>
	<title>{t(locale, 'car.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'car.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

{#if form?.error}
	<div class="alert-error">{form.error}</div>
{/if}

<div class="flex flex-col gap-3">
<div class="grid gap-3 lg:grid-cols-2">
	<Card compact title={t(locale, 'car.vehicleData')}>
		<div class="grid grid-cols-2 gap-2 text-sm">
			<span>{t(locale, 'car.plate')}:</span><span class="font-medium">{data.defaults.carPlate}</span>
			<span>{t(locale, 'car.type')}:</span><span>{data.defaults.carType}</span>
			<span>{t(locale, 'car.fuel')}:</span><span>{data.defaults.carFuelType}</span>
			<span>{t(locale, 'car.consumptionNorm')}:</span><span>{data.defaults.consumptionNorm} l/100km</span>
			<span>{t(locale, 'car.amortization')}:</span><span>{data.defaults.amortization} Ft/km</span>
			<span>{t(locale, 'car.perKmTotal')}:</span><span class="font-semibold"
				>{formatNumber(perKm, 2, locale)} Ft/km</span
			>
		</div>
		<div class="mt-3 border-t pt-3 text-sm">
			{#if data.defaults.navFuelUrl}
				<a
					href={data.defaults.navFuelUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="link-action truncate"
					title={data.defaults.navFuelUrl}
				>
					{t(locale, 'car.navFuelPrices')} →
				</a>
			{:else}
				<span class="text-muted-dim">—</span>
			{/if}

			<details class="mt-2">
				<summary class="cursor-pointer text-xs text-muted hover:text-foreground">
					{t(locale, 'car.editNavLink')}
				</summary>
				<form method="POST" action="?/updateConfig" use:enhance class="mt-2 space-y-2">
					<div>
						<label class="text-xs font-medium" for="navFuelUrl">{t(locale, 'car.navLink')}</label>
						<input
							id="navFuelUrl"
							type="url"
							name="navFuelUrl"
							value={data.defaults.navFuelUrl}
							class="w-full"
							placeholder="https://"
						/>
					</div>
					<button type="submit" class="btn-secondary text-xs">{t(locale, 'car.saveLink')}</button>
				</form>
			</details>
		</div>
		<form method="POST" action="?/updateConfig" use:enhance class="mt-3 space-y-2 border-t pt-3">
			<div>
				<label class="text-xs font-medium" for="navFuelPrice">{t(locale, 'car.navFuelPrice')}</label>
				<FormattedNumberInput
					id="navFuelPrice"
					name="navFuelPrice"
					value={data.defaults.navFuelPrice}
					decimals={2}
					class="w-full"
				/>
				{#if data.navFuelSync?.monthLabel}
					<p class="mt-1 text-xs text-muted">
						{t(locale, 'car.navFuelPriceSynced')
							.replace('{month}', data.navFuelSync.monthLabel)
							.replace(
								'{price}',
								formatNumber(data.defaults.navFuelPrice ?? 0, 0, locale)
							)}
					</p>
				{/if}
			</div>
			<button type="submit" class="btn-secondary text-xs">{t(locale, 'car.saveSettings')}</button>
		</form>
	</Card>

	<Card compact title={t(locale, 'car.summary')}>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>{t(locale, 'car.totalKm')}</span><span>{formatNumber(data.totalKm, 0, locale)} {t(locale, 'common.km')}</span>
			</div>
			<div class="flex justify-between">
				<span>{t(locale, 'car.tripAmount')}</span><span>{formatHuf(data.tripAmount, locale)}</span>
			</div>
			<div class="flex justify-between">
				<span>{t(locale, 'car.motorwayVignette')}</span><span>{formatHuf(data.motorwayCost, locale)}</span>
			</div>
			<div class="flex justify-between border-t pt-2 text-base font-semibold">
				<span>{t(locale, 'common.total')}</span><span>{formatHuf(data.totalAmount, locale)}</span>
			</div>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href="/api/car/export/excel?year={data.year}&month={data.month}"
				class="btn-primary text-xs"
				download
			>
				{t(locale, 'car.downloadExcel')}
			</a>
			<a
				href="/api/car/export/pdf?year={data.year}&month={data.month}"
				class="btn-secondary text-xs"
				download
			>
				{t(locale, 'car.downloadPdf')}
			</a>
		</div>
	</Card>
</div>

<div class="grid gap-3 lg:grid-cols-2">
<Card compact title={t(locale, 'car.newTrip')}>
	<form
		method="POST"
		action="?/addTrip"
		use:enhance={createMonthEnhance(resetTripForm)}
		class="grid gap-3 md:grid-cols-3"
	>
		<input type="hidden" name="year" value={data.year} />
		<input type="hidden" name="month" value={data.month} />
		<select
			name="fromLocation"
			bind:value={tripFrom}
			onchange={onFromChange}
			class="w-full"
			required
			aria-label={t(locale, 'common.from')}
		>
			{#each TRIP_LOCATIONS.filter((location) => location !== tripTo) as location}
				<option value={location}>{location}</option>
			{/each}
		</select>
		<select
			name="toLocation"
			bind:value={tripTo}
			onchange={onToChange}
			class="w-full"
			required
			aria-label={t(locale, 'common.to')}
		>
			{#each TRIP_LOCATIONS.filter((location) => location !== tripFrom) as location}
				<option value={location}>{location}</option>
			{/each}
		</select>
		<div class="flex items-center gap-2">
			<FormattedNumberInput
				name="distanceKm"
				bind:value={tripDistance}
				placeholder={t(locale, 'car.distance')}
				decimals={2}
				required
				class="w-full"
			/>
			<span class="shrink-0 text-sm text-muted">{t(locale, 'common.km')}</span>
		</div>
		<input type="date" name="tripDate" required />
		<input
			type="text"
			name="description"
			placeholder={t(locale, 'common.notes')}
			class="md:col-span-2"
		/>
		<button type="submit" class="btn-primary">{t(locale, 'common.add')}</button>
	</form>
</Card>

<Card compact title={t(locale, 'car.tripLog')}>
	{#if data.trips.length === 0}
		<p class="text-sm text-muted">{t(locale, 'common.noneRecordedTrips')}</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th>{t(locale, 'common.date')}</th>
						<th>{t(locale, 'common.from')}</th>
						<th>{t(locale, 'common.to')}</th>
						<th>{t(locale, 'common.km')}</th>
						<th>{t(locale, 'common.amount')}</th>
						<th>{t(locale, 'common.notes')}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each data.trips as trip (trip.id)}
						<tr>
							<td>{trip.tripDate}</td>
							<td>{trip.fromLocation}</td>
							<td>{trip.toLocation}</td>
							<td>{trip.distanceKm}</td>
							<td>{formatHuf(trip.calculatedAmount, locale)}</td>
							<td>{trip.description}</td>
							<td>
								<form
									method="POST"
									action="?year={data.year}&month={data.month}&/deleteTrip"
									use:enhance={createMonthEnhance()}
								>
									<input type="hidden" name="id" value={String(trip.id)} />
									<button
										type="submit"
										class="rounded p-1 text-danger transition hover:bg-danger/10"
										aria-label={t(locale, 'common.delete')}
									>
										<NavIcon icon="trash-can" />
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Card>
</div>

<Card compact title={t(locale, 'car.motorwayVignette')}>
	<form method="POST" action="?/setVignette" use:enhance={createMonthEnhance()} class="flex flex-wrap items-end gap-3">
		<input type="hidden" name="year" value={data.year} />
		<input type="hidden" name="month" value={data.month} />
		<div>
			<label class="mb-1 block text-xs font-medium">{t(locale, 'car.vignetteAmount')}</label>
			<FormattedNumberInput name="motorwayCost" value={data.motorwayCost || ''} class="w-full" />
		</div>
		<div class="flex-1">
			<label class="mb-1 block text-xs font-medium">{t(locale, 'common.notes')}</label>
			<input
				type="text"
				name="motorwayNotes"
				placeholder={t(locale, 'car.vignettePlaceholder')}
				class="w-full"
			/>
		</div>
		<button type="submit" class="btn-secondary">{t(locale, 'common.save')}</button>
	</form>
</Card>

</div>
