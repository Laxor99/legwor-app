<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { t } from '$lib/i18n';

	let { data } = $props();

	let approvalSubject = $state('');
	let approvalBody = $state('');
	let accountantSubject = $state('');
	let accountantBody = $state('');
	let docs = $state({
		bankStatement: true,
		invoices: true,
		carExcel: false,
		carPdf: false
	});

	const locale = $derived(data.locale);

	$effect(() => {
		if (!data.dashboard) return;
		const d = data.dashboard;
		approvalSubject = `Ferenc Kiss Time and Expense ${data.year} [${data.monthEn}]`;
		approvalBody = `Hello Vincent,

Time
Normal working   ${d.worktime.normalDays} days
Extra days       ${d.worktime.extraDays} days
In total         ${d.worktime.totalDays} days
Targeted annual  ${d.worktime.yearlyWorked}/${d.worktime.limit} days

Expenses
Hotel            ${d.expenses.hotel.toLocaleString('hu-HU')} HUF
Car              ${d.expenses.car.toLocaleString('hu-HU')} HUF

Please approve with reply to this email
Many thanks in advance
Regards

Ferenc Kiss
Automation Technology Manager
IT Local Business Partner
Mobile: +36704520246, +36 30 3480 915
Givaudan International SA, Bence u. 1., Váci Greens, 'B' building, H-1138 Budapest, Hungary`;

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
	<title>{t(locale, 'email.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'email.title')}</h1>

<div class="grid gap-6 lg:grid-cols-2">
	<Card title={t(locale, 'email.approvalCard')}>
		<div class="space-y-3">
			<div>
				<label class="form-label">{t(locale, 'common.subject')}</label>
				<input type="text" bind:value={approvalSubject} class="w-full" />
			</div>
			<div>
				<label class="form-label">{t(locale, 'common.body')}</label>
				<textarea bind:value={approvalBody} rows="16" class="w-full font-mono text-xs"></textarea>
			</div>
			<button
				class="btn-primary"
				onclick={() => copyToClipboard(`Subject: ${approvalSubject}\n\n${approvalBody}`)}
			>
				{t(locale, 'common.copyToClipboard')}
			</button>
		</div>
	</Card>

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
			<button
				class="btn-primary"
				onclick={() => copyToClipboard(`Subject: ${accountantSubject}\n\n${accountantBody}`)}
			>
				{t(locale, 'common.copyToClipboard')}
			</button>
		</div>
	</Card>
</div>
