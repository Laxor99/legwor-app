<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let docs = $state({
		bankStatement: true,
		invoices: true,
		carExcel: false,
		carPdf: false
	});

	let accountantSubject = $state('');
	let accountantBody = $state('');
	const locale = $derived(data.locale);

	$effect(() => {
		if (!data.dashboard) return;
		const d = data.dashboard;
		const invoiceList = data.invoices.map((i) => i.invoiceNumber).join(', ') || '–';
		const paymentLines = d.payments
			.filter((p) => p.key !== 'fleetcor')
			.map(
				(p) =>
					`${p.label.padEnd(14)} ${p.actualAmount.toLocaleString('hu-HU')} HUF  → ${p.bankAccount || '–'}`
			)
			.join('\n');

		accountantSubject = `${data.monthHu} elszámolás – Legwor Labs`;
		accountantBody = `Kedves Marica,

Mellékelem a ${data.monthHu} havi dokumentumokat:
${docs.bankStatement ? `- OTP bankszámlakivonat: ${data.year}_${String(data.month).padStart(2, '0')}` : ''}
${docs.invoices ? `- Számlák: ${invoiceList}` : ''}
${docs.carExcel ? `- Car Excel: Car ${data.year} ${String(data.month).padStart(2, '0')}.xlsx` : ''}
${docs.carPdf ? `- Car PDF: Car ${data.year} ${String(data.month).padStart(2, '0')}.pdf` : ''}

Fizetések összefoglalója:
${paymentLines}

Üdvözlettel,
Ferenc Kiss`;
	});

	async function copyToClipboard(text: string) {
		await navigator.clipboard.writeText(text);
	}
</script>

<svelte:head>
	<title>{t(locale, 'nav.maricaEmail')} – Legwor Labs</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'nav.maricaEmail')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

{#if form?.success}
	<div class="alert-success mb-4">{t(locale, 'common.saved')}</div>
{/if}

{#if data.maricaSent}
	<div class="alert-success mb-4">{t(locale, 'email.maricaSent')}</div>
{/if}

<Card title={t(locale, 'email.accountantCard')}>
	<div class="space-y-3">
		<div class="space-y-2 text-sm">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={docs.bankStatement} />
				{t(locale, 'email.bankStatement')}
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={docs.invoices} />
				{t(locale, 'email.invoices')}
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={docs.carExcel} />
				{t(locale, 'email.carExcel')}
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={docs.carPdf} />
				{t(locale, 'email.carPdf')}
			</label>
		</div>
		<div>
			<label class="form-label">{t(locale, 'common.subject')}</label>
			<input type="text" bind:value={accountantSubject} class="w-full" />
		</div>
		<div>
			<label class="form-label">{t(locale, 'common.body')}</label>
			<textarea bind:value={accountantBody} rows="16" class="w-full font-mono text-xs"></textarea>
		</div>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="btn-primary"
				onclick={() => copyToClipboard(`Subject: ${accountantSubject}\n\n${accountantBody}`)}
			>
				{t(locale, 'common.copyToClipboard')}
			</button>
			<form method="POST" action="?/markSent" use:enhance>
				<input type="hidden" name="year" value={data.year} />
				<input type="hidden" name="month" value={data.month} />
				<button type="submit" class="btn-secondary">{t(locale, 'email.markMaricaSent')}</button>
			</form>
		</div>
	</div>
</Card>
