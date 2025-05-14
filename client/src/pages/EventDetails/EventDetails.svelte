<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { fetchGet, fetchPost } from "../../util/fetch";
    import { formatDate } from "../../util/format";
    import toastr from "toastr";

    import Map from "./Map.svelte";

    let { id } = $props();

    let event = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    let isLoggedIn = $derived(!!$userStore);

    let inviteeEmail = $state("");
    let inviteeMessage = $state("");

    onMount(async () => {
        isLoading = true;
        error = null;

        try {
            const result = await fetchGet($BASE_URL + "/api/events/" + id);

            if (result && result.data) {
                event = result.data;
                selectedRsvpStatus = event.userRsvpStatus;
                console.log(event);
            } else {
                console.error(
                    "Failed to fetch event data or data is not in expected format",
                    result,
                );
                error = "Event data not found.";
            }
        } catch (e) {
            console.error("Error fetching event:", e);
            error = "Failed to load event details.";
        } finally {
            isLoading = false;
        }
    });

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
            const response = await fetchPost(
                $BASE_URL + `/api/events/${event.id}/rsvps`,
                {
                    status: status,
                },
            );
            if (response.ok) {
                toastr.success(`RSVP status updated to ${label}!`);
            } else {
                selectedRsvpStatus = oldStatus;
                toastr.error("Error updating RSVP:", response.data.message);
            }
        } catch (error) {
            selectedRsvpStatus = oldStatus;
            toastr.error("Error updating RSVP: " + error.message, "RSVP Error");
            console.log("Error updating RSVP:", error);
        }
    }

    async function handleSendInvite() {
        try {
            const response = await fetchPost(
                $BASE_URL + `/api/events/${event.id}/invitations`,
                {
                    invitee_email: inviteeEmail,
                    message: inviteeMessage,
                },
            );

            if (response.ok) {
                toastr.success(response.data.message, "User invited!");
                inviteeEmail = "";
                inviteeMessage = "";
            } else {
                toastr.error(response.data.message, "Unable to invite user:");
            }
        } catch (error) {
            toastr.error("Error sending invite:", error);
            console.log("Error sending invite:", error);
        }
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
        <h3>{formatDate(event.dateTime)}</h3>
        <h3>RSVP</h3>
        {#if isLoggedIn}
            <div class="rsvp-status-picker">
                {#each rsvpOptions as option (option.status)}
                    <button
                        type="button"
                        class="rsvp-box"
                        class:selected={selectedRsvpStatus === option.status}
                        onclick={() => handleStatusSelect(option.status, option.label)}
                        role="radio"
                        aria-checked={selectedRsvpStatus === option.status}
                    >
                        <span class="label">{option.label}</span>
                        {#if selectedRsvpStatus === option.status}
                            <span class="checkmark-indicator" aria-hidden="true"
                                >✔</span
                            >
                        {/if}
                    </button>
                {/each}
            </div>
        {:else}
            <p>You must <a href="/login">log in</a> to RSVP.</p>
        {/if}
        <h3>Invite Others</h3>
        {#if isLoggedIn}
            {#if !event.isPrivate || ($userStore && event.createdById === $userStore.id)}
                <div>
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
                        class="form-button"
                        type="button"
                        onclick={handleSendInvite}
                    >
                        Send Invite
                    </button>
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
    {:else}
        <p>Event not found or could not be loaded.</p>
    {/if}
</main>

<style>
    textarea {
        resize: none;
    }
</style>
