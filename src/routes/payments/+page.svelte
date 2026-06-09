<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { formatHuf } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<svelte:head>
	<title>Fizetések – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Bankszámla / Fizetések</h1>
<p class="page-subtitle">{formatMonthHu({ year: data.year, month: data.month })}</p>

<Card title="Havi fizetések (Maricától kapott összegek)">
	<div class="space-y-4">
		{#each data.payments as payment}
			<form method="POST" action="?/save" use:enhance class="inner-card">
				<input type="hidden" name="paymentType" value={payment.key} />
				<div class="mb-2 flex items-center justify-between">
					<div>
						<span class="font-medium">{payment.label}</span>
						{#if payment.key === 'fleetcor'}
							<span class="ml-2 rounded bg-primary/15 px-2 py-0.5 text-xs text-primary">
								nem Maricától jön
							</span>
						{/if}
						<div class="text-xs text-muted">{payment.notes}</div>
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" name="isPaid" checked={payment.isPaid} />
						Fizetve
					</label>
				</div>
				<div class="grid gap-3 md:grid-cols-4">
					<div>
						<label class="form-label">Összeg (HUF)</label>
						<input type="number" name="actualAmount" value={payment.actualAmount} class="w-full" />
					</div>
					<div>
						<label class="form-label">Fizetés dátuma</label>
						<input type="date" name="paidDate" value={payment.paidDate ?? ''} class="w-full" />
					</div>
					<div>
						<label class="form-label">Bankszámla / címzett</label>
						<input type="text" name="bankAccount" value={payment.bankAccount} class="w-full" />
					</div>
					<div class="flex items-end">
						<button type="submit" class="btn-primary w-full">Mentés</button>
					</div>
				</div>
			</form>
		{/each}
	</div>
</Card>
