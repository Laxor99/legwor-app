<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { formatHuf, formatEur } from '$lib/utils/format';
	import { calcAnnualProgress } from '$lib/utils/calculations';

	let { data } = $props();

	const progress = $derived(
		calcAnnualProgress(data.worktime.yearlyWorked, data.worktime.limit)
	);
</script>

<svelte:head>
	<title>Havi Összesítő – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Havi Összesítő</h1>

{#if data.dbError}
	<div class="alert-warning">
		Az adatbázis nem elérhető. Indítsd el a PostgreSQL-t (<code>docker compose up -d</code>),
		majd futtasd: <code>npm run db:push && npm run db:seed</code>
	</div>
{/if}

<div class="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted">
	<span class="badge-month">
		Aktív hónap: {formatMonthHu({ year: data.year, month: data.month })}
	</span>
	{#if data.revenue.rate}
		<span>EUR/HUF: {data.revenue.rate.toFixed(2)}</span>
	{/if}
</div>

<div class="grid gap-4 lg:grid-cols-2">
	<Card title="Munkaidő">
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>Normál napok</span><span class="font-medium">{data.worktime.normalDays} nap</span>
			</div>
			<div class="flex justify-between">
				<span>Extra napok</span><span class="font-medium">{data.worktime.extraDays} nap</span>
			</div>
			<div class="flex justify-between border-t pt-2">
				<span>Összesen</span><span class="font-semibold">{data.worktime.totalDays} nap</span>
			</div>
			<div class="pt-3">
				<div class="mb-1 flex justify-between text-xs text-muted">
					<span>Éves: {data.worktime.yearlyWorked}/{data.worktime.limit} nap</span>
					<span>{progress.percent.toFixed(1)}%</span>
				</div>
				<ProgressBar
					value={data.worktime.yearlyWorked}
					max={data.worktime.limit}
					warning={progress.warning}
				/>
				<div class="mt-1 text-xs text-muted">Maradék: {progress.remaining} nap</div>
			</div>
		</div>
	</Card>

	<Card title="Bevétel">
		<div class="text-sm">
			<div class="text-lg font-semibold text-success">
				Számla: {formatEur(data.revenue.eur)} = {formatHuf(data.revenue.huf)}
			</div>
		</div>
	</Card>

	<Card title="Kiadások">
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>Hotel</span><span>{formatHuf(data.expenses.hotel)}</span>
			</div>
			<div class="flex justify-between">
				<span>Autó</span><span>{formatHuf(data.expenses.car)}</span>
			</div>
			<div class="flex justify-between">
				<span>FleetCor</span><span>{formatHuf(data.expenses.fleetcor)}</span>
			</div>
		</div>
	</Card>

	<Card title="Fizetések (Maricának)">
		<div class="space-y-2 text-sm">
			{#each data.payments.filter((p) => p.key !== 'fleetcor') as payment}
				<div class="flex items-center justify-between">
					<span>{payment.label}</span>
					<span class="flex items-center gap-2">
						{formatHuf(payment.actualAmount)}
						{#if payment.isPaid}
							<span class="text-success">✅</span>
						{:else}
							<span class="text-muted-dim">–</span>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</Card>
</div>
