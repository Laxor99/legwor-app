<script lang="ts">
	let {
		title,
		compact = false,
		children
	}: {
		title?: string;
		compact?: boolean;
		children: import('svelte').Snippet;
	} = $props();
</script>

<section
	class="rounded-xl border border-border bg-card shadow-sm shadow-black/20 {compact
		? 'p-4'
		: 'p-5'}"
>
	{#if title}
		<h2 class="{compact ? 'mb-3 text-base' : 'mb-4 text-lg'} font-semibold text-foreground">{title}</h2>
	{/if}
	{@render children()}
</section>
