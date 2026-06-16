<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatHuf, formatNumber } from '$lib/utils/format';
	import { calcPerKmRate } from '$lib/utils/calculations';
	import { enhance } from '$app/forms';

	let { data } = $props();

	const locale = $derived(data.locale);
	const perKm = $derived(
		calcPerKmRate(
			data.defaults.consumptionNorm ?? 8.6,
			data.defaults.navFuelPrice ?? 595,
			data.defaults.amortization ?? 25
		)
	);
</script>

<svelte:head>
	<title>{t(locale, 'car.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'car.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

<div class="mb-4 grid gap-4 lg:grid-cols-2">
	<Card title={t(locale, 'car.vehicleData')}>
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
		<a
			href={data.defaults.navFuelUrl}
			target="_blank"
			rel="noopener"
			class="btn-secondary mt-4 inline-block text-xs"
		>
			{t(locale, 'car.navFuelPrices')}
		</a>
		<form method="POST" action="?/updateConfig" use:enhance class="mt-4 space-y-2 border-t pt-4">
			<div>
				<label class="text-xs font-medium">{t(locale, 'car.navFuelPrice')}</label>
				<FormattedNumberInput
					name="navFuelPrice"
					value={data.defaults.navFuelPrice}
					decimals={2}
					class="w-full"
				/>
			</div>
			<div>
				<label class="text-xs font-medium">{t(locale, 'car.navLink')}</label>
				<input type="url" name="navFuelUrl" value={data.defaults.navFuelUrl} class="w-full" />
			</div>
			<button type="submit" class="btn-secondary text-xs">{t(locale, 'car.saveSettings')}</button>
		</form>
	</Card>

	<Card title={t(locale, 'car.summary')}>
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

<Card title={t(locale, 'car.newTrip')}>
	<form method="POST" action="?/addTrip" use:enhance class="grid gap-3 md:grid-cols-3">
		<input type="text" name="fromLocation" placeholder={t(locale, 'common.from')} required />
		<input type="text" name="toLocation" placeholder={t(locale, 'common.to')} required />
		<FormattedNumberInput
			name="distanceKm"
			placeholder={t(locale, 'car.distance')}
			decimals={2}
			required
			class="w-full"
		/>
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

<Card title={t(locale, 'car.tripLog')}>
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
					{#each data.trips as trip}
						<tr>
							<td>{trip.tripDate}</td>
							<td>{trip.fromLocation}</td>
							<td>{trip.toLocation}</td>
							<td>{trip.distanceKm}</td>
							<td>{formatHuf(trip.calculatedAmount, locale)}</td>
							<td>{trip.description}</td>
							<td>
								<form method="POST" action="?/deleteTrip" use:enhance>
									<input type="hidden" name="id" value={trip.id} />
									<button type="submit" class="text-xs text-danger hover:underline"
										>{t(locale, 'common.delete')}</button
									>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Card>

<Card title={t(locale, 'car.motorwayVignette')}>
	<form method="POST" action="?/setVignette" use:enhance class="flex flex-wrap items-end gap-3">
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
