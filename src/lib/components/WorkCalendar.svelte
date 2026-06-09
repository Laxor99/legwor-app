<script lang="ts">
	export type DayType = 'normal' | 'extra';

	let {
		year,
		month,
		days = $bindable<Record<string, DayType>>({})
	}: {
		year: number;
		month: number;
		days?: Record<string, DayType>;
	} = $props();

	const WEEKDAYS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

	const grid = $derived.by(() => {
		const first = new Date(year, month - 1, 1);
		const last = new Date(year, month, 0);
		const startPad = (first.getDay() + 6) % 7;
		const cells: Array<{ date: string; day: number; inMonth: boolean } | null> = [];

		for (let i = 0; i < startPad; i++) cells.push(null);
		for (let d = 1; d <= last.getDate(); d++) {
			const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({ date, day: d, inMonth: true });
		}
		return cells;
	});

	const normalCount = $derived(Object.values(days).filter((t) => t === 'normal').length);
	const extraCount = $derived(Object.values(days).filter((t) => t === 'extra').length);

	function toggle(date: string) {
		const current = days[date];
		const next = { ...days };
		if (!current) next[date] = 'normal';
		else if (current === 'normal') next[date] = 'extra';
		else delete next[date];
		days = next;
	}

	function cellClass(type: DayType | undefined): string {
		if (type === 'normal') return 'bg-primary text-white hover:bg-primary-hover';
		if (type === 'extra') return 'bg-warning text-black hover:brightness-110';
		return 'bg-surface text-foreground hover:bg-card-hover';
	}
</script>

<div>
	<div class="mb-3 flex flex-wrap gap-4 text-xs text-muted">
		<span class="flex items-center gap-1"
			><span class="inline-block h-3 w-3 rounded bg-primary"></span> Normál ({normalCount})</span
		>
		<span class="flex items-center gap-1"
			><span class="inline-block h-3 w-3 rounded bg-warning"></span> Extra ({extraCount})</span
		>
		<span class="text-muted-dim">Kattints: üres → normál → extra → üres</span>
	</div>

	<div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
		{#each WEEKDAYS as wd}
			<div class="py-1">{wd}</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 gap-1">
		{#each grid as cell}
			{#if cell}
				<button
					type="button"
					class="flex h-9 items-center justify-center rounded border border-border text-sm transition {cellClass(days[cell.date])}"
					onclick={() => toggle(cell.date)}
				>
					{cell.day}
				</button>
			{:else}
				<div class="h-9"></div>
			{/if}
		{/each}
	</div>
</div>
