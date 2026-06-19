<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	const locale = $derived(data.locale);
	let tab = $state<'general' | 'storage'>('general');
</script>

<svelte:head>
	<title>{t(locale, 'settings.pageTitle')}</title>
</svelte:head>

<h1 class="page-title">{t(locale, 'settings.title')}</h1>

{#if data.dbError}
	<div class="alert-error">{t(locale, 'dashboard.dbError')}</div>
{/if}

{#if form?.error}
	<div class="alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert-success mb-4">
		{form.testMessage ?? t(locale, 'common.saved')}
	</div>
{/if}

<div class="mb-4 flex gap-2">
	<button
		type="button"
		class="btn-secondary {tab === 'general' ? 'tab-active' : ''}"
		onclick={() => (tab = 'general')}
	>
		{t(locale, 'settings.general')}
	</button>
	<button
		type="button"
		class="btn-secondary {tab === 'storage' ? 'tab-active' : ''}"
		onclick={() => (tab = 'storage')}
	>
		{t(locale, 'settings.storage')}
	</button>
</div>

{#if tab === 'general'}
	<Card title={t(locale, 'settings.general')}>
		<form method="POST" action="?/saveGeneral" use:enhance class="grid gap-4 lg:grid-cols-2">
			<input type="hidden" name="year" value={data.year} />
			<div>
				<label class="form-label" for="nav_fuel_url">{t(locale, 'settings.navFuelUrl')}</label>
				<input id="nav_fuel_url" name="nav_fuel_url" value={data.config.nav_fuel_url ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="annual_limit">{t(locale, 'settings.annualLimit')}</label>
				<select id="annual_limit" name="annual_limit" class="w-full">
					<option value="220" selected={data.config.annual_day_limit === '220'}>220</option>
					<option value="228" selected={data.config.annual_day_limit === '228'}>228</option>
				</select>
			</div>
			<div>
				<label class="form-label" for="car_plate">{t(locale, 'settings.carPlate')}</label>
				<input id="car_plate" name="car_plate" value={data.config.car_plate ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="car_type">{t(locale, 'settings.carType')}</label>
				<input id="car_type" name="car_type" value={data.config.car_type ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="car_consumption">{t(locale, 'settings.consumption')}</label>
				<input id="car_consumption" name="car_consumption" value={data.config.car_consumption ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="car_amortization">{t(locale, 'settings.amortization')}</label>
				<input id="car_amortization" name="car_amortization" value={data.config.car_amortization ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="vincent_name">{t(locale, 'settings.vincentName')}</label>
				<input id="vincent_name" name="vincent_name" value={data.config.vincent_name ?? 'Vincent Dupuis'} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="vincent_email">{t(locale, 'settings.vincentEmail')}</label>
				<input id="vincent_email" name="vincent_email" type="email" value={data.config.vincent_email ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="marica_name">{t(locale, 'settings.maricaName')}</label>
				<input id="marica_name" name="marica_name" value={data.config.marica_name ?? ''} class="w-full" />
			</div>
			<div>
				<label class="form-label" for="marica_email">{t(locale, 'settings.maricaEmail')}</label>
				<input id="marica_email" name="marica_email" type="email" value={data.config.marica_email ?? ''} class="w-full" />
			</div>
			<div class="lg:col-span-2">
				<button type="submit" class="btn-primary">{t(locale, 'common.save')}</button>
			</div>
		</form>
	</Card>
{:else}
	<Card title={t(locale, 'settings.storage')}>
		<form method="POST" action="?/saveStorage" use:enhance class="space-y-4">
			<fieldset class="space-y-2">
				<legend class="text-sm font-medium">{t(locale, 'settings.storageMode')}</legend>
				<label class="flex items-center gap-2 text-sm">
					<input type="radio" name="storageType" value="local" checked={data.storage?.storageType !== 'supabase'} />
					{t(locale, 'settings.localStorage')}
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="radio" name="storageType" value="supabase" checked={data.storage?.storageType === 'supabase'} />
					{t(locale, 'settings.supabaseStorage')}
				</label>
			</fieldset>
			<div>
				<label class="form-label" for="localRootPath">{t(locale, 'settings.localPath')}</label>
				<input
					id="localRootPath"
					name="localRootPath"
					value={data.storage?.localRootPath ?? './uploads'}
					class="w-full font-mono text-xs"
				/>
			</div>
			<div class="grid gap-4 lg:grid-cols-2">
				<div>
					<label class="form-label" for="supabaseUrl">Supabase URL</label>
					<input id="supabaseUrl" name="supabaseUrl" value={data.storage?.supabaseUrl ?? ''} class="w-full" />
				</div>
				<div>
					<label class="form-label" for="supabaseBucket">{t(locale, 'settings.bucket')}</label>
					<input id="supabaseBucket" name="supabaseBucket" value={data.storage?.supabaseBucket ?? ''} class="w-full" />
				</div>
			</div>
			<div>
				<label class="form-label" for="supabaseKey">{t(locale, 'settings.apiKey')}</label>
				<input id="supabaseKey" name="supabaseKey" type="password" placeholder="••••••••" class="w-full" />
			</div>
			<p class="text-xs text-muted">{t(locale, 'settings.storageFolders')}</p>
			<div class="flex flex-wrap gap-2">
				<button type="submit" class="btn-primary">{t(locale, 'common.save')}</button>
			</div>
		</form>
		<form method="POST" action="?/testStorage" use:enhance class="mt-4">
			<button type="submit" class="btn-secondary">{t(locale, 'settings.testConnection')}</button>
			{#if data.storage?.lastTestedAt}
				<span class="ml-2 text-xs text-muted">
					{data.storage.lastTestSuccess ? '✓' : '✗'}
					{new Date(data.storage.lastTestedAt).toLocaleString(locale === 'hu' ? 'hu-HU' : 'en-US')}
				</span>
			{/if}
		</form>
	</Card>
{/if}
