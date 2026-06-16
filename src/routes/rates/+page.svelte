<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatRate } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	const locale = $derived(data.locale);
</script>

<svelte:head>
	<title>{t(locale, 'rates.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'rates.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

{#if data.rates.apiError}
	<div class="alert-warning">{t(locale, 'rates.apiError')}</div>
{/if}
{#if form?.success}
	<div class="alert-success">{t(locale, 'rates.selected')}</div>
{/if}

<Card title={t(locale, 'rates.currentRates')}>
	<div class="grid gap-4 md:grid-cols-3">
		{#each [
			{ type: 'spot', labelKey: 'rates.spot', value: data.rates.spotRate },
			{ type: 'avg10d', labelKey: 'rates.avg10d', value: data.rates.avg10d },
			{ type: 'avg30d', labelKey: 'rates.avg30d', value: data.rates.avg30d }
		] as rate}
			<div class="inner-card">
				<div class="text-sm text-muted">{t(locale, rate.labelKey)}</div>
				<div class="mt-1 text-2xl font-bold text-foreground">
					{rate.value ? formatRate(rate.value) : '–'}
				</div>
				{#if rate.value}
					<form method="POST" action="?/select" use:enhance class="mt-3">
						<input type="hidden" name="rateType" value={rate.type} />
						<input type="hidden" name="value" value={rate.value} />
						<button type="submit" class="btn-primary w-full text-xs">
							{t(locale, 'rates.useThisMonth')}
						</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>

	{#if data.rates.selectedRate}
		<div class="highlight-box">
			<span class="text-sm text-primary">{t(locale, 'rates.selectedForMonth')}</span>
			<span class="ml-2 text-xl font-bold text-foreground">
				{formatRate(data.rates.selectedRate)}
			</span>
		</div>
	{:else}
		<p class="mt-4 text-sm text-muted">{t(locale, 'rates.noneSelected')}</p>
	{/if}
</Card>
