<script lang="ts">
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { activeMonth } from '$lib/stores/month';
	import { navItems } from '$lib/config/navigation';
	import { t, type Locale } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { monthOptions } from '$lib/utils/dates';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { eurRate = null, locale = 'hu' as Locale }: { eurRate?: number | null; locale?: Locale } =
		$props();

	let mobileOpen = $state(false);

	function navigateWithMonth(href: string) {
		const ym = $activeMonth;
		return `${href}?year=${ym.year}&month=${ym.month}`;
	}

	function onMonthChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const [year, month] = val.split('-').map(Number);
		activeMonth.set({ year, month });
		const url = new URL($page.url);
		url.searchParams.set('year', String(year));
		url.searchParams.set('month', String(month));
		goto(url, { replaceState: true, keepFocus: true, noScroll: true, invalidateAll: true });
	}

	function navLinkClass(href: string): string {
		const active = $page.url.pathname.startsWith(href);
		return `whitespace-nowrap rounded px-2 py-1.5 text-xs transition hover:bg-card xl:px-2.5 xl:text-sm ${
			active ? 'bg-card text-primary' : 'text-muted'
		}`;
	}
</script>

<header class="border-b border-border bg-surface text-foreground shadow-lg shadow-black/40">
	<div class="mx-auto flex min-h-[4.5rem] max-w-7xl flex-nowrap items-center justify-between gap-3 px-4 py-3">
		<div class="flex min-w-0 shrink-0 items-center gap-2.5">
			<button
				class="shrink-0 rounded p-2.5 hover:bg-card lg:hidden"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label={t(locale, 'common.menu')}
			>
				☰
			</button>
			<a
				href={navigateWithMonth('/dashboard')}
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

		<!-- Compact nav on md–lg; sidebar takes over at lg+ -->
		<nav class="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex lg:hidden">
			{#each navItems as item}
				<a href={navigateWithMonth(item.href)} class={navLinkClass(item.href)}>
					<span class="mr-0.5" aria-hidden="true">{item.icon}</span>{t(locale, item.headerLabelKey)}
				</a>
			{/each}
		</nav>

		<div class="flex shrink-0 flex-nowrap items-center gap-2">
			<LanguageSelector {locale} />
			{#if eurRate}
				<span class="hidden whitespace-nowrap text-xs text-muted sm:inline xl:text-sm">
					EUR/HUF: {eurRate.toFixed(2)}
				</span>
			{/if}
			<div
				class="hidden whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white sm:block xl:px-3 xl:py-1.5 xl:text-sm"
			>
				{formatMonth($activeMonth, locale)}
			</div>
			<select
				class="max-w-[9.5rem] shrink-0 truncate rounded border border-border bg-card px-2 py-1 text-xs text-foreground xl:max-w-none xl:text-sm"
				onchange={onMonthChange}
				value="{$activeMonth.year}-{$activeMonth.month}"
				aria-label={t(locale, 'common.activeMonth')}
			>
				{#each monthOptions() as opt}
					<option value="{opt.year}-{opt.month}">{formatMonth(opt, locale)}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if mobileOpen}
		<nav class="border-t border-border px-4 py-2 lg:hidden">
			{#each navItems as item}
				<a
					href={navigateWithMonth(item.href)}
					class="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-card"
					onclick={() => (mobileOpen = false)}
				>
					<span aria-hidden="true">{item.icon}</span>
					<span>{t(locale, item.labelKey)}</span>
				</a>
			{/each}
		</nav>
	{/if}
</header>
