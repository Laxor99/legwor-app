<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Bejelentkezés – Legwor Labs</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-xl shadow-black/40">
		<div class="mb-6 text-center">
			<div
				class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded border border-primary bg-warm text-xl font-bold text-primary"
			>
				LW
			</div>
			<h1 class="text-xl font-semibold text-foreground">Legwor Labs</h1>
			<p class="text-sm text-muted">Kiss Ferenc</p>
		</div>

		{#if form?.error}
			<div class="alert-error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div>
				<label for="pin" class="form-label">PIN kód</label>
				<input
					id="pin"
					type="password"
					name="pin"
					inputmode="numeric"
					autocomplete="current-password"
					required
					class="w-full"
				/>
			</div>
			<button type="submit" class="btn-primary w-full">Belépés</button>
		</form>
	</div>
</div>
