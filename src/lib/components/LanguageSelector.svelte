<script lang="ts">
	import { page } from '$app/stores';
	import type { Locale } from '$lib/i18n';

	let { locale }: { locale: Locale } = $props();
</script>

<form method="POST" action="/api/locale" class="flex shrink-0 rounded border border-border bg-card p-0.5 text-xs">
	<input type="hidden" name="redirect" value="{$page.url.pathname}{$page.url.search}" />
	<button
		type="submit"
		name="locale"
		value="hu"
		class="rounded px-2 py-1 transition {locale === 'hu'
			? 'bg-primary text-white'
			: 'text-muted hover:text-foreground'}"
		aria-pressed={locale === 'hu'}
	>
		HU
	</button>
	<button
		type="submit"
		name="locale"
		value="en"
		class="rounded px-2 py-1 transition {locale === 'en'
			? 'bg-primary text-white'
			: 'text-muted hover:text-foreground'}"
		aria-pressed={locale === 'en'}
	>
		EN
	</button>
</form>
