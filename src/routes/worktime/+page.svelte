<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import WorkCalendar from '$lib/components/WorkCalendar.svelte';
	import WorkflowNext from '$lib/components/WorkflowNext.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { calcAnnualProgress } from '$lib/utils/calculations';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let workDaysMap = $state<Record<string, 'normal' | 'extra'>>({ ...data.workDaysMap });
	let notes = $state(data.notes ?? '');
	let loadedMonthKey = $state(`${data.year}-${data.month}`);

	$effect(() => {
		const monthKey = `${data.year}-${data.month}`;
		if (monthKey !== loadedMonthKey) {
			loadedMonthKey = monthKey;
			workDaysMap = { ...data.workDaysMap };
			notes = data.notes ?? '';
		}
	});

	$effect(() => {
		if (form?.success && !form?.limitUpdated) {
			workDaysMap = { ...data.workDaysMap };
			notes = data.notes ?? '';
		}
	});

	const locale = $derived(data.locale);
	const normalDays = $derived(Object.values(workDaysMap).filter((t) => t === 'normal').length);
	const extraDays = $derived(Object.values(workDaysMap).filter((t) => t === 'extra').length);
	const totalDays = $derived(normalDays + extraDays);
	const displayNormal = $derived(normalDays);
	const displayExtra = $derived(extraDays);
	const progress = $derived(calcAnnualProgress(data.yearlyWorked, data.limit));

	let calendarSaved = $state(false);
	let limitSaved = $state(false);
	let calendarSaveTimer: ReturnType<typeof setTimeout> | undefined;
	let limitSaveTimer: ReturnType<typeof setTimeout> | undefined;

	function flashSaved(which: 'calendar' | 'limit') {
		if (which === 'calendar') {
			calendarSaved = true;
			clearTimeout(calendarSaveTimer);
			calendarSaveTimer = setTimeout(() => (calendarSaved = false), 2500);
		} else {
			limitSaved = true;
			clearTimeout(limitSaveTimer);
			limitSaveTimer = setTimeout(() => (limitSaved = false), 2500);
		}
	}
</script>

<svelte:head>
	<title>{t(locale, 'worktime.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'worktime.title')}</h1>
<p class="page-subtitle">
	{t(locale, 'worktime.month')}: {formatMonth({ year: data.year, month: data.month }, locale)}
</p>

{#if form?.error}
	<div class="alert-error">{form.error}</div>
{/if}

<div class="mb-6 grid gap-4 lg:grid-cols-3">
	<Card title="{t(locale, 'worktime.annualLimit')} ({data.year})">
		<form
			method="POST"
			action="?/setLimit"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') flashSaved('limit');
					await update();
				};
			}}
			class="flex flex-wrap items-end gap-3"
		>
			<input type="hidden" name="year" value={data.year} />
			<input type="hidden" name="month" value={data.month} />
			<div>
				<label for="limit" class="mb-1 block text-sm font-medium">{t(locale, 'worktime.limitDays')}</label>
				<select id="limit" name="limit" class="w-full">
					<option value="220" selected={data.limit === 220}>{t(locale, 'worktime.limit220')}</option>
					<option value="228" selected={data.limit === 228}>{t(locale, 'worktime.limit228')}</option>
				</select>
			</div>
			<button type="submit" class="btn-secondary">{t(locale, 'worktime.saveLimit')}</button>
			{#if limitSaved}
				<span class="inline-flex items-center gap-1 text-sm font-medium text-success" role="status">
					<span aria-hidden="true">✓</span>
					{t(locale, 'worktime.limitUpdated')}
				</span>
			{/if}
		</form>
		<p class="mt-2 text-xs text-muted">{t(locale, 'worktime.limitHint')}</p>
	</Card>
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<Card title={t(locale, 'worktime.calendar')}>
		<form
			method="POST"
			action="?/saveCalendar"
			use:enhance={({ formData }) => {
				formData.set('workDaysJson', JSON.stringify(workDaysMap));
				formData.set('normalDays', String(normalDays));
				formData.set('extraDays', String(extraDays));
				formData.set('year', String(data.year));
				formData.set('month', String(data.month));
				return async ({ result, update }) => {
					if (result.type === 'success') flashSaved('calendar');
					await update();
				};
			}}
			class="space-y-4"
		>
			<WorkCalendar
				year={data.year}
				month={data.month}
				days={workDaysMap}
				onDaysChange={(days) => (workDaysMap = days)}
				{locale}
			/>
			<input type="hidden" name="year" value={data.year} />
			<input type="hidden" name="month" value={data.month} />
			<input type="hidden" name="workDaysJson" value={JSON.stringify(workDaysMap)} />
			<input type="hidden" name="normalDays" value={normalDays} />
			<input type="hidden" name="extraDays" value={extraDays} />
			<div>
				<label for="notes" class="mb-1 block text-sm font-medium">{t(locale, 'common.notes')}</label>
				<textarea id="notes" name="notes" bind:value={notes} rows="2" class="w-full"></textarea>
			</div>
			<div class="flex flex-wrap items-center gap-3">
				<button type="submit" class="btn-primary">{t(locale, 'common.save')}</button>
				{#if calendarSaved}
					<span class="inline-flex items-center gap-1 text-sm font-medium text-success" role="status">
						<span aria-hidden="true">✓</span>
						{t(locale, 'common.saved')}
					</span>
				{/if}
			</div>
		</form>
	</Card>

	<Card title={t(locale, 'worktime.summary')}>
		<div class="space-y-3 text-sm">
			<div class="grid grid-cols-2 gap-2">
				<span>{t(locale, 'worktime.normalDays')}:</span><span class="font-medium">{displayNormal}</span>
				<span>{t(locale, 'worktime.extraDays')}:</span><span class="font-medium">{displayExtra}</span>
				<span class="border-t pt-2 font-semibold">{t(locale, 'common.total')}:</span>
				<span class="border-t pt-2 font-semibold">{totalDays} {t(locale, 'common.days')}</span>
			</div>
			<div class="border-t pt-4">
				<div class="mb-2 flex justify-between">
					<span
						>{t(locale, 'worktime.annualProgress')}: {data.yearlyWorked} / {data.limit}
						{t(locale, 'common.days')}</span
					>
					<span>{progress.percent.toFixed(1)}%</span>
				</div>
				<ProgressBar value={data.yearlyWorked} max={data.limit} warning={progress.warning} />
				<div class="mt-2 text-muted">
					{t(locale, 'dashboard.remaining')}: {progress.remaining} {t(locale, 'common.days')}
				</div>
				{#if progress.warning === 'yellow'}
					<div class="mt-2 rounded border border-warning/40 bg-warning/10 p-2 text-warning">
						{t(locale, 'worktime.warningYellow')}
					</div>
				{/if}
				{#if progress.warning === 'red'}
					<div class="mt-2 rounded border border-danger/40 bg-danger/10 p-2 text-danger">
						{t(locale, 'worktime.warningRed')}
					</div>
				{/if}
			</div>
		</div>
	</Card>
</div>

<WorkflowNext {locale} />
