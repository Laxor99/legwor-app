<script lang="ts">
	import { getMessages, type Locale } from '$lib/i18n';

	export type DayType = 'normal' | 'extra';
	type PaintMode = DayType | 'clear';

	let {
		year,
		month,
		days,
		onDaysChange,
		locale = 'hu' as Locale
	}: {
		year: number;
		month: number;
		days: Record<string, DayType>;
		onDaysChange: (days: Record<string, DayType>) => void;
		locale?: Locale;
	} = $props();

	let paintMode = $state<PaintMode>('normal');
	let painting = $state(false);
	let strokeStart = $state<string | null>(null);
	let strokeHadMode = $state<DayType | undefined>(undefined);
	let lastPainted = $state<string | null>(null);
	let moved = $state(false);
	let gridEl = $state<HTMLDivElement | null>(null);

	const weekdays = $derived(getMessages(locale).worktime.weekdays);

	const grid = $derived.by(() => {
		const first = new Date(year, month - 1, 1);
		const last = new Date(year, month, 0);
		const startPad = (first.getDay() + 6) % 7;
		const cells: Array<{ date: string; day: number; weekend: boolean } | null> = [];

		for (let i = 0; i < startPad; i++) cells.push(null);
		for (let d = 1; d <= last.getDate(); d++) {
			const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			const weekday = new Date(year, month - 1, d).getDay();
			cells.push({ date, day: d, weekend: weekday === 0 || weekday === 6 });
		}
		return cells;
	});

	const normalCount = $derived(Object.values(days).filter((t) => t === 'normal').length);
	const extraCount = $derived(Object.values(days).filter((t) => t === 'extra').length);
	const m = $derived(getMessages(locale).worktime);

	function commitDays(next: Record<string, DayType>) {
		onDaysChange(next);
	}

	function dateFromEvent(e: PointerEvent): string | null {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		return el?.closest<HTMLElement>('[data-date]')?.dataset.date ?? null;
	}

	function paintCell(date: string) {
		if (date === lastPainted) return;
		lastPainted = date;

		const next = { ...days };
		if (paintMode === 'clear') {
			delete next[date];
		} else {
			next[date] = paintMode;
		}
		commitDays(next);
	}

	function startStroke(date: string, e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();

		painting = true;
		strokeStart = date;
		strokeHadMode = days[date];
		lastPainted = null;
		moved = false;
		paintCell(date);

		gridEl?.setPointerCapture(e.pointerId);
	}

	function continueStroke(date: string) {
		if (!painting) return;
		if (date !== strokeStart) moved = true;
		paintCell(date);
	}

	function endStroke() {
		if (!painting) return;

		if (!moved && strokeStart && paintMode !== 'clear' && strokeHadMode === paintMode) {
			const next = { ...days };
			delete next[strokeStart];
			commitDays(next);
		}

		painting = false;
		strokeStart = null;
		strokeHadMode = undefined;
		lastPainted = null;
		moved = false;
	}

	function onGridPointerDown(e: PointerEvent) {
		const date = dateFromEvent(e);
		if (date) startStroke(date, e);
	}

	function onGridPointerMove(e: PointerEvent) {
		if (!painting) return;
		const date = dateFromEvent(e);
		if (date) continueStroke(date);
	}

	function cellClass(type: DayType | undefined, weekend: boolean): string {
		if (type === 'normal') {
			return 'border-primary bg-primary text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:bg-primary-hover';
		}
		if (type === 'extra') {
			return 'border-2 border-dashed border-warning bg-warning/15 text-warning hover:bg-warning/25';
		}
		if (weekend) {
			return 'border-border/40 bg-background/80 text-muted-dim hover:bg-card-hover';
		}
		return 'border-border bg-surface text-foreground hover:bg-card-hover';
	}

	function modeButtonClass(mode: PaintMode): string {
		const base = 'rounded-lg border px-3 py-1.5 text-xs font-medium transition';
		if (paintMode !== mode) {
			return `${base} border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground`;
		}
		if (mode === 'normal') return `${base} border-primary bg-primary/20 text-primary ring-2 ring-primary/50`;
		if (mode === 'extra') return `${base} border-warning bg-warning/15 text-warning ring-2 ring-warning/50`;
		return `${base} border-border bg-card text-foreground ring-2 ring-muted/50`;
	}
</script>

<svelte:window onpointerup={endStroke} onpointercancel={endStroke} />

<div>
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<button type="button" class={modeButtonClass('normal')} onclick={() => (paintMode = 'normal')}>
			<span class="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-primary"></span>
			{m.calendarNormal}
		</button>
		<button type="button" class={modeButtonClass('extra')} onclick={() => (paintMode = 'extra')}>
			<span
				class="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-warning bg-warning/30"
			></span>
			{m.calendarExtra}
		</button>
		<button type="button" class={modeButtonClass('clear')} onclick={() => (paintMode = 'clear')}>
			{m.calendarClear}
		</button>
	</div>

	<p class="mb-3 text-xs text-muted-dim">{m.calendarHint}</p>

	<div class="mb-2 flex flex-wrap gap-4 text-xs text-muted">
		<span>{m.calendarNormal}: {normalCount}</span>
		<span>{m.calendarExtra}: {extraCount}</span>
	</div>

	<div class="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
		{#each weekdays as wd, i}
			<div class="py-1 {i >= 5 ? 'text-muted-dim' : ''}">{wd}</div>
		{/each}
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={gridEl}
		class="grid grid-cols-7 gap-1.5 select-none touch-none"
		class:cursor-crosshair={painting}
		onpointerdown={onGridPointerDown}
		onpointermove={onGridPointerMove}
		role="group"
		aria-label={m.calendar}
	>
		{#each grid as cell}
			{#if cell}
				{@const type = days[cell.date]}
				<div
					data-date={cell.date}
					class="relative flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition {cellClass(
						type,
						cell.weekend
					)}"
					role="button"
					tabindex="-1"
					aria-label="{cell.day} – {type ?? 'unmarked'}"
				>
					{cell.day}
					{#if type === 'normal'}
						<span
							class="pointer-events-none absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded bg-white/20 text-[9px] font-bold leading-none"
							>N</span
						>
					{:else if type === 'extra'}
						<span
							class="pointer-events-none absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded border border-warning/60 bg-warning/30 text-[9px] font-bold leading-none"
							>+</span
						>
					{/if}
				</div>
			{:else}
				<div class="h-10"></div>
			{/if}
		{/each}
	</div>
</div>
