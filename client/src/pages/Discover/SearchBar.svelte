<script>
    let { searchQuery = $bindable() } = $props()

</script>

<div class="search-container">
    <input
        type="search"
        class="search-input"
        placeholder="Search events by name or keyword..."
        bind:value={searchQuery}
        aria-label="Search events"
    />
    <ion-icon name="search-outline"></ion-icon>
</div>

<style>
    .search-container {
        position: relative;
        max-width: 500px;
        margin: 0 auto 1.5rem auto;
    }
    .search-input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.7rem;
        font-size: 1rem;
        border: 1px solid var(--ep-border);
        border-radius: 8px;
        box-sizing: border-box;
    }
    .search-input:focus {
        outline: none;
        border-color: var(--ep-primary);
        box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.2);
    }
    .search-container ion-icon {
        position: absolute;
        left: 0.9rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ep-text-secondary);
        font-size: 1.3em;
        pointer-events: none;
    }
</style>