<script>
    import { Link } from "svelte-routing";
    import EventCard from "./EventCard.svelte";

    let { events, isLoading } = $props();
</script>

{#if isLoading}
    <p class="loading-message">Loading events...</p>
{:else if events.length > 0}
    <div class="event-list">
        {#each events as event (event.id)}
            <Link class="event-card-link" to="/events/{event.id}">
                <EventCard {event} />
            </Link>
        {/each}
    </div>
{:else}
    <p class="no-events-message">
        No events found. Try adjusting your search or filters!
    </p>
{/if}

<style>
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