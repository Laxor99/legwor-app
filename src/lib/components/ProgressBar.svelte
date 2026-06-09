<script lang="ts">
	let {
		value,
		max,
		warning = 'none'
	}: {
		value: number;
		max: number;
		warning?: 'none' | 'yellow' | 'red';
	} = $props();

	const percent = $derived(max > 0 ? Math.min(100, (value / max) * 100) : 0);
	const barColor = $derived(
		warning === 'red' ? 'bg-danger' : warning === 'yellow' ? 'bg-warning' : 'bg-primary'
	);
</script>

<div class="h-2 w-full overflow-hidden rounded-full bg-surface">
	<div class="h-full transition-all {barColor}" style="width: {percent}%"></div>
</div>
