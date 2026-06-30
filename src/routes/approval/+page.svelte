<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import {
		buildApprovalEmail,
		buildApprovalMailto,
		statusBadgeClass,
		statusLabelKey
	} from '$lib/utils/approval-email';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const locale = $derived(data.locale);

	let emailSubject = $state('');
	let emailBody = $state('');
	let seededMonth = $state('');

	const mailto = $derived(buildApprovalMailto(emailSubject, emailBody, data.config ?? {}));

	function applyGeneratedEmail() {
		if (!data.dashboard) {
			emailSubject = '';
			emailBody = '';
			return;
		}
		const built = buildApprovalEmail(data.year, data.month, data.dashboard, data.config);
		emailSubject = built.subject;
		emailBody = built.body;
	}

	$effect(() => {
		const monthKey = `${data.year}-${data.month}`;
		if (!data.dashboard) {
			emailSubject = '';
			emailBody = '';
			seededMonth = monthKey;
			return;
		}
		if (monthKey !== seededMonth) {
			seededMonth = monthKey;
			applyGeneratedEmail();
		}
	});

	let copied = $state(false);

	async function copyEmail() {
		await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>{t(locale, 'approval.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'approval.title')}</h1>
<p class="page-subtitle">
	{formatMonth({ year: data.year, month: data.month }, locale)}
	{#if data.status}
		<span
			class="ml-2 inline-flex rounded border px-2 py-0.5 text-xs font-medium {statusBadgeClass(data.status)}"
		>
			{t(locale, statusLabelKey(data.status))}
		</span>
	{/if}
</p>

{#if data.dbError}
	<div class="alert-error">{t(locale, 'dashboard.dbError')}</div>
{/if}

{#if form?.error}
	<div class="alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert-success mb-4">{t(locale, 'common.saved')}</div>
{/if}

<div class="grid gap-6 lg:grid-cols-2">
	<Card title={t(locale, 'approval.preview')}>
		{#if data.dashboard}
			<div class="space-y-3 text-sm">
				<div>
					<label class="form-label" for="approval-subject">{t(locale, 'common.subject')}</label>
					<input id="approval-subject" type="text" bind:value={emailSubject} class="w-full" />
				</div>
				<div>
					<label class="form-label" for="approval-body">{t(locale, 'common.body')}</label>
					<textarea
						id="approval-body"
						bind:value={emailBody}
						rows="18"
						class="w-full font-mono text-xs"
					></textarea>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<button type="button" class="btn-primary" onclick={copyEmail}>
						{copied ? t(locale, 'common.saved') : t(locale, 'common.copyToClipboard')}
					</button>
					{#if mailto}
						<a href={mailto} class="btn-secondary">{t(locale, 'approval.openEmail')}</a>
					{/if}
					<button type="button" class="btn-secondary" onclick={applyGeneratedEmail}>
						{t(locale, 'approval.refreshFromData')}
					</button>
					<form method="POST" action="?/submit" use:enhance class="inline">
						<input type="hidden" name="year" value={data.year} />
						<input type="hidden" name="month" value={data.month} />
						<button type="submit" class="btn-secondary">
							{t(locale, 'approval.submit')}
						</button>
					</form>
				</div>
				<p class="text-xs text-muted">{t(locale, 'approval.submitHint')}</p>
			</div>
		{:else}
			<p class="text-muted">{t(locale, 'common.noneRecorded')}</p>
		{/if}
	</Card>

	<Card title={t(locale, 'approval.uploadDoc')}>
		<form method="POST" action="?/uploadFile" enctype="multipart/form-data" use:enhance class="space-y-3">
			<input type="hidden" name="year" value={data.year} />
			<input type="hidden" name="month" value={data.month} />
			<input type="file" id="approvalFile" name="approvalFile" accept=".pdf,application/pdf" class="w-full" />
			{#if data.approval?.approvalFilePath}
				<p class="text-xs text-muted">
					{t(locale, 'approval.currentFile')}: {data.approval.approvalFilePath}
				</p>
			{/if}
			<button type="submit" class="btn-primary w-full sm:w-auto">{t(locale, 'common.save')}</button>
		</form>
	</Card>
</div>
