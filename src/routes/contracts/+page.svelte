<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatEur } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<svelte:head>
	<title>Szerződések – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Szerződések</h1>

<Card title="Új szerződés">
	<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance class="grid gap-3 md:grid-cols-2">
		<input type="text" name="clientName" placeholder="Ügyfél neve" required class="w-full" />
		<input type="text" name="contractNumber" placeholder="Szerződésszám" class="w-full" />
		<input type="date" name="startDate" />
		<input type="date" name="endDate" />
		<input type="number" name="dailyRate" placeholder="Napidíj" step="0.01" />
		<select name="currency">
			<option value="EUR">EUR</option>
			<option value="HUF">HUF</option>
		</select>
		<input type="text" name="paymentTerms" placeholder="Fizetési feltételek" class="md:col-span-2 w-full" />
		<textarea name="notes" placeholder="Megjegyzés" rows="2" class="md:col-span-2 w-full"></textarea>
		<div class="md:col-span-2">
			<label for="contract-pdf" class="form-label">Szerződés PDF (opcionális)</label>
			<input id="contract-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
		</div>
		<button type="submit" class="btn-primary md:col-span-2">Mentés</button>
	</form>
</Card>

<Card title="Szerződések listája">
	{#if data.contracts.length === 0}
		<p class="text-sm text-muted">Nincs rögzített szerződés.</p>
	{:else}
		<div class="space-y-3">
			{#each data.contracts as contract}
				<div class="inner-card">
					<div class="flex items-start justify-between">
						<div>
							<div class="font-semibold">{contract.clientName}</div>
							<div class="text-sm text-muted">{contract.contractNumber}</div>
						</div>
						<span
							class="{contract.status === 'active' ? 'badge-active' : 'badge-inactive'}"
						>
							{contract.status === 'active' ? 'Aktív' : 'Inaktív'}
						</span>
					</div>
					<div class="mt-2 grid grid-cols-2 gap-2 text-sm">
						<span>Kezdés: {contract.startDate ?? '–'}</span>
						<span>Napidíj: {formatEur(contract.dailyRate)} {contract.currency}</span>
					</div>
					{#if contract.notes}
						<p class="mt-2 text-xs text-muted">{contract.notes}</p>
					{/if}
					<div class="mt-3 flex flex-wrap items-center gap-3">
						{#if contract.filePath}
							<a href="/api/files/{contract.filePath}" target="_blank" class="link-action text-sm">
								📄 Szerződés PDF
							</a>
						{:else}
							<form method="POST" action="?/uploadPdf" enctype="multipart/form-data" use:enhance class="flex items-center gap-2">
								<input type="hidden" name="id" value={contract.id} />
								<input type="file" name="pdf" accept=".pdf" class="text-xs" required />
								<button type="submit" class="link-action text-xs">PDF feltöltés</button>
							</form>
						{/if}
						<form method="POST" action="?/toggleStatus" use:enhance>
							<input type="hidden" name="id" value={contract.id} />
							<button type="submit" class="link-action text-xs">
								{contract.status === 'active' ? 'Inaktívvá tesz' : 'Aktívvá tesz'}
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Card>
