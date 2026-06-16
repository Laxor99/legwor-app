<script lang="ts">
	import { formatInputNumber, parseNumber } from '$lib/utils/format';

	interface Props {
		name: string;
		value?: number | string | null;
		placeholder?: string;
		required?: boolean;
		decimals?: number;
		class?: string;
		id?: string;
	}

	let {
		name,
		value = $bindable<number | string | null | undefined>(undefined),
		placeholder = '',
		required = false,
		decimals = 0,
		class: className = '',
		id
	}: Props = $props();

	let display = $state('');
	let submitValue = $state('');

	function toSubmitValue(raw: string): string {
		if (!raw) return '';
		const n = parseNumber(raw);
		if (!Number.isFinite(n)) return '';
		return decimals > 0 ? String(n) : String(Math.round(n));
	}

	function applyRawInput(raw: string) {
		let cleaned = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
		const parts = cleaned.split('.');
		if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
		if (decimals === 0) {
			cleaned = cleaned.split('.')[0] ?? '';
		} else if (cleaned.includes('.')) {
			const [intPart, decPart = ''] = cleaned.split('.');
			cleaned = `${intPart}.${decPart.slice(0, decimals)}`;
		}

		display = formatInputNumber(cleaned, decimals);
		submitValue = toSubmitValue(cleaned);
		value = submitValue === '' ? '' : parseNumber(submitValue);
	}

	function onInput(e: Event) {
		applyRawInput((e.target as HTMLInputElement).value);
	}

	$effect(() => {
		if (value === '' || value === null || value === undefined) {
			display = '';
			submitValue = '';
			return;
		}
		const n = Number(value);
		if (!Number.isFinite(n)) return;
		const raw = decimals > 0 ? String(n) : String(Math.round(n));
		display = formatInputNumber(raw, decimals);
		submitValue = raw;
	});
</script>

<input
	type="text"
	{id}
	{placeholder}
	{required}
	class={className}
	value={display}
	oninput={onInput}
	autocomplete="off"
	inputmode="decimal"
/>
<input type="hidden" {name} value={submitValue} />
