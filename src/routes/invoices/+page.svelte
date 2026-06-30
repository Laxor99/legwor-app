<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import NavIcon from '$lib/components/NavIcon.svelte';
	import {
		t,
		translateIncomingStatus,
		translateInvoiceCategory,
		translateOutgoingStatus
	} from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { formatHuf, formatEur } from '$lib/utils/format';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let { data } = $props();

	function tabFromUrl(url: URL): 'incoming' | 'outgoing' {
		const tabParam = url.searchParams.get('tab');
		if (tabParam === 'incoming' || tabParam === 'outgoing') return tabParam;
		if (url.pathname.startsWith('/invoices/incoming')) return 'incoming';
		if (url.pathname.startsWith('/invoices/outgoing')) return 'outgoing';
		return 'outgoing';
	}

	let tab = $state<'incoming' | 'outgoing'>(tabFromUrl(get(page).url));
	const locale = $derived(data.locale);

	$effect(() => {
		tab = tabFromUrl($page.url);
	});

	function setTab(next: 'incoming' | 'outgoing') {
		const url = new URL(get(page).url);
		url.searchParams.set('tab', next);
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}

	function preserveTab(expected: 'incoming' | 'outgoing') {
		return () =>
			async ({
				result,
				update
			}: {
				result: { type: string };
				update: (opts?: { invalidateAll?: boolean }) => Promise<void>;
			}) => {
				await update();
				if (result.type !== 'success') return;
				const url = new URL(get(page).url);
				if (url.searchParams.get('tab') !== expected) {
					url.searchParams.set('tab', expected);
					await goto(url, { replaceState: true, keepFocus: true, noScroll: true });
				}
			};
	}

	const categories = ['Üzemanyag', 'Hotel', 'FleetCor', 'Egyéb'] as const;
	const incomingStatuses = ['Fizetendő', 'Fizetve'] as const;
	const outgoingStatuses = ['Kiállítva', 'Jóváhagyva', 'Befizetve'] as const;
</script>

<svelte:head>
	<title>{t(locale, 'invoices.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'invoices.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

<div class="mb-4 inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
	<button
		type="button"
		class="shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition {tab === 'outgoing'
			? 'bg-primary text-white'
			: 'text-muted hover:bg-card-hover hover:text-foreground'}"
		onclick={() => setTab('outgoing')}
	>
		{t(locale, 'invoices.outgoing')}
	</button>
	<button
		type="button"
		class="shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition {tab === 'incoming'
			? 'bg-primary text-white'
			: 'text-muted hover:bg-card-hover hover:text-foreground'}"
		onclick={() => setTab('incoming')}
	>
		{t(locale, 'invoices.incoming')}
	</button>
</div>

{#if tab === 'incoming'}
	<div class="grid gap-4 lg:grid-cols-2">
		<Card title={t(locale, 'invoices.newIncoming')}>
			<form method="POST" action="?/createIncoming" enctype="multipart/form-data" use:enhance={preserveTab('incoming')} class="space-y-3">
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
			<form method="POST" action="?/fleetcor" enctype="multipart/form-data" use:enhance={preserveTab('incoming')} class="space-y-3">
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
										<form method="POST" action="?/uploadPdf" enctype="multipart/form-data" use:enhance={preserveTab('incoming')} class="flex items-center gap-1">
											<input type="hidden" name="id" value={inv.id} />
											<input type="file" name="pdf" accept=".pdf" class="max-w-[100px] text-xs" required />
											<button type="submit" class="link-action text-xs">↑</button>
										</form>
									{/if}
								</td>
								<td>{translateIncomingStatus(locale, inv.paymentStatus ?? '')}</td>
								<td>
									<div class="flex flex-wrap items-center gap-2">
									{#if inv.paymentStatus !== 'Fizetve'}
										<form method="POST" action="?/markPaid" use:enhance={preserveTab('incoming')}>
											<input type="hidden" name="id" value={inv.id} />
											<button type="submit" class="whitespace-nowrap text-xs text-success"
												>{t(locale, 'common.paid')}</button
											>
										</form>
									{/if}
									<form method="POST" action="?/delete" use:enhance={preserveTab('incoming')}>
										<input type="hidden" name="id" value={inv.id} />
										<button
											type="submit"
											class="rounded p-1 text-danger transition hover:bg-danger/10"
											aria-label={t(locale, 'common.delete')}
										>
											<NavIcon icon="trash-can" />
										</button>
									</form>
									</div>
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
		<form method="POST" action="?/createOutgoing" enctype="multipart/form-data" use:enhance={preserveTab('outgoing')} class="grid gap-3 md:grid-cols-2">
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
								<form method="POST" action="?/delete" use:enhance={preserveTab('outgoing')}>
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
