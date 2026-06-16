<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import { t } from '$lib/i18n';
	import { formatEur } from '$lib/utils/format';
	import { enhance } from '$app/forms';

	let { data } = $props();
	const locale = $derived(data.locale);
</script>

<svelte:head>
	<title>{t(locale, 'contracts.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'contracts.title')}</h1>

<Card title={t(locale, 'contracts.new')}>
	<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance class="grid gap-3 md:grid-cols-2">
		<input type="text" name="clientName" placeholder={t(locale, 'contracts.clientName')} required class="w-full" />
		<input type="text" name="contractNumber" placeholder={t(locale, 'contracts.contractNumber')} class="w-full" />
		<input type="date" name="startDate" />
		<input type="date" name="endDate" />
		<FormattedNumberInput name="dailyRate" placeholder={t(locale, 'common.dailyRate')} decimals={2} class="w-full" />
		<select name="currency">
			<option value="EUR">EUR</option>
			<option value="HUF">HUF</option>
		</select>
		<input type="text" name="paymentTerms" placeholder={t(locale, 'contracts.paymentTerms')} class="md:col-span-2 w-full" />
		<textarea name="notes" placeholder={t(locale, 'common.notes')} rows="2" class="md:col-span-2 w-full"></textarea>
		<div class="md:col-span-2">
			<label for="contract-pdf" class="form-label"
				>{t(locale, 'contracts.contractPdf')} ({t(locale, 'common.optional')})</label
			>
			<input id="contract-pdf" type="file" name="pdf" accept="application/pdf,.pdf" class="w-full text-sm" />
		</div>
		<button type="submit" class="btn-primary md:col-span-2">{t(locale, 'common.save')}</button>
	</form>
</Card>

<Card title={t(locale, 'contracts.list')}>
	{#if data.contracts.length === 0}
		<p class="text-sm text-muted">{t(locale, 'common.noneRecordedContracts')}</p>
	{:else}
		<div class="space-y-3">
			{#each data.contracts as contract}
				<div class="inner-card">
					<div class="flex items-start justify-between">
						<div>
							<div class="font-semibold">{contract.clientName}</div>
							<div class="text-sm text-muted">{contract.contractNumber}</div>
						</div>
						<span class="{contract.status === 'active' ? 'badge-active' : 'badge-inactive'}">
							{contract.status === 'active'
								? t(locale, 'common.active')
								: t(locale, 'common.inactive')}
						</span>
					</div>
					<div class="mt-2 grid grid-cols-2 gap-2 text-sm">
						<span>{t(locale, 'common.start')}: {contract.startDate ?? '–'}</span>
						<span
							>{t(locale, 'common.dailyRate')}: {formatEur(contract.dailyRate, locale)}
							{contract.currency}</span
						>
					</div>
					{#if contract.notes}
						<p class="mt-2 text-xs text-muted">{contract.notes}</p>
					{/if}
					<div class="mt-3 flex flex-wrap items-center gap-3">
						{#if contract.filePath}
							<a href="/api/files/{contract.filePath}" target="_blank" class="link-action text-sm">
								📄 {t(locale, 'contracts.contractPdfLink')}
							</a>
						{:else}
							<form method="POST" action="?/uploadPdf" enctype="multipart/form-data" use:enhance class="flex items-center gap-2">
								<input type="hidden" name="id" value={contract.id} />
								<input type="file" name="pdf" accept=".pdf" class="text-xs" required />
								<button type="submit" class="link-action text-xs">{t(locale, 'common.uploadPdf')}</button>
							</form>
						{/if}
						<form method="POST" action="?/toggleStatus" use:enhance>
							<input type="hidden" name="id" value={contract.id} />
							<button type="submit" class="link-action text-xs">
								{contract.status === 'active'
									? t(locale, 'common.deactivate')
									: t(locale, 'common.activate')}
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Card>
