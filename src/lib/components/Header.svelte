<script lang="ts">
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { activeMonth } from '$lib/stores/month';
	import { toggleMobileNav } from '$lib/stores/nav';
	import { t, type Locale } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';

	let { locale = 'hu' as Locale }: { locale?: Locale } = $props();
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

	<div class="flex shrink-0 flex-nowrap items-center gap-2">
		<LanguageSelector {locale} />
		<div
			class="hidden whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white sm:block xl:px-3 xl:py-1.5 xl:text-sm"
		>
			{formatMonth($activeMonth, locale)}
		</div>
	</div>
</div>
