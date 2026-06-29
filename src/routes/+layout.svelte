<script lang="ts">
	import '../app.css';
	import AppShell from '$lib/components/AppShell.svelte';
	import { activeMonth } from '$lib/stores/month';

	let { data, children } = $props();

	$effect(() => {
		activeMonth.set({ year: data.year, month: data.month });
	});

	$effect(() => {
		document.documentElement.lang = data.locale;
	});
</script>

<AppShell
	locale={data.locale}
	monthStatuses={data.monthStatuses}
	year={data.year}
	month={data.month}
>
	{@render children()}
</AppShell>
