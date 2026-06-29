<script lang="ts">
	import { page } from '$app/stores';
	import { scrollWhenNeeded } from '$lib/actions/scrollWhenNeeded';
	import { activeMonth } from '$lib/stores/month';
	import { sidebarCollapsed, toggleSidebarCollapsed, mobileNavOpen } from '$lib/stores/nav';
	import NavIcon from '$lib/components/NavIcon.svelte';
	import {
		overviewNavItem,
		secondaryNavItems,
		settingsNavItem,
		workflowSteps
	} from '$lib/config/workflow';
	import { t, type Locale } from '$lib/i18n';

	let { locale = 'hu' as Locale }: { locale?: Locale } = $props();

	function navigateWithMonth(href: string) {
		const ym = $activeMonth;
		return `${href}?year=${ym.year}&month=${ym.month}`;
	}

	function linkClass(href: string, collapsed: boolean): string {
		const active = $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
		const base = collapsed
			? 'flex items-center justify-center rounded-lg p-2.5 transition'
			: 'flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition';
		return `${base} ${active ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-card hover:text-foreground'}`;
	}

	function closeMobile() {
		mobileNavOpen.set(false);
	}
</script>

{#if $mobileNavOpen}
	<button
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		aria-label={t(locale, 'common.menu')}
		onclick={closeMobile}
	></button>
{/if}

<aside
	class="flex min-h-0 flex-col border-r border-border bg-surface transition-[width] duration-200
		{$sidebarCollapsed ? 'w-16' : 'w-[260px]'}
		{$mobileNavOpen ? 'fixed inset-y-0 left-0 z-50 w-[260px] shadow-xl lg:static' : 'hidden lg:flex'}"
	style="grid-area: left"
>
	<nav class="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden p-3" use:scrollWhenNeeded>
		<a
			href={navigateWithMonth(overviewNavItem.href)}
			class={linkClass(overviewNavItem.href, $mobileNavOpen ? false : $sidebarCollapsed)}
			onclick={closeMobile}
			title={t(locale, overviewNavItem.labelKey)}
		>
			<NavIcon icon={overviewNavItem.icon} />
			{#if $mobileNavOpen || !$sidebarCollapsed}
				<span class="min-w-0 truncate">{t(locale, overviewNavItem.headerLabelKey)}</span>
			{/if}
		</a>

		{#if $mobileNavOpen || !$sidebarCollapsed}
			<div class="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
				{t(locale, 'nav.workflow')}
			</div>
		{:else}
			<div class="my-1 border-t border-border"></div>
		{/if}

		{#each workflowSteps as item}
			<a
				href={navigateWithMonth(item.href)}
				class={linkClass(item.href, $mobileNavOpen ? false : $sidebarCollapsed)}
				onclick={closeMobile}
				title={t(locale, item.labelKey)}
			>
				<NavIcon icon={item.icon} />
				{#if $mobileNavOpen || !$sidebarCollapsed}
					<span class="min-w-0 truncate">{t(locale, item.headerLabelKey)}</span>
				{/if}
			</a>
		{/each}

		{#if $mobileNavOpen || !$sidebarCollapsed}
			<div class="mt-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
				{t(locale, 'nav.other')}
			</div>
		{:else}
			<div class="my-1 border-t border-border"></div>
		{/if}

		{#each secondaryNavItems as item}
			<a
				href={navigateWithMonth(item.href)}
				class={linkClass(item.href, $mobileNavOpen ? false : $sidebarCollapsed)}
				onclick={closeMobile}
				title={t(locale, item.labelKey)}
			>
				<NavIcon icon={item.icon} />
				{#if $mobileNavOpen || !$sidebarCollapsed}
					<span class="min-w-0 truncate">{t(locale, item.headerLabelKey)}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<div class="shrink-0 border-t border-border p-3">
		<a
			href={navigateWithMonth(settingsNavItem.href)}
			class={linkClass(settingsNavItem.href, $mobileNavOpen ? false : $sidebarCollapsed)}
			onclick={closeMobile}
			title={t(locale, settingsNavItem.labelKey)}
		>
			<NavIcon icon={settingsNavItem.icon} />
			{#if $mobileNavOpen || !$sidebarCollapsed}
				<span class="min-w-0 truncate">{t(locale, settingsNavItem.headerLabelKey)}</span>
			{/if}
		</a>
		<button
			type="button"
			class="mt-2 hidden w-full items-center justify-center rounded-lg border border-border px-2 py-1.5 text-muted hover:bg-card hover:text-foreground lg:flex"
			onclick={toggleSidebarCollapsed}
			aria-label={$sidebarCollapsed ? t(locale, 'nav.expandSidebar') : t(locale, 'nav.collapseSidebar')}
		>
			<NavIcon icon={$sidebarCollapsed ? 'chevron-right' : 'chevron-left'} />
		</button>
	</div>
</aside>
