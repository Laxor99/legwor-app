<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FormattedNumberInput from '$lib/components/FormattedNumberInput.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { enhance } from '$app/forms';
	let { data } = $props();
	const locale = $derived(data.locale);
</script>

<svelte:head>
	<title>{t(locale, 'payments.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'payments.title')}</h1>
<p class="page-subtitle">{formatMonth({ year: data.year, month: data.month }, locale)}</p>

<Card title={t(locale, 'payments.monthly')}>
	<div class="space-y-4">
		{#each data.payments as payment}
			<form method="POST" action="?/save" use:enhance class="inner-card">
				<input type="hidden" name="paymentType" value={payment.key} />
				<div class="mb-2 flex items-center justify-between">
					<div>
						<span class="font-medium">{payment.label}</span>
						{#if payment.key === 'fleetcor'}
							<span class="ml-2 rounded bg-primary/15 px-2 py-0.5 text-xs text-primary">
								{t(locale, 'payments.notFromMarica')}
							</span>
						{/if}
						<div class="text-xs text-muted">{payment.notes}</div>
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" name="isPaid" checked={payment.isPaid} />
						{t(locale, 'common.paid')}
					</label>
				</div>
				<div class="grid gap-3 md:grid-cols-4">
					<div>
						<label class="form-label">{t(locale, 'payments.amountHuf')}</label>
						<FormattedNumberInput
							name="actualAmount"
							value={payment.actualAmount}
							class="w-full"
						/>
					</div>
					<div>
						<label class="form-label">{t(locale, 'payments.paymentDate')}</label>
						<input type="date" name="paidDate" value={payment.paidDate ?? ''} class="w-full" />
					</div>
					<div>
						<label class="form-label">{t(locale, 'payments.bankAccount')}</label>
						<input type="text" name="bankAccount" value={payment.bankAccount} class="w-full" />
					</div>
					<div class="flex items-end">
						<button type="submit" class="btn-primary w-full">{t(locale, 'common.save')}</button>
					</div>
				</div>
			</form>
		{/each}
	</div>
</Card>
