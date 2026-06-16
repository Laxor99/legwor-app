<script lang="ts">
	import '../../app.css';

	let { data, children } = $props();

	$effect(() => {
		document.documentElement.lang = data.locale;
	});
</script>

{@render children()}
