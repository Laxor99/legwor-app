<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import NavIcon from '$lib/components/NavIcon.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { t, translatePaymentType } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatHuf, formatEur } from '$lib/utils/format';
	import { calcAnnualProgress } from '$lib/utils/calculations';

	let { data } = $props();

	const progress = $derived(
		calcAnnualProgress(data.worktime.yearlyWorked, data.worktime.limit)
	);
	const locale = $derived(data.locale);
	const checklistDone = $derived(data.checklist.filter((item) => item.done).length);
</script>

<svelte:head>
	<title>{t(locale, 'dashboard.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'dashboard.title')}</h1>

{#if data.dbError}
	<div class="alert-warning">
		{t(locale, 'dashboard.dbError')}
	</div>
{/if}

<div class="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted">
	<span class="badge-month">
		{t(locale, 'dashboard.activeMonth')}: {formatMonth({ year: data.year, month: data.month }, locale)}
	</span>
</div>

<div class="mb-3">
	<Card title={t(locale, 'dashboard.checklist.title')}>
	<div class="mb-3 flex items-center justify-between gap-4">
		<span class="text-sm text-muted">
			{checklistDone}/{data.checklist.length} {t(locale, 'dashboard.checklist.progress')}
		</span>
		<ProgressBar value={checklistDone} max={data.checklist.length} />
	</div>
	<ul class="space-y-1">
		{#each data.checklist as item}
			<li>
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-card-hover {item.done
						? 'text-muted'
						: 'text-foreground'}"
				>
					{#if item.done}
						<NavIcon icon="circle-check" class="text-success" />
					{:else}
						<NavIcon icon="circle" class="text-muted-dim" regular />
					{/if}
					<NavIcon
						icon={item.icon}
						class={item.done ? 'text-muted' : 'text-primary'}
					/>
					<span class={item.done ? 'line-through' : 'font-medium'}>{t(locale, item.labelKey)}</span>
				</a>
			</li>
		{/each}
	</ul>
	</Card>
</div>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
	<Card title={t(locale, 'dashboard.worktime')}>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>{t(locale, 'dashboard.normalDays')}</span><span class="font-medium"
					>{data.worktime.normalDays} {t(locale, 'common.days')}</span
				>
			</div>
			<div class="flex justify-between">
				<span>{t(locale, 'dashboard.extraDays')}</span><span class="font-medium"
					>{data.worktime.extraDays} {t(locale, 'common.days')}</span
				>
			</div>
			<div class="flex justify-between border-t pt-2">
				<span>{t(locale, 'common.total')}</span><span class="font-semibold"
					>{data.worktime.totalDays} {t(locale, 'common.days')}</span
				>
			</div>
			<div class="pt-3">
				<div class="mb-1 flex justify-between text-xs text-muted">
					<span
						>{t(locale, 'dashboard.annual')}: {data.worktime.yearlyWorked}/{data.worktime.limit}
						{t(locale, 'common.days')}</span
					>
					<span>{progress.percent.toFixed(1)}%</span>
				</div>
				<ProgressBar
					value={data.worktime.yearlyWorked}
					max={data.worktime.limit}
					warning={progress.warning}
				/>
				<div class="mt-1 text-xs text-muted">
					{t(locale, 'dashboard.remaining')}: {progress.remaining} {t(locale, 'common.days')}
				</div>
			</div>
		</div>
	</Card>

	<Card title={t(locale, 'dashboard.revenue')}>
		<div class="text-sm">
			<div
				class="group cursor-default text-lg font-semibold text-success"
				title={formatEur(data.revenue.eur, locale)}
			>
				<span class="inline group-hover:hidden">
					{t(locale, 'dashboard.invoice')}: {formatHuf(data.revenue.huf, locale)}
				</span>
				<span class="hidden group-hover:inline">
					{t(locale, 'dashboard.invoice')}: {formatEur(data.revenue.eur, locale)}
				</span>
			</div>
		</div>
	</Card>

	<Card title={t(locale, 'dashboard.expenses')}>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>{t(locale, 'dashboard.hotel')}</span><span>{formatHuf(data.expenses.hotel, locale)}</span>
			</div>
			<div class="flex justify-between">
				<span>{t(locale, 'dashboard.car')}</span><span>{formatHuf(data.expenses.car, locale)}</span>
			</div>
			<div class="flex justify-between">
				<span>FleetCor</span><span>{formatHuf(data.expenses.fleetcor, locale)}</span>
			</div>
		</div>
	</Card>

	<Card title={t(locale, 'dashboard.paymentsToMarica')}>
		<div class="space-y-2 text-sm">
			{#each data.payments.filter((p) => p.key !== 'fleetcor') as payment}
				<div class="flex items-center justify-between">
					<span>{translatePaymentType(locale, payment.key).label}</span>
					<span class="flex items-center gap-2">
						{formatHuf(payment.actualAmount, locale)}
						{#if payment.isPaid}
							<NavIcon icon="circle-check" class="text-success" />
						{:else}
							<span class="text-muted-dim">–</span>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</Card>
</div>
