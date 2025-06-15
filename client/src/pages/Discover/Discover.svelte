<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { apiFetch } from "../../util/fetch";

    import SearchBar from "./SearchBar.svelte";
    import EventFilters from "./EventFilters.svelte";
    import EventGrid from "./EventGrid.svelte";

    let events = $state([]);

    let searchQuery = $state("");

    let sortBy = $state("date");
    let sortOrder = $state("ASC");
    let timeFilter = $state("upcoming");
    let selectedTypes = $state([]);
    let userLatitude = $state(null);
    let userLongitude = $state(null);

    let isLoading = $state(false);

    $effect(() => {
        async function fetchData() {
            isLoading = true;
            const params = new URLSearchParams({ timeFilter, sortBy, sortOrder });

            if (searchQuery.trim()) params.append("searchQuery", searchQuery);
            if (selectedTypes.length > 0) params.append("typeFilter", selectedTypes.join(","));
            if (sortBy === 'distance' && userLatitude && userLongitude) {
                params.append("userLat", userLatitude);
                params.append("userLon", userLongitude);
            }

            const { result, ok } = await apiFetch(`${$BASE_URL}/api/events?${params.toString()}`);
            events = ok ? result.data : [];
            isLoading = false;
        }
        fetchData();
    });

    
</script>

<svelte:head>
    <title>EventPulse | Discover</title>
</svelte:head>

<main>
    <div class="header">
        <h1 class="title">Discover Events</h1>

        <SearchBar 
            bind:searchQuery 
        />
    </div>
    <EventFilters
        bind:sortBy
        bind:sortOrder
        bind:timeFilter
        bind:selectedTypes
        bind:userLatitude
        bind:userLongitude
    />
    <EventGrid 
        events={events} 
        isLoading={isLoading}
    />
</main>

<style>
    .header {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .title {
        color: var(--ep-text-primary);
        font-size: 2.6em;
        font-weight: 700;
        padding-bottom: 0.4rem;
        border-bottom: 4px solid var(--ep-primary);
        display: inline-block;
    }
</style>
