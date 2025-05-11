<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/fetch";
    import Map from "./Map.svelte";

    export let id;

    let event;
    let isLoading = true;
    let error = null;

    onMount(async () => {
        isLoading = true;
        error = null;
        try {
            const result = await fetchGet($BASE_URL + "/api/events/" + id);
            
            if (result && result.data) {
                event = result.data;
                console.log("Event fetched:", event);
            } else {
                console.error("Failed to fetch event data or data is not in expected format", result);
                error = "Event data not found.";
            }
        } catch (e) {
            console.error("Error fetching event:", e);
            error = "Failed to load event details.";
        } finally {
            isLoading = false;
        }
    });
</script>

<main>
    {#if isLoading}
        <p>Loading event details...</p>
    {:else if error}
        <p style="color: red;">{error}</p>
    {:else if event} 
        <h1>{event.title}</h1>
        <h2>{event.description}</h2>
        <h3>{event.dateTime}</h3>
        {#if location}
            <Map latitude={event.location.latitude} longitude={event.location.longitude}></Map>
        {/if}
        {:else}
        <p>Event not found or could not be loaded.</p> 
    {/if}
</main>

<style>

</style>