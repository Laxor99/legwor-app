<script lang="ts">
	import { activeMonth } from '$lib/stores/month';
	import { navItems } from '$lib/config/navigation';
	import { page } from '$app/stores';

	function navigateWithMonth(href: string) {
		const ym = $activeMonth;
		return `${href}?year=${ym.year}&month=${ym.month}`;
	}
</script>

<aside class="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
	<nav class="space-y-1 p-4">
		{#each navItems as item}
			<a
				href={navigateWithMonth(item.href)}
				class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition {$page.url.pathname.startsWith(
					item.href
				)
					? 'bg-primary/15 text-primary'
					: 'text-muted hover:bg-card hover:text-foreground'}"
			>
				<span class="w-5 shrink-0 text-center" aria-hidden="true">{item.icon}</span>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>
