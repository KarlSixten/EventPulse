<script>
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { eventForEditing } from "../../stores/eventStore.js";
    import { fetchGet, fetchPost } from "../../util/fetch";
    import { formatDate, formatCurrency } from "../../util/format";
    import toastr from "toastr";

    import Map from "./Map.svelte";

    let { id } = $props();

    let event = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    let isLoggedIn = $derived(!!$userStore);

    let inviteeEmail = $state("");
    let inviteeMessage = $state("");

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

        try {
            const result = await fetchGet($BASE_URL + "/api/events/" + id);

            if (result && result.data) {
                event = result.data;
                selectedRsvpStatus = event.userRsvpStatus;
            } else {
                console.error(
                    "Failed to fetch event data or data is not in expected format",
                    result,
                );
                error = "Event data not found.";
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            error = "Failed to load event details.";
        } finally {
            isLoading = false;
        }
    }

    let selectedRsvpStatus = $state(null);

    const rsvpOptions = [
        { status: "going", label: "Going" },
        { status: "maybe", label: "Maybe" },
        { status: "not_going", label: "Not Going" },
    ];

    async function handleStatusSelect(status, label) {
        const oldStatus = selectedRsvpStatus;
        selectedRsvpStatus = status;

        try {
            const result = await fetchPost(
                $BASE_URL + `/api/events/${event.id}/rsvps`,
                {
                    status: status,
                },
            );
            if (result.ok) {
                toastr.success(`RSVP status updated to ${label}!`);
            } else {
                selectedRsvpStatus = oldStatus;
                toastr.error("Error updating RSVP:", result.data.message);
            }
        } catch (error) {
            selectedRsvpStatus = oldStatus;
            toastr.error("Error updating RSVP: " + error.message, "RSVP Error");
            console.log("Error updating RSVP:", error);
        }
    }

    async function handleSendInvite() {
        try {
            const result = await fetchPost(
                $BASE_URL + `/api/events/${event.id}/invitations`,
                {
                    invitee_email: inviteeEmail,
                    message: inviteeMessage,
                },
            );

            if (result.ok) {
                toastr.success(result.data.message, "User invited!");
                inviteeEmail = "";
                inviteeMessage = "";
            } else {
                toastr.error(result.data.message, "Unable to invite user:");
            }
        } catch (error) {
            toastr.error("Error sending invite:", error);
            console.log("Error sending invite:", error);
        }
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
        <p class="event-price">{formatCurrency(event.price)}</p>
        <h3 class="event-datetime">
            <ion-icon name="calendar"></ion-icon>{formatDate(event.dateTime)}
        </h3>
        <h3>RSVP</h3>
        <h4>{displayCount} {othersText} going</h4>
        {#if isLoggedIn}
            <div class="rsvp-status-picker">
                {#each rsvpOptions as option (option.status)}
                    <button
                        type="button"
                        class="rsvp-box"
                        class:selected={selectedRsvpStatus === option.status}
                        onclick={() =>
                            handleStatusSelect(option.status, option.label)}
                        role="radio"
                        aria-checked={selectedRsvpStatus === option.status}
                    >
                        <span class="label">{option.label}</span>
                        {#if selectedRsvpStatus === option.status}
                            <ion-icon name="checkmark-circle"></ion-icon>
                        {/if}
                    </button>
                {/each}
            </div>
        {:else}
            <p>You must <a href="/login">log in</a> to RSVP.</p>
        {/if}
        {#if event.attendees && event.attendees.length > 0}
            <h3>People going:</h3>
            <ul class="attendee-list">
                {#each event.attendees as attendee}
                    <li class="attendee-item">
                        <ion-icon name="person-circle-outline"></ion-icon>
                        {attendee.firstName}
                        {attendee.lastName}
                        {#if attendee.userId == $userStore.id}
                            (You)
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
        <h3>Invite Others</h3>
        {#if isLoggedIn}
            {#if !event.isPrivate || ($userStore && event.createdById === $userStore.id)}
                <div class="invite-form">
                    <input
                        type="email"
                        placeholder="Email to invite"
                        bind:value={inviteeEmail}
                        required
                    />
                    <textarea
                        placeholder="Message to invitee (optional)"
                        bind:value={inviteeMessage}
                    ></textarea>
                    <button
                        class="btn btn-primary"
                        type="button"
                        onclick={handleSendInvite}>Send Invite</button
                    >
                </div>
            {:else if event.isPrivate && $userStore && event.createdById !== $userStore.id}
                <p>
                    Only the event creator can invite people to private events.
                </p>
            {/if}
        {:else}
            <p>You must <a href="/login">log in</a> to send invites.</p>
        {/if}
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
        margin: 20px auto;
        padding: 20px;
        color: var(--ep-text-primary);
    }

    h1 {
        color: var(--ep-primary);
        margin-bottom: 0.5em;
        text-align: center;
    }
    h2 {
        font-size: 1.2em;
        color: var(--ep-text-secondary);
        margin-bottom: 1.5em;
        text-align: center;
        font-weight: normal;
    }

    h3 {
        font-size: 1.1em;
        color: var(--ep-text-primary);
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        border-bottom: 1px solid var(--ep-border);
        padding-bottom: 0.3em;
    }
    h3.event-datetime {
        text-align: center;
        font-size: 1.2em;
        color: var(--ep-secondary);
        border-bottom: none;
        margin-bottom: 1em;
    }

    .rsvp-status-picker {
        display: flex;
        gap: 10px;
        margin-bottom: 1em;
        justify-content: center;
    }
    .rsvp-box {
        padding: 8px 15px;
        border: 1px solid var(--ep-border);
        background-color: var(--ep-background-light);
        color: var(--ep-text-secondary);
        border-radius: 6px;
        cursor: pointer;
        transition:
            background-color 0.2s,
            color 0.2s,
            border-color 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.9em;
    }
    .rsvp-box:hover {
        border-color: var(--ep-primary);
        background-color: var(--ep-accent);
    }
    .rsvp-box.selected {
        background-color: var(--ep-primary);
        color: var(--ep-text-on-primary);
        border-color: var(--ep-primary);
        font-weight: bold;
    }
    h4 {
        text-align: center;
        font-size: 0.9em;
        color: var(--ep-text-secondary);
        margin-bottom: 1em;
        font-weight: normal;
    }
    .invite-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    input[type="email"],
    textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--ep-border);
        background-color: var(--ep-background-light);
        color: var(--ep-text-primary);
        box-sizing: border-box;
        border-radius: 4px;
        font-size: 1em;
    }
    textarea {
        resize: vertical;
        min-height: 60px;
    }
    input[type="email"]:focus,
    textarea:focus {
        outline: none;
        border-color: var(--ep-primary);
        box-shadow: 0 0 0 2px
            color-mix(in srgb, var(--ep-primary) 20%, transparent);
    }
    main > :global(button.btn) {
        display: block;
        margin: 20px auto;
        width: fit-content;
    }

    :global(main > .map-container-wrapper) {
        margin-top: 20px;
    }

    p {
        line-height: 1.6;
        color: var(--ep-text-secondary);
    }
    main > p {
        text-align: center;
        padding: 20px;
        font-size: 1.1em;
    }
    a {
        color: var(--ep-primary);
        text-decoration: underline;
    }
    a:hover {
        color: color-mix(in srgb, var(--ep-primary) 80%, black);
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
