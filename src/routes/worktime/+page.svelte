<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import WorkCalendar from '$lib/components/WorkCalendar.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { calcAnnualProgress } from '$lib/utils/calculations';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let workDaysMap = $state<Record<string, 'normal' | 'extra'>>({ ...data.workDaysMap });
	let notes = $state(data.notes ?? '');

	$effect(() => {
		workDaysMap = { ...data.workDaysMap };
		notes = data.notes ?? '';
	});

	const normalDays = $derived(
		Object.values(workDaysMap).filter((t) => t === 'normal').length || data.normalDays
	);
	const extraDays = $derived(
		Object.values(workDaysMap).filter((t) => t === 'extra').length || data.extraDays
	);
	const totalDays = $derived(
		Object.keys(workDaysMap).length > 0 ? normalDays + extraDays : data.normalDays + data.extraDays
	);
	const displayNormal = $derived(
		Object.keys(workDaysMap).length > 0 ? normalDays : data.normalDays
	);
	const displayExtra = $derived(Object.keys(workDaysMap).length > 0 ? extraDays : data.extraDays);
	const progress = $derived(calcAnnualProgress(data.yearlyWorked, data.limit));
</script>

<svelte:head>
	<title>Munkaidő – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Munkaidő nyilvántartás</h1>
<p class="page-subtitle">Hónap: {formatMonthHu({ year: data.year, month: data.month })}</p>

{#if form?.success && !form?.limitUpdated}
	<div class="alert-success">Mentve!</div>
{/if}
{#if form?.limitUpdated}
	<div class="alert-success">Éves limit frissítve!</div>
{/if}
{#if form?.error}
	<div class="alert-error">{form.error}</div>
{/if}

<div class="mb-6 grid gap-4 lg:grid-cols-3">
	<Card title="Éves munkanap limit ({data.year})">
		<form method="POST" action="?/setLimit" use:enhance class="flex flex-wrap items-end gap-3">
			<div>
				<label for="limit" class="mb-1 block text-sm font-medium">Limit (nap)</label>
				<select id="limit" name="limit" class="w-full">
					<option value="220" selected={data.limit === 220}>220 nap (alapértelmezett)</option>
					<option value="228" selected={data.limit === 228}>228 nap (jóváhagyott)</option>
				</select>
			</div>
			<button type="submit" class="btn-secondary">Limit mentése</button>
		</form>
		<p class="mt-2 text-xs text-muted">Év vége felé 228 napra állítható, ha jóváhagyják.</p>
	</Card>
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<Card title="Naptár – munkanapok jelölése">
		<form method="POST" use:enhance class="space-y-4">
			<WorkCalendar year={data.year} month={data.month} bind:days={workDaysMap} />
			<input type="hidden" name="workDaysJson" value={JSON.stringify(workDaysMap)} />
			<input type="hidden" name="normalDays" value={displayNormal} />
			<input type="hidden" name="extraDays" value={displayExtra} />
			<div>
				<label for="notes" class="mb-1 block text-sm font-medium">Megjegyzés</label>
				<textarea id="notes" name="notes" bind:value={notes} rows="2" class="w-full"></textarea>
			</div>
			<button type="submit" class="btn-primary">Mentés</button>
		</form>
	</Card>

	<Card title="Összesítés">
		<div class="space-y-3 text-sm">
			<div class="grid grid-cols-2 gap-2">
				<span>Normál napok:</span><span class="font-medium">{displayNormal}</span>
				<span>Extra napok:</span><span class="font-medium">{displayExtra}</span>
				<span class="border-t pt-2 font-semibold">Összesen:</span>
				<span class="border-t pt-2 font-semibold">{totalDays} nap</span>
			</div>
			<div class="border-t pt-4">
				<div class="mb-2 flex justify-between">
					<span>Éves haladás: {data.yearlyWorked} / {data.limit} nap</span>
					<span>{progress.percent.toFixed(1)}%</span>
				</div>
				<ProgressBar value={data.yearlyWorked} max={data.limit} warning={progress.warning} />
				<div class="mt-2 text-muted">Maradék: {progress.remaining} nap</div>
				{#if progress.warning === 'yellow'}
					<div class="mt-2 rounded border border-warning/40 bg-warning/10 p-2 text-warning">
						Figyelem: az éves limit 90%-a felett vagy!
					</div>
				{/if}
				{#if progress.warning === 'red'}
					<div class="mt-2 rounded border border-danger/40 bg-danger/10 p-2 text-danger">
						Elérted az éves munkanap limitet!
					</div>
				{/if}
			</div>
		</div>
	</Card>
</div>
