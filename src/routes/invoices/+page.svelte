<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatMonthHu } from '$lib/utils/dates';
	import { formatHuf, formatEur } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let tab = $state<'incoming' | 'outgoing'>('incoming');
</script>

<svelte:head>
	<title>Számlák – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">Számlák</h1>
<p class="page-subtitle">{formatMonthHu({ year: data.year, month: data.month })}</p>

<div class="mb-4 flex gap-2">
	<button class="btn-secondary {tab === 'incoming' ? 'tab-active' : ''}" onclick={() => (tab = 'incoming')}>
		Beérkező
	</button>
	<button class="btn-secondary {tab === 'outgoing' ? 'tab-active' : ''}" onclick={() => (tab = 'outgoing')}>
		Kiállított
	</button>
</div>

{#if tab === 'incoming'}
	<div class="grid gap-4 lg:grid-cols-2">
		<Card title="Új beérkező számla">
			<form method="POST" action="?/createIncoming" enctype="multipart/form-data" use:enhance class="space-y-3">
				<input type="text" name="issuer" placeholder="Kiállító neve" required class="w-full" />
				<div class="grid grid-cols-2 gap-2">
					<input type="date" name="invoiceDate" required />
					<input type="text" name="invoiceNumber" placeholder="Számla száma" required />
				</div>
				<div class="grid grid-cols-3 gap-2">
					<input type="number" name="netAmount" placeholder="Nettó" />
					<input type="number" name="vatAmount" placeholder="ÁFA" />
					<input type="number" name="grossAmount" placeholder="Bruttó" required />
				</div>
				<select name="category" class="w-full">
					<option value="Üzemanyag">Üzemanyag</option>
					<option value="Hotel">Hotel</option>
					<option value="FleetCor">FleetCor</option>
					<option value="Egyéb">Egyéb</option>
				</select>
				<select name="paymentStatus" class="w-full">
					<option value="Fizetendő">Fizetendő</option>
					<option value="Fizetve">Fizetve</option>
				</select>
				<input type="text" name="notes" placeholder="Megjegyzés" class="w-full" />
				<div>
					<label for="incoming-pdf" class="form-label">PDF csatolmány (opcionális)</label>
					<input id="incoming-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
				</div>
				<button type="submit" class="btn-primary">Mentés</button>
			</form>
		</Card>

		<Card title="FleetCor gyors-rögzítő">
			<form method="POST" action="?/fleetcor" enctype="multipart/form-data" use:enhance class="space-y-3">
				<input type="text" name="invoiceNumber" placeholder="Számla száma" required class="w-full" />
				<input type="number" name="grossAmount" placeholder="Bruttó összeg (HUF)" required class="w-full" />
				<div>
					<label for="fleetcor-pdf" class="form-label">PDF csatolmány</label>
					<input id="fleetcor-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
				</div>
				<button type="submit" class="btn-primary">FleetCor rögzítése</button>
			</form>
		</Card>
	</div>

	<Card title="Beérkező számlák">
		{#if data.incoming.length === 0}
			<p class="text-sm text-muted">Nincs rögzített számla.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="data-table">
					<thead>
						<tr>
							<th>Kiállító</th><th>Szám</th><th>Dátum</th><th>Bruttó</th><th>Kategória</th><th>PDF</th><th>Státusz</th><th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.incoming as inv}
							<tr>
								<td>{inv.issuer}</td>
								<td>{inv.invoiceNumber}</td>
								<td>{inv.invoiceDate}</td>
								<td>{formatHuf(inv.grossAmount)}</td>
								<td>{inv.category}</td>
								<td>
									{#if inv.filePath}
										<a href="/api/files/{inv.filePath}" target="_blank" class="link-action text-xs">PDF</a>
									{:else}
										<form method="POST" action="?/uploadPdf" enctype="multipart/form-data" use:enhance class="flex items-center gap-1">
											<input type="hidden" name="id" value={inv.id} />
											<input type="file" name="pdf" accept=".pdf" class="max-w-[100px] text-xs" required />
											<button type="submit" class="link-action text-xs">↑</button>
										</form>
									{/if}
								</td>
								<td>{inv.paymentStatus}</td>
								<td class="flex gap-2">
									{#if inv.paymentStatus !== 'Fizetve'}
										<form method="POST" action="?/markPaid" use:enhance>
											<input type="hidden" name="id" value={inv.id} />
											<button type="submit" class="text-xs text-success">Fizetve</button>
										</form>
									{/if}
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={inv.id} />
										<button type="submit" class="text-xs text-danger">Törlés</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</Card>
{:else}
	<Card title="Új kiállított számla">
		<form method="POST" action="?/createOutgoing" enctype="multipart/form-data" use:enhance class="grid gap-3 md:grid-cols-2">
			<input type="text" name="recipient" placeholder="Ügyfél" required />
			<input type="text" name="invoiceNumber" placeholder="Számla száma" required />
			<input type="date" name="invoiceDate" required />
			<input type="number" name="grossAmount" placeholder="Összeg EUR" step="0.01" required />
			<select name="contractId" class="w-full">
				<option value="">Szerződés (opcionális)</option>
				{#each data.contracts as c}
					<option value={c.id}>{c.clientName} – {c.contractNumber}</option>
				{/each}
			</select>
			<select name="paymentStatus">
				<option value="Kiállítva">Kiállítva</option>
				<option value="Jóváhagyva">Jóváhagyva</option>
				<option value="Befizetve">Befizetve</option>
			</select>
			<div class="md:col-span-2">
				<label for="outgoing-pdf" class="form-label">PDF csatolmány (opcionális)</label>
				<input id="outgoing-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
			</div>
			<button type="submit" class="btn-primary md:col-span-2">Mentés</button>
		</form>
	</Card>

	<Card title="Kiállított számlák">
		{#if data.outgoing.length === 0}
			<p class="text-sm text-muted">Nincs rögzített számla.</p>
		{:else}
			<table class="data-table">
				<thead>
					<tr><th>Ügyfél</th><th>Szám</th><th>Dátum</th><th>EUR</th><th>HUF</th><th>PDF</th><th>Státusz</th></tr>
				</thead>
				<tbody>
					{#each data.outgoing as inv}
						<tr>
							<td>{inv.recipient}</td>
							<td>{inv.invoiceNumber}</td>
							<td>{inv.invoiceDate}</td>
							<td>{formatEur(inv.grossAmount)}</td>
							<td>{inv.hufEquivalent ? formatHuf(inv.hufEquivalent) : '–'}</td>
							<td>
								{#if inv.filePath}
									<a href="/api/files/{inv.filePath}" target="_blank" class="link-action text-xs">PDF</a>
								{:else}
									–
								{/if}
							</td>
							<td>{inv.paymentStatus}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</Card>
{/if}
