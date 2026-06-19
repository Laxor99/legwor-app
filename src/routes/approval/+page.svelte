<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import WorkflowNext from '$lib/components/WorkflowNext.svelte';
	import { t } from '$lib/i18n';
	import { formatMonth } from '$lib/utils/dates';
	import { buildApprovalEmail, statusBadgeClass, statusLabelKey } from '$lib/utils/approval-email';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const locale = $derived(data.locale);
	const email = $derived(
		data.dashboard
			? buildApprovalEmail(data.year, data.month, data.dashboard, data.config)
			: { subject: '', body: '', mailto: '' }
	);

	let approverResponse = $state(data.approval?.approverResponse ?? '');
	let rejectionReason = $state(data.approval?.rejectionReason ?? '');
	let copied = $state(false);

	async function copyEmail() {
		await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
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
				<div class="rounded-lg border border-border bg-surface p-4 font-mono text-xs whitespace-pre-wrap">
					<strong>{t(locale, 'common.subject')}:</strong> {email.subject}

					<hr class="my-3 border-border" />
					{email.body}
				</div>
				<div class="flex flex-wrap gap-2">
					<button type="button" class="btn-primary" onclick={copyEmail}>
						{copied ? t(locale, 'common.saved') : t(locale, 'common.copyToClipboard')}
					</button>
					{#if email.mailto}
						<a href={email.mailto} class="btn-secondary">{t(locale, 'approval.openEmail')}</a>
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-muted">{t(locale, 'common.noneRecorded')}</p>
		{/if}
	</Card>

	<Card title={t(locale, 'approval.actions')}>
		<div class="space-y-4">
			<form method="POST" action="?/submit" use:enhance class="space-y-2">
				<input type="hidden" name="year" value={data.year} />
				<input type="hidden" name="month" value={data.month} />
				<p class="text-sm text-muted">{t(locale, 'approval.submitHint')}</p>
				<button type="submit" class="btn-primary w-full sm:w-auto">
					{t(locale, 'approval.submit')}
				</button>
			</form>

			<hr class="border-border" />

			<form method="POST" action="?/approve" use:enhance class="space-y-2">
				<input type="hidden" name="year" value={data.year} />
				<input type="hidden" name="month" value={data.month} />
				<label class="form-label" for="approverResponse">{t(locale, 'approval.responseNotes')}</label>
				<textarea
					id="approverResponse"
					name="approverResponse"
					bind:value={approverResponse}
					rows="2"
					class="w-full"
					placeholder={t(locale, 'approval.responsePlaceholder')}
				></textarea>
				<button type="submit" class="btn-secondary w-full sm:w-auto">
					{t(locale, 'approval.markApproved')}
				</button>
			</form>

			<form method="POST" action="?/reject" use:enhance class="space-y-2">
				<input type="hidden" name="year" value={data.year} />
				<input type="hidden" name="month" value={data.month} />
				<label class="form-label" for="rejectionReason">{t(locale, 'approval.rejectionReason')}</label>
				<textarea
					id="rejectionReason"
					name="rejectionReason"
					bind:value={rejectionReason}
					rows="2"
					class="w-full"
					required
				></textarea>
				<button type="submit" class="btn-secondary border-danger/40 text-danger w-full sm:w-auto">
					{t(locale, 'approval.markRejected')}
				</button>
			</form>

			<hr class="border-border" />

			<form method="POST" action="?/uploadFile" enctype="multipart/form-data" use:enhance class="space-y-2">
				<input type="hidden" name="year" value={data.year} />
				<input type="hidden" name="month" value={data.month} />
				<label class="form-label" for="approvalFile">{t(locale, 'approval.uploadDoc')}</label>
				<input type="file" id="approvalFile" name="approvalFile" accept=".pdf,application/pdf" class="w-full" />
				{#if data.approval?.approvalFilePath}
					<p class="text-xs text-muted">
						{t(locale, 'approval.currentFile')}: {data.approval.approvalFilePath}
					</p>
				{/if}
				<button type="submit" class="btn-secondary w-full sm:w-auto">{t(locale, 'common.uploadPdf')}</button>
			</form>
		</div>
	</Card>
</div>

<WorkflowNext {locale} />
