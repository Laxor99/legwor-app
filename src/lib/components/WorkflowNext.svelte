<script lang="ts">
	import { page } from '$app/stores';
	import { activeMonth } from '$lib/stores/month';
	import { getNextWorkflowStep } from '$lib/config/workflow';
	import { t, type Locale } from '$lib/i18n';

	let { locale = 'hu' as Locale }: { locale?: Locale } = $props();

	const next = $derived(getNextWorkflowStep($page.url.pathname, $page.url.searchParams));

	function nextHref(): string | null {
		if (!next) return null;
		const ym = $activeMonth;
		return `${next.href}?year=${ym.year}&month=${ym.month}`;
	}
</script>

{#if next}
	<div class="mt-4 flex justify-end border-t border-border pt-3">
		<a href={nextHref()} class="btn-primary inline-flex items-center gap-2 text-sm">
			{t(locale, 'workflow.nextStep')}: {t(locale, next.labelKey)} →
		</a>
	</div>
{/if}
