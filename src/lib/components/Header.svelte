<script lang="ts">
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { activeMonth } from '$lib/stores/month';
	import { toggleMobileNav } from '$lib/stores/nav';
	import { t, type Locale } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import type { MonthStatusRow } from '$lib/services/month-status';

	let {
		locale = 'hu' as Locale,
		monthStatuses = [] as MonthStatusRow[],
		activeYear,
		activeMonth: activeMo
	}: {
		locale?: Locale;
		monthStatuses?: MonthStatusRow[];
		activeYear: number;
		activeMonth: number;
	} = $props();

	const activeProgress = $derived.by(() => {
		const row = monthStatuses.find((r) => r.year === activeYear && r.month === activeMo);
		return {
			done: row?.progressDone ?? 0,
			total: row?.progressTotal ?? 0
		};
	});
</script>

<div class="flex min-h-[4.5rem] flex-nowrap items-center justify-between gap-3 px-4 py-3">
	<div class="flex min-w-0 shrink-0 items-center gap-2.5">
		<button
			class="shrink-0 rounded p-2.5 hover:bg-card lg:hidden"
			onclick={toggleMobileNav}
			aria-label={t(locale, 'common.menu')}
		>
			☰
		</button>
		<a
			href="/dashboard?year={$activeMonth.year}&month={$activeMonth.month}"
			class="flex min-w-0 items-center gap-3"
			title="Legwor Labs – Kiss Ferenc"
		>
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary bg-warm text-lg font-bold text-primary"
			>
				LW
			</div>
			<span class="truncate whitespace-nowrap text-base font-semibold leading-snug xl:text-lg">
				Legwor Labs
				<span class="font-normal text-muted"> · Kiss Ferenc</span>
			</span>
		</a>
	</div>

	{#if activeProgress.total > 0}
		<div
			class="hidden min-w-0 flex-1 flex-col gap-1 px-2 sm:flex sm:max-w-[12rem] md:max-w-xs lg:max-w-sm"
			title="{activeProgress.done}/{activeProgress.total} {t(locale, 'statusPanel.progress')}"
		>
			<div class="flex items-center justify-between gap-2 text-[11px] text-muted">
				<span class="truncate">{t(locale, 'dashboard.checklist.title')}</span>
				<span class="shrink-0 tabular-nums">{activeProgress.done}/{activeProgress.total}</span>
			</div>
			<ProgressBar value={activeProgress.done} max={activeProgress.total} />
		</div>
	{/if}

	<div class="flex shrink-0 flex-nowrap items-center gap-2">
		{#if activeProgress.total > 0}
			<span
				class="shrink-0 tabular-nums text-xs text-muted sm:hidden"
				title="{activeProgress.done}/{activeProgress.total} {t(locale, 'statusPanel.progress')}"
			>
				{activeProgress.done}/{activeProgress.total}
			</span>
		{/if}
		<LanguageSelector {locale} />
		<div
			class="hidden whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white sm:block xl:px-3 xl:py-1.5 xl:text-sm"
		>
			{formatMonth($activeMonth, locale)}
		</div>
	</div>
</div>
