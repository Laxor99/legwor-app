<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { scrollWhenNeeded } from '$lib/actions/scrollWhenNeeded';
	import { activeMonth } from '$lib/stores/month';
	import { sidebarCollapsed, toggleSidebarCollapsed, mobileNavOpen } from '$lib/stores/nav';
	import NavIcon from '$lib/components/NavIcon.svelte';
	import {
		overviewNavItem,
		secondaryNavItems,
		settingsNavItem,
		workflowSteps,
		type WorkflowTaskKey
	} from '$lib/config/workflow';
	import { t, type Locale } from '$lib/i18n';
	import type { WorkflowTaskState, WorkflowTaskStatus } from '$lib/services/workflow-tasks';

	let {
		locale = 'hu' as Locale,
		workflowTasks = [] as WorkflowTaskState[]
	}: {
		locale?: Locale;
		workflowTasks?: WorkflowTaskState[];
	} = $props();

	const taskStatusByKey = $derived(
		Object.fromEntries(workflowTasks.map((task) => [task.key, task.status])) as Record<
			WorkflowTaskKey,
			WorkflowTaskStatus | undefined
		>
	);

	let skippingKey = $state<WorkflowTaskKey | null>(null);

	function navigateWithMonth(href: string) {
		const ym = $activeMonth;
		return `${href}?year=${ym.year}&month=${ym.month}`;
	}

	function isWorkflowLinkActive(href: string): boolean {
		const pathname = $page.url.pathname;
		if (pathname === href) return true;
		if (href === '/invoices/incoming') {
			return (
				pathname.startsWith('/invoices/incoming') ||
				(pathname.startsWith('/invoices') && $page.url.searchParams.get('tab') === 'incoming')
			);
		}
		if (href === '/invoices/outgoing') {
			return (
				pathname.startsWith('/invoices/outgoing') ||
				(pathname.startsWith('/invoices') &&
					$page.url.searchParams.get('tab') !== 'incoming' &&
					pathname.startsWith('/invoices'))
			);
		}
		return pathname.startsWith(href + '/');
	}

	function linkClass(
		href: string,
		collapsed: boolean,
		status?: WorkflowTaskStatus,
		compact = false
	): string {
		const active = isWorkflowLinkActive(href);
		const base = collapsed
			? 'flex items-center justify-center rounded-lg p-2.5 transition'
			: compact
				? 'flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition'
				: 'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition';
		const tone =
			status === 'skipped'
				? 'text-muted-dim line-through'
				: status === 'done'
					? 'text-muted'
					: active
						? 'bg-primary/15 text-primary'
						: 'text-muted hover:bg-card hover:text-foreground';
		return `${base} ${tone}`;
	}

	function statusLabel(status: WorkflowTaskStatus): string {
		switch (status) {
			case 'in_progress':
				return t(locale, 'workflow.taskInProgress');
			case 'done':
				return t(locale, 'workflow.taskDone');
			case 'skipped':
				return t(locale, 'workflow.taskSkipped');
			default:
				return '';
		}
	}

	function statusBadgeClass(status: WorkflowTaskStatus): string {
		switch (status) {
			case 'in_progress':
				return 'border-warning/40 bg-warning/10 text-warning';
			case 'done':
				return 'border-success/40 bg-success/10 text-success';
			case 'skipped':
				return 'border-border bg-surface text-muted-dim';
			default:
				return '';
		}
	}

	function canSkip(status?: WorkflowTaskStatus): boolean {
		return status === 'pending' || status === 'in_progress';
	}

	async function toggleSkip(taskKey: WorkflowTaskKey, skipped: boolean) {
		skippingKey = taskKey;
		try {
			const ym = $activeMonth;
			const res = await fetch('/api/workflow/skip', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					year: ym.year,
					month: ym.month,
					taskKey,
					skipped
				})
			});
			if (res.ok) await invalidateAll();
		} finally {
			skippingKey = null;
		}
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
			class={linkClass(overviewNavItem.href, $mobileNavOpen ? false : $sidebarCollapsed, undefined, true)}
			onclick={closeMobile}
			title={t(locale, overviewNavItem.labelKey)}
		>
			<NavIcon icon={overviewNavItem.icon} class="text-sm" />
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

		{#each workflowSteps as item (item.key)}
			{@const status = taskStatusByKey[item.key]}
			<div class="flex min-w-0 items-center gap-0.5">
				<a
					href={navigateWithMonth(item.href)}
					class={linkClass(item.href, $mobileNavOpen ? false : $sidebarCollapsed, status)}
					onclick={closeMobile}
					title={t(locale, item.labelKey)}
				>
					<NavIcon icon={item.icon} />
					{#if $mobileNavOpen || !$sidebarCollapsed}
						<span class="min-w-0 truncate">{t(locale, item.headerLabelKey)}</span>
						{#if status && status !== 'pending'}
							<span
								class="ml-auto shrink-0 rounded border px-1 py-0.5 text-[9px] font-medium leading-none {statusBadgeClass(status)}"
							>
								{#if status === 'done'}
									<span aria-hidden="true">✓ </span>
								{/if}
								{statusLabel(status)}
							</span>
						{/if}
					{:else if status === 'done'}
						<span class="text-[10px] text-success" aria-label={statusLabel(status)}>✓</span>
					{:else if status === 'in_progress'}
						<span class="h-2 w-2 rounded-full bg-warning" aria-label={statusLabel(status)}></span>
					{:else if status === 'skipped'}
						<span class="text-[10px] text-muted-dim" aria-label={statusLabel(status)}>—</span>
					{/if}
				</a>
				{#if ($mobileNavOpen || !$sidebarCollapsed) && (canSkip(status) || status === 'skipped')}
					<button
						type="button"
						class="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-card hover:text-foreground disabled:opacity-50"
						disabled={skippingKey === item.key}
						title={status === 'skipped'
							? t(locale, 'workflow.unskipTask')
							: t(locale, 'workflow.skipTask')}
						aria-label={status === 'skipped'
							? t(locale, 'workflow.unskipTask')
							: t(locale, 'workflow.skipTask')}
						onclick={() => toggleSkip(item.key, status !== 'skipped')}
					>
						<NavIcon icon={status === 'skipped' ? 'rotate-left' : 'forward'} class="text-xs" />
					</button>
				{/if}
			</div>
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
				class={linkClass(item.href, $mobileNavOpen ? false : $sidebarCollapsed, undefined, true)}
				onclick={closeMobile}
				title={t(locale, item.labelKey)}
			>
				<NavIcon icon={item.icon} class="text-sm" />
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
