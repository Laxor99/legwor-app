<script>
  let count = 0;
</script>

<main class="shell">
  <header class="header">
    <h1>LegworAPP</h1>
    <p class="tagline">New project — ready to build.</p>
  </header>

  <section class="card">
    <p class="hint">Edit <code>src/App.svelte</code> to get started.</p>
    <button type="button" class="btn" on:click={() => (count += 1)}>
      Count: {count}
    </button>
  </section>
</main>

<style>
  .shell {
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  .header {
    margin-bottom: 32px;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .tagline {
    margin: 0;
    color: var(--text-muted);
    font-size: 1rem;
  }

  .card {
    padding: 24px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  }

  .hint {
    margin: 0 0 16px;
    color: var(--text-muted);
  }

  code {
    font-size: 0.9em;
    color: var(--accent-soft);
  }

  .btn {
    border: 1px solid var(--accent);
    background: rgba(99, 102, 241, 0.15);
    color: var(--accent-soft);
    border-radius: 8px;
    padding: 10px 18px;
    font-weight: 600;
  }

  .btn:hover {
    background: rgba(99, 102, 241, 0.28);
  }
</style>
