<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    let { eventId, initialStatus } = $props();

    let selectedRsvpStatus = $state(initialStatus || null);

    const rsvpOptions = [
        { status: "going", label: "Going" },
        { status: "maybe", label: "Maybe" },
        { status: "not_going", label: "Not Going" },
    ];

    $effect(() => {
        selectedRsvpStatus = initialStatus || null;
    });

    async function handleStatusSelect(status, label) {
        const oldStatus = selectedRsvpStatus;
        selectedRsvpStatus = status;

        const { ok, error } = await apiFetch(
            `${$BASE_URL}/api/events/${eventId}/rsvps`,
            {
                method: "POST",
                body: { status },
            },
        );

        if (ok) {
            toastr.success(`RSVP status updated to ${label}!`);
        } else {
            selectedRsvpStatus = oldStatus;
            toastr.error(
                error?.message || "Error updating RSVP.",
                "RSVP Error",
            );
            console.error("Error updating RSVP:", error);
        }
    }    
</script>



{#if $userStore}
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
                    <ion-icon name="checkmark-circle"></ion-icon>
                {/if}
            </button>
        {/each}
    </div>
{:else}
    <p>You must <a href="/login">log in</a> to RSVP.</p>
{/if}

<style>
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
</style>