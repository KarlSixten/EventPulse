<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/fetch";
    import { BASE_URL } from "../../stores/generalStore";

    import EventCard from "../../components/EventCard.svelte";

    let events = [];
    let isLoading = true;

    onMount(async () => {
        await fetchEvents();
    });

    async function fetchEvents() {
        console.log("fetchEvents called");
        isLoading = true;
        try {
            const result = await fetchGet($BASE_URL + "/api/events");

            if (result.data) {
                events = result.data;
                console.log("Events fetched successfully:", events);
            } else {
                console.error("Failed to fetch events:");
                events = [];
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            events = [];
        } finally {
            isLoading = false;
        }
    }
</script>

<main>
    <h1>Discover Events</h1>

    {#if isLoading}
        <div>
            <p>Loading events...</p>
            </div>
    {:else if events && events.length > 0}
        <div>
            {#each events as event (event.id || event.title)}
                <EventCard title={event.title} description={event.description}></EventCard>
            {/each}
        </div>
    {:else}
        <div>
            <p>No events found at the moment. Please check back later!</p>
        </div>
    {/if}
</main>

<style>

</style>