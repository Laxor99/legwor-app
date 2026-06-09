<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { formatHuf, formatNumber } from '$lib/utils/format';
	import { calcPerKmRate } from '$lib/utils/calculations';
	import { enhance } from '$app/forms';

	let { data } = $props();

	const perKm = $derived(
		calcPerKmRate(
			data.defaults.consumptionNorm ?? 8.6,
			data.defaults.navFuelPrice ?? 595,
			data.defaults.amortization ?? 25
		)
	);
</script>

<svelte:head>
	<title>Utazási elszámolás – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Utazási elszámolás</h1>
<p class="page-subtitle">{formatMonthHu({ year: data.year, month: data.month })}</p>

<div class="mb-4 grid gap-4 lg:grid-cols-2">
	<Card title="Gépjármű adatok">
		<div class="grid grid-cols-2 gap-2 text-sm">
			<span>Rendszám:</span><span class="font-medium">{data.defaults.carPlate}</span>
			<span>Típus:</span><span>{data.defaults.carType}</span>
			<span>Üzemanyag:</span><span>{data.defaults.carFuelType}</span>
			<span>Fogyasztási norma:</span><span>{data.defaults.consumptionNorm} l/100km</span>
			<span>Amortizáció:</span><span>{data.defaults.amortization} Ft/km</span>
			<span>Ft/km összesen:</span><span class="font-semibold">{formatNumber(perKm)} Ft/km</span>
		</div>
		<a
			href={data.defaults.navFuelUrl}
			target="_blank"
			rel="noopener"
			class="btn-secondary mt-4 inline-block text-xs"
		>
			NAV üzemanyagárak →
		</a>
		<form method="POST" action="?/updateConfig" use:enhance class="mt-4 space-y-2 border-t pt-4">
			<div>
				<label class="text-xs font-medium">NAV üzemanyagár (Ft/l)</label>
				<input
					type="number"
					name="navFuelPrice"
					value={data.defaults.navFuelPrice}
					class="w-full"
					step="0.01"
				/>
			</div>
			<div>
				<label class="text-xs font-medium">NAV link (szerkeszthető)</label>
				<input type="url" name="navFuelUrl" value={data.defaults.navFuelUrl} class="w-full" />
			</div>
			<button type="submit" class="btn-secondary text-xs">Beállítások mentése</button>
		</form>
	</Card>

	<Card title="Összesítés">
		<div class="space-y-2 text-sm">
			<div class="flex justify-between"><span>Összes km</span><span>{formatNumber(data.totalKm, 0)} km</span></div>
			<div class="flex justify-between"><span>Utazás összeg</span><span>{formatHuf(data.tripAmount)}</span></div>
			<div class="flex justify-between"><span>Autópálya matrica</span><span>{formatHuf(data.motorwayCost)}</span></div>
			<div class="flex justify-between border-t pt-2 text-base font-semibold">
				<span>Összesen</span><span>{formatHuf(data.totalAmount)}</span>
			</div>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href="/api/car/export/excel?year={data.year}&month={data.month}"
				class="btn-primary text-xs"
				download
			>
				Letöltés Excelként
			</a>
			<a
				href="/api/car/export/pdf?year={data.year}&month={data.month}"
				class="btn-secondary text-xs"
				download
			>
				PDF letöltése
			</a>
		</div>
	</Card>
</div>

<Card title="Új út">
	<form method="POST" action="?/addTrip" use:enhance class="grid gap-3 md:grid-cols-3">
		<input type="text" name="fromLocation" placeholder="Honnan" required />
		<input type="text" name="toLocation" placeholder="Hová" required />
		<input type="number" name="distanceKm" placeholder="Távolság (km)" step="0.01" required />
		<input type="date" name="tripDate" required />
		<input type="text" name="description" placeholder="Megjegyzés" class="md:col-span-2" />
		<button type="submit" class="btn-primary">Hozzáadás</button>
	</form>
</Card>

<Card title="Útnyilvántartás">
	{#if data.trips.length === 0}
		<p class="text-sm text-muted">Még nincs rögzített út.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th>Dátum</th>
						<th>Honnan</th>
						<th>Hová</th>
						<th>km</th>
						<th>Összeg</th>
						<th>Megjegyzés</th>
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
							<td>{formatHuf(trip.calculatedAmount)}</td>
							<td>{trip.description}</td>
							<td>
								<form method="POST" action="?/deleteTrip" use:enhance>
									<input type="hidden" name="id" value={trip.id} />
									<button type="submit" class="text-xs text-danger hover:underline">Törlés</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Card>

<Card title="Autópálya matrica">
	<form method="POST" action="?/setVignette" use:enhance class="flex flex-wrap items-end gap-3">
		<div>
			<label class="mb-1 block text-xs font-medium">Matrica összeg (HUF)</label>
			<input type="number" name="motorwayCost" value={data.motorwayCost || ''} />
		</div>
		<div class="flex-1">
			<label class="mb-1 block text-xs font-medium">Megjegyzés</label>
			<input type="text" name="motorwayNotes" placeholder="pl. éves matrica" class="w-full" />
		</div>
		<button type="submit" class="btn-secondary">Mentés</button>
	</form>
</Card>
