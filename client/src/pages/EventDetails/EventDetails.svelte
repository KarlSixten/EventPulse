<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { fetchGet, fetchPost } from "../../util/fetch";
    import Map from "./Map.svelte";

    let { id } = $props();

    let event = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    let isLoggedIn = $derived(!!$userStore);

    onMount(async () => {
        isLoading = true;
        error = null;

        try {
            const result = await fetchGet($BASE_URL + "/api/events/" + id);

            if (result && result.data) {
                event = result.data;
                console.log(event);
                selectedRsvpStatus = event.userRsvpStatus;
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

    async function handleStatusSelect(status) {
        selectedRsvpStatus = status;

        console.log("RSVP Status selected:", selectedRsvpStatus);

        try {
        await fetchPost(
            $BASE_URL + `/api/events/${event.id}/rsvps`,
            {
                status: status
            }
        );
        } catch (error) {
            console.log("Error updating RSVP:", error)
        }
    }
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
        <h3>RSVP</h3>
        {#if isLoggedIn}
            <div class="rsvp-status-picker">
                {#each rsvpOptions as option (option.status)}
                    <button
                        type="button"
                        class="rsvp-box"
                        class:selected={selectedRsvpStatus === option.status}
                        onclick={() => handleStatusSelect(option.status)}
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
        {#if location}
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
</style>
