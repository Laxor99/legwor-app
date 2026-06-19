<script lang="ts">
	import { goto } from '$app/navigation';
	import { activeMonth } from '$lib/stores/month';
	import { t, type Locale } from '$lib/i18n';
	import { formatMonthLabel, yearOptions } from '$lib/utils/dates';
	import { statusBadgeClass, statusLabelKey } from '$lib/utils/approval-email';
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
		activeMo: number;
	} = $props();

	function selectMonth(year: number, month: number) {
		activeMonth.set({ year, month });
		const url = new URL(window.location.href);
		url.searchParams.set('year', String(year));
		url.searchParams.set('month', String(month));
		goto(url, { replaceState: true, keepFocus: true, noScroll: true, invalidateAll: true });
	}

	function onYearChange(e: Event) {
		const year = Number((e.target as HTMLSelectElement).value);
		selectMonth(year, activeMo);
	}

	const years = yearOptions();

	function isActive(row: MonthStatusRow): boolean {
		return row.year === activeYear && row.month === activeMo;
	}

	let scrollEl = $state<HTMLDivElement | null>(null);
	let lastScrolledKey = $state('');

	$effect(() => {
		const key = `${activeYear}-${activeMo}`;
		if (!scrollEl || key === lastScrolledKey) return;
		lastScrolledKey = key;
		requestAnimationFrame(() => {
			const btn = scrollEl?.querySelector(`[data-month="${key}"]`);
			if (!btn || !scrollEl) return;
			const btnEl = btn as HTMLElement;
			const top = btnEl.offsetTop;
			const bottom = top + btnEl.offsetHeight;
			const viewTop = scrollEl.scrollTop;
			const viewBottom = viewTop + scrollEl.clientHeight;
			if (top < viewTop) scrollEl.scrollTop = top;
			else if (bottom > viewBottom) scrollEl.scrollTop = bottom - scrollEl.clientHeight;
		});
	});

	function onWheel(e: WheelEvent) {
		const el = scrollEl;
		if (!el) return;
		const { scrollTop, scrollHeight, clientHeight } = el;
		const atTop = scrollTop <= 0;
		const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
		const goingUp = e.deltaY < 0;
		const goingDown = e.deltaY > 0;
		if ((atTop && goingUp) || (atBottom && goingDown)) return;
		e.stopPropagation();
	}
</script>

<aside class="status-panel hidden border-l border-border bg-surface xl:grid" style="grid-area: right">
	<div class="status-panel-header shrink-0 border-b border-border px-4 py-3">
		<h2 class="mb-2 text-sm font-semibold text-foreground">{t(locale, 'statusPanel.title')}</h2>
		<label class="block">
			<span class="mb-1 block text-xs text-muted">{t(locale, 'statusPanel.year')}</span>
			<select
				class="w-full text-sm"
				value={activeYear}
				onchange={onYearChange}
				aria-label={t(locale, 'statusPanel.year')}
			>
				{#each years as y}
					<option value={y}>{y}</option>
				{/each}
			</select>
		</label>
	</div>

	<div
		class="month-status-scroll min-h-0 overflow-y-scroll overscroll-y-contain"
		bind:this={scrollEl}
		onwheel={onWheel}
		role="list"
		aria-label={t(locale, 'statusPanel.title')}
	>
		{#each monthStatuses as row (row.year + '-' + row.month)}
			<button
				type="button"
				data-month="{row.year}-{row.month}"
				role="listitem"
				class="mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-card
					{isActive(row) ? 'border-l-2 border-primary bg-primary/10 pl-[10px]' : ''}"
				onclick={() => selectMonth(row.year, row.month)}
			>
				<span class="truncate font-medium {isActive(row) ? 'text-primary' : 'text-foreground'}">
					{formatMonthLabel({ year: row.year, month: row.month }, locale)}
				</span>
				<span
					class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium {statusBadgeClass(row.status)}"
				>
					{#if row.status === 'lezarva'}
						<span aria-hidden="true">✓ </span>
					{/if}
					{t(locale, statusLabelKey(row.status))}
				</span>
			</button>
		{/each}
	</div>
</aside>
