<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { formatRate } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>EUR/HUF Árfolyam – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">EUR/HUF Árfolyam</h1>
<p class="page-subtitle">{formatMonthHu({ year: data.year, month: data.month })}</p>

{#if data.rates.apiError}
	<div class="alert-warning">Az API nem elérhető – utolsó mentett árfolyam megjelenítése.</div>
{/if}
{#if form?.success}
	<div class="alert-success">Árfolyam kiválasztva!</div>
{/if}

<Card title="Aktuális árfolyamok (frankfurter.app)">
	<div class="grid gap-4 md:grid-cols-3">
		{#each [
			{ type: 'spot', label: 'Jelenlegi árfolyam', value: data.rates.spotRate },
			{ type: 'avg10d', label: 'Utolsó 10 nap átlaga', value: data.rates.avg10d },
			{ type: 'avg30d', label: 'Utolsó 30 nap átlaga', value: data.rates.avg30d }
		] as rate}
			<div class="inner-card">
				<div class="text-sm text-muted">{rate.label}</div>
				<div class="mt-1 text-2xl font-bold text-foreground">
					{rate.value ? formatRate(rate.value) : '–'}
				</div>
				{#if rate.value}
					<form method="POST" action="?/select" use:enhance class="mt-3">
						<input type="hidden" name="rateType" value={rate.type} />
						<input type="hidden" name="value" value={rate.value} />
						<button type="submit" class="btn-primary w-full text-xs">
							Ezt használom ebben a hónapban
						</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>

	{#if data.rates.selectedRate}
		<div class="highlight-box">
			<span class="text-sm text-primary">Kiválasztott árfolyam ehhez a hónaphoz:</span>
			<span class="ml-2 text-xl font-bold text-foreground">
				{formatRate(data.rates.selectedRate)}
			</span>
		</div>
	{:else}
		<p class="mt-4 text-sm text-muted">Még nincs kiválasztott árfolyam ehhez a hónaphoz.</p>
	{/if}
</Card>
