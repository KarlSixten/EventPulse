<script>
    import { fetchGet } from "../../util/fetch"; //
    import { BASE_URL } from "../../stores/generalStore"; //

    import EventCard from "../../components/EventCard.svelte";
    import { Link } from "svelte-routing";
    import toastr from "toastr";

    let events = $state([]);

    let sortBy = $state("date");
    let sortOrder = $state("ASC");
    let timeFilter = $state("upcoming");
    let userLatitude = $state(null);
    let userLongitude = $state(null);

    let isLoading = $state(false);

    let canSortByDistance = $derived(
        userLatitude != null && userLongitude != null,
    );

    $effect(() => {
        async function fetchData() {
            isLoading = true;
            let apiUrl = "";
            let shouldFetch = true;

            if (sortBy === "distance") {
                if (canSortByDistance) {
                    apiUrl = `${$BASE_URL}/api/events?timeFilter=${timeFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}&userLat=${userLatitude}&userLon=${userLongitude}`;
                } else {
                    events = [];
                    toastr.info(
                        "Please click 'Use My Location' to sort by distance.",
                        null,
                        {
                            timeOut: 10000,
                            extendedTimeOut: 10000,
                            tapToDismiss: false,
                            closeButton: true,
                        },
                    );
                    shouldFetch = false;
                }
            } else {
                apiUrl = `${$BASE_URL}/api/events?timeFilter=${timeFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            }

            if (!shouldFetch) {
                isLoading = false;
                return;
            }

            try {
                const result = await fetchGet(apiUrl);
                if (result && result.data) {
                    events = result.data;
                } else {
                    events = [];
                    toastr.error("Could not fetch events or no data returned.");
                }
            } catch (error) {
                events = [];
                toastr.error("Error fetching events.");
                console.error("Error in $effect fetch:", error);
            } finally {
                isLoading = false;
            }
        }

        fetchData();
    });

    async function requestLocationAndThenFetch() {
        if (!navigator.geolocation) {
            toastr.error("Geolocation is not supported by this browser.");
            sortBy = "date";
            return;
        }

        isLoading = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                toastr.success("Location obtained. Event list updated");
            },
            (error) => {
                console.error("Error getting user location:", error.message);
                toastr.error(`Could not get location: ${error.message}. Reverting to sort by date.`);
                userLatitude = null;
                userLongitude = null;
                sortBy = "date";
                isLoading = false;
            },
        );
    }
</script>

<svelte:head>
    <title>EventPulse | Discover</title>
</svelte:head>

<main>
    <h1>Discover Events</h1>

    <div class="sort-controls">
        <label for="sort-by">Sort by:</label>
        <select id="sort-by" bind:value={sortBy}>
            <option value="date">Date</option>
            <option value="distance">Distance</option>
            <option value="price">Price</option>
        </select>
        {#if sortBy === "distance" && (userLatitude == null || userLongitude == null)}
            <button
                class="location-button"
                onclick={requestLocationAndThenFetch}
            >
                <ion-icon name="navigate"></ion-icon>Use My Location
            </button>
        {/if}

        <label for="sort-order">Order:</label>
        <select id="sort-order" bind:value={sortOrder}>
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
        </select>

        <label for="time-filter">Show:</label>
        <select id="time-filter" bind:value={timeFilter}>
            <option value="upcoming">Upcoming events</option>
            <option value="past">Past events</option>
            <option value="all">All events</option>
        </select>
    </div>
    {#if isLoading}
        <p>Loading events...</p>
    {:else if events.length > 0}
        <div class="event-list">
            {#each events as event (event.id || JSON.stringify(event))}
                <Link class="event-card-link" to="/events/{event.id}">
                    <EventCard event={event} />
                </Link>
            {/each}
        </div>
    {:else}
        <p class="no-events-message">
            No events found. Try adjusting your sort criteria or check back
            later!
        </p>
    {/if}
</main>

<style>
    .sort-controls {
        margin-bottom: 20px;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }
    .sort-controls label {
        margin-right: 5px;
        color: var(--ep-text-secondary);
        font-size: 0.9em;
    }
    .sort-controls select,
    .sort-controls .location-button {
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid var(--ep-border);
        background-color: var(--ep-background-light);
        color: var(--ep-text-primary);
        font-size: 0.9em;
    }
    .sort-controls .location-button {
        cursor: pointer;
        transition:
            background-color 0.2s ease-in-out,
            border-color 0.2s ease-in-out;
        background-color: var(--ep-primary);
        display: inline-flex;
        align-items: center;
        gap: 6px; 
    }
    .sort-controls .location-button:hover {
        background-color: var(--ep-background-dark);
        border-color: var(--ep-secondary);
    }
    .event-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    .no-events-message {
        color: var(--ep-text-secondary);
        text-align: center;
        padding: 20px;
    }
</style>
