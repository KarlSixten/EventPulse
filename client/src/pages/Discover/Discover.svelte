<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/fetch";
    import { BASE_URL } from "../../stores/generalStore";

    import EventCard from "../../components/EventCard.svelte";
    import { Link } from "svelte-routing";
    import toastr from "toastr";

    let events = [];

    let sortBy = "date";
    let sortOrder = "ASC";
    let timeFilter = "upcoming"

    let userLatitude = null;
    let userLongitude = null;

    onMount(() => {
        handleSortCriteriaChange();
    });

    async function handleSortCriteriaChange() {
        if (sortBy === "distance") {
            if (userLatitude == null || userLongitude == null) {
                await requestLocationAndThenFetch();
            } else {
                await actualFetchEvents();
            }
        } else {
            await actualFetchEvents();
        }
    }

    async function requestLocationAndThenFetch() {
        if (!navigator.geolocation) {
            console.warn(
                "Geolocation is not supported by this browser. Cannot sort by distance effectively.",
            );
            await actualFetchEvents();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;

                await actualFetchEvents();
            },
            async (error) => {
                console.error("Error getting user location:", error.message);
                userLatitude = null;
                userLongitude = null;

                await actualFetchEvents();
            },
        );
    }

    async function actualFetchEvents() {
        try {
            let apiUrl = $BASE_URL + `/api/events?timeFilter=${timeFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`;            

            if (
                sortBy === "distance" &&
                userLatitude != null &&
                userLongitude != null
            ) {
                apiUrl += `&userLat=${userLatitude}&userLon=${userLongitude}`;
            } else if (sortBy === "distance") {
                console.warn(
                    "Attempting to sort by distance, but no user location is available. API will use its default sort.",
                );
            }

            const result = await fetchGet(apiUrl);

            if (result && result.data) {
                events = result.data;
            } else {
                toastr.error("Could not fetch events.");
                console.error(
                    "Failed to fetch events or no data in response:",
                    result,
                );
                events = [];
            }
        } catch (error) {
            toastr.error("Could not fetch events.");
            console.error("Error during actualFetchEvents:", error);
            events = [];
        }
    }
</script>

<svelte:head>
    <title>EventPulse | Discover</title>
</svelte:head>

<main>
    <h1>Discover Events</h1>

    <div class="sort-controls">
        <label for="sort-by">Sort by:</label>
        <select
            id="sort-by"
            bind:value={sortBy}
            on:change={handleSortCriteriaChange}
        >
            <option value="date">Date</option>
            <option value="distance">Distance</option>
        </select>

        <label for="sort-order">Order:</label>
        <select
            id="sort-order"
            bind:value={sortOrder}
            on:change={handleSortCriteriaChange}
        >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
        </select>
        <select
            id="time-filter"
            bind:value={timeFilter}
            on:change={handleSortCriteriaChange}
        >
            <option value="past">Past events</option>
            <option value="upcoming">Upcoming events</option>
            <option value="all">All events</option>

        </select>

        {#if sortBy === "distance" && (userLatitude == null || userLongitude == null)}
            <button on:click={requestLocationAndThenFetch}>
                Use My Location for Distance Sort
            </button>
        {/if}
    </div>

    {#if events.length > 0}
        <div class="event-list">
            {#each events as event (event.id || JSON.stringify(event))}
                <Link to="/events/{event.id}">
                    <EventCard
                        title={event.title}
                        dateTime={event.date_time}
                        distanceMeters={event.distance_meters}
                    />
                </Link>
            {/each}
        </div>
    {:else}
        <p>
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
    }
    .sort-controls label {
        margin-right: 5px;
    }
    .sort-controls select,
    .sort-controls button {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
    .event-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
</style>
