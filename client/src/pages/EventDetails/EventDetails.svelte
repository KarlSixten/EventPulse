<script>
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { eventForEditing } from "../../stores/eventStore.js";
    import { apiFetch } from "../../util/fetch";
    import { formatDate, formatCurrency } from "../../util/format";

    import RsvpPicker from "./RsvpPicker.svelte";
    import Map from "./Map.svelte";
    import InviteForm from "./InviteForm.svelte";
    import TicketInfo from "./TicketInfo.svelte";
    import PeopleGoing from "./PeopleGoing.svelte";

    let { id } = $props();

    let event = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    let othersGoingCount = $derived(
        (event?.attendeesCount ?? 0) -
            (event.userRsvpStatus === "going" ? 1 : 0),
    );
    let displayCount = $derived(Math.max(0, othersGoingCount));
    let othersText = $derived(displayCount === 1 ? "other" : "others");

    $effect(() => {
        if (id) {
            fetchEventDetails();
        }
    });

    async function fetchEventDetails() {
        isLoading = true;
        error = null;

        const {result, ok, error: apiError, } = await apiFetch(`${$BASE_URL}/api/events/${id}`);

        if (ok) {
            event = result.data;

        } else {
            error = apiError?.message || "Failed to load event details.";
            console.error("Error fetching event:", apiError);
        }

        isLoading = false;
    }

    function handleEditClick() {
        eventForEditing.set(event);
        navigate(`/events/${event.id}/edit`);
    }

    
</script>

<svelte:head>
    {#if isLoading}
        <title>EventPulse | Loading Event...</title>
    {:else if event}
        <title>EventPulse | {event.title}</title>
    {:else}
        <title>EventPulse | Event Not Found</title>
    {/if}
</svelte:head>

<main>
    {#if isLoading}
        <p>Loading event details...</p>
    {:else if error}
        <p style="color: red;">{error}</p>
    {:else if event}
        <h1>{event.title}</h1>
        <h2>{event.description}</h2>
        <div class="publicity-type-container">
        <h2
            class="event-publicity"
            class:public={!event.isPrivate}
            class:private={event.isPrivate}
        >
            {event.isPrivate ? "Private Event" : "Public Event"}
        </h2>
        <p class="event-type event-type-{event.type.name}">
            {event.type.name}
        </p>
        </div>
        <h3 class="event-datetime">
            <ion-icon name="calendar"></ion-icon>{formatDate(event.dateTime)}
        </h3>
        <TicketInfo event={event}></TicketInfo>

        <h3>RSVP</h3>
        <h2>{displayCount} {othersText} going</h2>
        <RsvpPicker eventId={event.id} initialStatus={event.userRsvpStatus} />
        
        <PeopleGoing attendees={event.attendees} />
        <h3>Invite Others</h3>
        <InviteForm event={event}/>
        {#if event.location}
            <Map
                latitude={event.location.latitude}
                longitude={event.location.longitude}
            ></Map>
        {/if}
        {#if $userStore && event.createdById == $userStore.id}
            <button class="btn btn-secondary" onclick={handleEditClick}
                ><ion-icon name="create-outline"></ion-icon>Edit Event</button
            >
        {/if}
    {:else}
        <p>Event not found or could not be loaded.</p>
    {/if}
</main>

<style>
    main {
        max-width: 800px;
        margin: auto;
    }

    h1 {
        color: var(--ep-primary);
        text-align: center;
    }
    h2 {
        color: var(--ep-text-secondary);
        text-align: center;
    }

    h3 {
        border-bottom: 1px solid var(--ep-border);
        padding-bottom: 0.3em;
    }

    .publicity-type-container {
        text-align: center;
    }
    
    h3.event-datetime {
        text-align: center;
        font-size: 1.2em;
        color: var(--ep-secondary);
        border-bottom: none;
        margin-bottom: 1em;
    }

    main > :global(button.btn) {
        display: block;
        margin: 20px auto;
        width: fit-content;
    }

    :global(main > .map-container-wrapper) {
        margin-top: 20px;
    }

    .event-publicity {
        display: inline-block;
        font-size: 0.85em;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 5px;
        line-height: 1.4;
        margin-top: -1em;
        margin-bottom: 1.5em;
    }

    .event-publicity.public {
        background-color: var(--ep-success);
        color: var(--ep-text-on-primary);
    }

    .event-publicity.private {
        background-color: var(--ep-secondary);
        color: var(--ep-text-on-secondary);
    }

    .event-type {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75em;
        font-weight: normal;
        border: 1px solid;
    }

    .event-type-Concert {
        background-color: #f3e8ff;
        color: #581c87;
        border-color: #d8b4fe;
    }

    .event-type-Meetup {
        background-color: #e0f2fe;
        color: #0c4a6e;
        border-color: #7dd3fc;
    }

    .event-type-Birthday {
        background-color: #fef9c3;
        color: #713f12;
        border-color: #fde047;
    }

    .event-type-Food {
        background-color: #ffe4e6;
        color: #881337;
        border-color: #fda4af;
    }

    .event-type-Workshop {
        background-color: #fefce8;
        color: #854d0e;
        border-color: #facc15;
    }

    .event-type-Workout {
        background-color: #dcfce7;
        color: #166534;
        border-color: #86efac;
    }

    .event-type-Presentation {
        background-color: #eef2ff;
        color: #312e81;
        border-color: #a5b4fc;
    }

    .event-type-Other {
        background-color: #f3f4f6;
        color: #374151;
        border-color: #d1d5db;
    }

    
</style>
