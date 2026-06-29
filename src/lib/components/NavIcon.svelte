<script lang="ts">
	let {
		icon,
		class: className = '',
		regular = false
	}: {
		/** Font Awesome icon name without fa- prefix, e.g. "car" */
		icon: string;
		class?: string;
		regular?: boolean;
	} = $props();
</script>

<i
	class="{regular ? 'fa-regular' : 'fa-solid'} fa-{icon} w-[1.125rem] shrink-0 text-center {className}"
	aria-hidden="true"
></i>
