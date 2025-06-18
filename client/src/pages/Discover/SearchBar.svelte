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
        margin: auto;
    }
    .search-input {
        padding: 0.8rem 1rem 0.8rem 2.7rem;
    }
    .search-container ion-icon {
        position: absolute;
        left: 0.9rem;
        top: 25%;
        color: var(--ep-text-secondary);
        font-size: 1.3em;
        pointer-events: none;
    }
</style>