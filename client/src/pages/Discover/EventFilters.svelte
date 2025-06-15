<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    let {
        sortBy = $bindable(),
        sortOrder = $bindable(),
        timeFilter = $bindable(),
        selectedTypes = $bindable(),
        userLatitude = $bindable(),
        userLongitude = $bindable()
    } = $props();

    let eventTypes = $state();

    let showFilters = $state(false);

    let canSortByDistance = $derived(
        userLatitude != null && userLongitude != null
    );

    onMount(async () => {
        const { result, error, ok } = await apiFetch(`${$BASE_URL}/api/events/types`);

        if (ok) {
            eventTypes = result.data;
        } else {
            toastr.error("Could not load event types.");
            console.error("Failed to fetch event types:", error);
        }
    });

    async function requestLocationAndThenFetch() {
        if (!navigator.geolocation) {
            toastr.error("Geolocation is not supported by this browser.");
            sortBy = "date";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                toastr.success("Location obtained. Event list updated.");
            },
            (error) => {
                console.error("Error getting user location:", error.message);
                toastr.error(`Could not get location: ${error.message}.`);
                sortBy = "date";
            },
        );
    }
</script>

<div class="controls-container">
    <div class="sort-controls">
        <div class="control-group">
            <label for="sort-by">Sort by</label>
            <select id="sort-by" bind:value={sortBy}>
                <option value="date">Date</option>
                <option value="distance">Distance</option>
                <option value="price">Price</option>
            </select>
        </div>
        <div class="control-group">
            <label for="sort-order">Order</label>
            <select id="sort-order" bind:value={sortOrder}>
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
            </select>
        </div>
        <div class="control-group">
            <label for="time-filter">Show</label>
            <select id="time-filter" bind:value={timeFilter}>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="all">All</option>
            </select>
        </div>
        <button class="filter-toggle-button" onclick={() => (showFilters = !showFilters)}>
            <ion-icon name="options-outline"></ion-icon>
            Filter by Type
        </button>
        {#if sortBy === 'distance' && !canSortByDistance}
            <button class="location-button" onclick={requestLocationAndThenFetch}>
                <ion-icon name="navigate"></ion-icon>Use My Location
            </button>
        {/if}
    </div>

    {#if showFilters}
        <div class="filter-pane">
            <fieldset class="type-filter">
                <div class="checkbox-group">
                    {#each eventTypes as type (type.id)}
                        <label class="checkbox-label">
                            <input type="checkbox" bind:group={selectedTypes} value={type.id} />
                            <span>{type.name}</span>
                        </label>
                    {/each}
                </div>
            </fieldset>
        </div>
    {/if}
</div>

<style>
    .controls-container {
        background-color: var(--ep-background-dark, #f7f7f7);
        border: 1px solid var(--ep-border);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 2rem;
    }

    .sort-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
    }

    .control-group {
        display: flex;
        flex-direction: column;
    }

    .control-group label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--ep-text-secondary);
        margin-bottom: 0.25rem;
    }

    select {
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid var(--ep-border);
        background-color: var(--ep-background-light);
        color: var(--ep-text-primary);
        font-size: 0.9em;
    }

    .filter-toggle-button,
    .location-button {
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid var(--ep-border);
        font-size: 0.9em;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease-in-out;
    }

    .filter-toggle-button {
        background-color: var(--ep-background-light);
        color: var(--ep-text-primary);
    }

    .filter-toggle-button:hover {
        background-color: var(--ep-accent);
        border-color: #ccc;
    }

    .location-button {
        background-color: var(--ep-primary);
        border-color: var(--ep-primary);
        color: var(--ep-text-on-primary);
    }

    .location-button:hover {
        background-color: #008a91;
    }

    .filter-pane {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--ep-border);
        animation: fade-in 0.3s ease;
    }

    .type-filter {
        border: none;
        padding: 0;
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 15px;
    }

    .checkbox-label {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        font-size: 0.9em;
        background-color: var(--ep-background-light);
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid var(--ep-border);
        transition: all 0.2s ease;
    }

    .checkbox-label:hover {
        border-color: var(--ep-primary);
    }

    .checkbox-label input {
        display: none;
    }

    .checkbox-label span {
        position: relative;
        padding-left: 24px;
    }

    .checkbox-label span::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid var(--ep-border);
        border-radius: 4px;
        background: white;
        transition: all 0.2s ease;
    }

    .checkbox-label input:checked + span::before {
        border-color: var(--ep-primary);
        background-color: var(--ep-primary);
    }

    .checkbox-label input:checked + span::after {
        content: "✔";
        position: absolute;
        left: 2px;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-size: 16px;
        font-weight: bold;
    }
</style>