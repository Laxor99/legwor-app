<script lang="ts">
	import { page } from '$app/stores';
	import { activeMonth } from '$lib/stores/month';
	import { sidebarCollapsed, toggleSidebarCollapsed, mobileNavOpen } from '$lib/stores/nav';
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
			? 'flex items-center justify-center rounded-lg p-2.5 text-lg transition'
			: 'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition';
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
	<nav class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
		<a
			href={navigateWithMonth(overviewNavItem.href)}
			class={linkClass(overviewNavItem.href, $mobileNavOpen ? false : $sidebarCollapsed)}
			onclick={closeMobile}
			title={t(locale, overviewNavItem.labelKey)}
		>
			<span aria-hidden="true">{overviewNavItem.icon}</span>
			{#if $mobileNavOpen || !$sidebarCollapsed}
				<span>{t(locale, overviewNavItem.labelKey)}</span>
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
				<span class="{$mobileNavOpen || !$sidebarCollapsed ? 'w-5 shrink-0 text-center' : ''}" aria-hidden="true">{item.icon}</span>
				{#if $mobileNavOpen || !$sidebarCollapsed}
					<span>{t(locale, item.labelKey)}</span>
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
				<span class="{$mobileNavOpen || !$sidebarCollapsed ? 'w-5 shrink-0 text-center' : ''}" aria-hidden="true">{item.icon}</span>
				{#if $mobileNavOpen || !$sidebarCollapsed}
					<span>{t(locale, item.labelKey)}</span>
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
			<span aria-hidden="true">{settingsNavItem.icon}</span>
			{#if $mobileNavOpen || !$sidebarCollapsed}
				<span>{t(locale, settingsNavItem.labelKey)}</span>
			{/if}
		</a>
		<button
			type="button"
			class="mt-2 hidden w-full rounded-lg border border-border px-2 py-1.5 text-xs text-muted hover:bg-card hover:text-foreground lg:block"
			onclick={toggleSidebarCollapsed}
			aria-label={$sidebarCollapsed ? t(locale, 'nav.expandSidebar') : t(locale, 'nav.collapseSidebar')}
		>
			{$sidebarCollapsed ? '→' : '←'}
		</button>
	</div>
</aside>
