<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { t } from '$lib/i18n';
	import { activeMonth } from '$lib/stores/month';

	let { data, children } = $props();

	$effect(() => {
		activeMonth.set({ year: data.year, month: data.month });
	});

	$effect(() => {
		document.documentElement.lang = data.locale;
	});
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Header eurRate={data.eurRate} locale={data.locale} />
	<div class="mx-auto flex w-full max-w-7xl flex-1">
		<Sidebar locale={data.locale} />
		<main class="flex-1 p-4 md:p-6">
			{@render children()}
		</main>
	</div>
	<footer class="border-t border-border bg-surface py-3 text-center text-xs text-muted">
		LEGWOR LABS Bt. · 9700 Szombathely, Irottkő u. 5. · {t(data.locale, 'footer.taxId')}: 21480799-2-18
	</footer>
</div>
