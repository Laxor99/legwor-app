<script lang="ts">
	let {
		title,
		children
	}: {
		title?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<section class="rounded-xl border border-border bg-card p-5 shadow-sm shadow-black/20">
	{#if title}
		<h2 class="mb-4 text-lg font-semibold text-foreground">{title}</h2>
	{/if}
	{@render children()}
</section>
