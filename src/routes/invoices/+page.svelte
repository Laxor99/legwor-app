<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import {
		t,
		translateIncomingStatus,
		translateInvoiceCategory,
		translateOutgoingStatus
	} from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatHuf, formatEur } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let tab = $state<'incoming' | 'outgoing'>('incoming');
	const locale = $derived(data.locale);

	const categories = ['Üzemanyag', 'Hotel', 'FleetCor', 'Egyéb'] as const;
	const incomingStatuses = ['Fizetendő', 'Fizetve'] as const;
	const outgoingStatuses = ['Kiállítva', 'Jóváhagyva', 'Befizetve'] as const;
</script>

<svelte:head>
	<title>{t(locale, 'invoices.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'invoices.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

<div class="mb-4 flex gap-2">
	<button class="btn-secondary {tab === 'incoming' ? 'tab-active' : ''}" onclick={() => (tab = 'incoming')}>
		{t(locale, 'invoices.incoming')}
	</button>
	<button class="btn-secondary {tab === 'outgoing' ? 'tab-active' : ''}" onclick={() => (tab = 'outgoing')}>
		{t(locale, 'invoices.outgoing')}
	</button>
</div>

{#if tab === 'incoming'}
	<div class="grid gap-4 lg:grid-cols-2">
		<Card title={t(locale, 'invoices.newIncoming')}>
			<form method="POST" action="?/createIncoming" enctype="multipart/form-data" use:enhance class="space-y-3">
				<input type="text" name="issuer" placeholder={t(locale, 'invoices.issuer')} required class="w-full" />
				<div class="grid grid-cols-2 gap-2">
					<input type="date" name="invoiceDate" required />
					<input type="text" name="invoiceNumber" placeholder={t(locale, 'invoices.invoiceNumber')} required />
				</div>
				<div class="grid grid-cols-3 gap-2">
					<FormattedNumberInput name="netAmount" placeholder={t(locale, 'invoices.net')} class="w-full" />
					<FormattedNumberInput name="vatAmount" placeholder={t(locale, 'invoices.vat')} class="w-full" />
					<FormattedNumberInput name="grossAmount" placeholder={t(locale, 'invoices.gross')} required class="w-full" />
				</div>
				<select name="category" class="w-full">
					{#each categories as cat}
						<option value={cat}>{translateInvoiceCategory(locale, cat)}</option>
					{/each}
				</select>
				<select name="paymentStatus" class="w-full">
					{#each incomingStatuses as status}
						<option value={status}>{translateIncomingStatus(locale, status)}</option>
					{/each}
				</select>
				<input type="text" name="notes" placeholder={t(locale, 'common.notes')} class="w-full" />
				<div>
					<label for="incoming-pdf" class="form-label"
						>{t(locale, 'invoices.pdfAttachment')} ({t(locale, 'common.optional')})</label
					>
					<input id="incoming-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
				</div>
				<button type="submit" class="btn-primary">{t(locale, 'common.save')}</button>
			</form>
		</Card>

		<Card title={t(locale, 'invoices.fleetcorQuick')}>
			<form method="POST" action="?/fleetcor" enctype="multipart/form-data" use:enhance class="space-y-3">
				<input type="text" name="invoiceNumber" placeholder={t(locale, 'invoices.invoiceNumber')} required class="w-full" />
				<FormattedNumberInput name="grossAmount" placeholder={t(locale, 'invoices.grossAmountHuf')} required class="w-full" />
				<div>
					<label for="fleetcor-pdf" class="form-label">{t(locale, 'invoices.pdfAttachment')}</label>
					<input id="fleetcor-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
				</div>
				<button type="submit" class="btn-primary">{t(locale, 'invoices.recordFleetcor')}</button>
			</form>
		</Card>
	</div>

	<Card title={t(locale, 'invoices.incomingList')}>
		{#if data.incoming.length === 0}
			<p class="text-sm text-muted">{t(locale, 'common.noneRecordedInvoices')}</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="data-table">
					<thead>
						<tr>
							<th>{t(locale, 'invoices.issuerCol')}</th><th>{t(locale, 'common.number')}</th><th
								>{t(locale, 'common.date')}</th
							><th>{t(locale, 'invoices.gross')}</th><th>{t(locale, 'invoices.category')}</th><th
								>PDF</th
							><th>{t(locale, 'common.status')}</th><th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.incoming as inv}
							<tr>
								<td>{inv.issuer}</td>
								<td>{inv.invoiceNumber}</td>
								<td>{inv.invoiceDate}</td>
								<td>{formatHuf(inv.grossAmount, locale)}</td>
								<td>{translateInvoiceCategory(locale, inv.category ?? '')}</td>
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
								<td>{translateIncomingStatus(locale, inv.paymentStatus ?? '')}</td>
								<td class="flex gap-2">
									{#if inv.paymentStatus !== 'Fizetve'}
										<form method="POST" action="?/markPaid" use:enhance>
											<input type="hidden" name="id" value={inv.id} />
											<button type="submit" class="text-xs text-success">{t(locale, 'common.paid')}</button>
										</form>
									{/if}
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={inv.id} />
										<button type="submit" class="text-xs text-danger">{t(locale, 'common.delete')}</button>
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
	<Card title={t(locale, 'invoices.newOutgoing')}>
		<form method="POST" action="?/createOutgoing" enctype="multipart/form-data" use:enhance class="grid gap-3 md:grid-cols-2">
			<input type="text" name="recipient" placeholder={t(locale, 'common.client')} required />
			<input type="text" name="invoiceNumber" placeholder={t(locale, 'invoices.invoiceNumber')} required />
			<input type="date" name="invoiceDate" required />
			<FormattedNumberInput name="grossAmount" placeholder={t(locale, 'invoices.amountEur')} decimals={2} required class="w-full" />
			<select name="contractId" class="w-full">
				<option value="">{t(locale, 'invoices.contractOptional')}</option>
				{#each data.contracts as c}
					<option value={c.id}>{c.clientName} – {c.contractNumber}</option>
				{/each}
			</select>
			<select name="paymentStatus">
				{#each outgoingStatuses as status}
					<option value={status}>{translateOutgoingStatus(locale, status)}</option>
				{/each}
			</select>
			<div class="md:col-span-2">
				<label for="outgoing-pdf" class="form-label"
					>{t(locale, 'invoices.pdfAttachment')} ({t(locale, 'common.optional')})</label
				>
				<input id="outgoing-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
			</div>
			<button type="submit" class="btn-primary md:col-span-2">{t(locale, 'common.save')}</button>
		</form>
	</Card>

	<Card title={t(locale, 'invoices.outgoingList')}>
		{#if data.outgoing.length === 0}
			<p class="text-sm text-muted">{t(locale, 'common.noneRecordedInvoices')}</p>
		{:else}
			<table class="data-table">
				<thead>
					<tr
						><th>{t(locale, 'common.client')}</th><th>{t(locale, 'common.number')}</th><th
							>{t(locale, 'common.date')}</th
						><th>EUR</th><th>HUF</th><th>PDF</th><th>{t(locale, 'common.status')}</th><th></th></tr
					>
				</thead>
				<tbody>
					{#each data.outgoing as inv}
						<tr>
							<td>{inv.recipient}</td>
							<td>{inv.invoiceNumber}</td>
							<td>{inv.invoiceDate}</td>
							<td>{formatEur(inv.grossAmount, locale)}</td>
							<td>{inv.hufEquivalent ? formatHuf(inv.hufEquivalent, locale) : '–'}</td>
							<td>
								{#if inv.filePath}
									<a href="/api/files/{inv.filePath}" target="_blank" class="link-action text-xs">PDF</a>
								{:else}
									–
								{/if}
							</td>
							<td>{translateOutgoingStatus(locale, inv.paymentStatus ?? '')}</td>
							<td>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={inv.id} />
									<button type="submit" class="text-xs text-danger">{t(locale, 'common.delete')}</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</Card>
{/if}
