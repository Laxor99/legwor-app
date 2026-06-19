<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import LeftNav from '$lib/components/LeftNav.svelte';
	import RightStatusPanel from '$lib/components/RightStatusPanel.svelte';
	import { t } from '$lib/i18n';
	import type { MonthStatusRow } from '$lib/services/month-status';
	import type { Locale } from '$lib/i18n';

	let {
		children,
		eurRate = null,
		locale = 'hu' as Locale,
		monthStatuses = [] as MonthStatusRow[],
		year,
		month
	}: {
		children: import('svelte').Snippet;
		eurRate?: number | null;
		locale?: Locale;
		monthStatuses?: MonthStatusRow[];
		year: number;
		month: number;
	} = $props();
</script>

<div class="app-shell grid h-dvh overflow-hidden bg-background">
	<header class="border-b border-border bg-surface shadow-lg shadow-black/40" style="grid-area: header">
		<Header {eurRate} {locale} />
	</header>

	<LeftNav {locale} />

	<main class="main-content min-h-0 min-w-0 overflow-y-auto p-4 md:p-6" style="grid-area: main">
		<div class="mx-auto w-full max-w-7xl">
			{@render children()}
			<footer class="mt-8 border-t border-border pt-4 text-center text-xs text-muted">
				LEGWOR LABS Bt. · 9700 Szombathely, Irottkő u. 5. · {t(locale, 'footer.taxId')}: 21480799-2-18
			</footer>
		</div>
	</main>

	<RightStatusPanel {locale} {monthStatuses} activeYear={year} activeMonth={month} />
</div>
