<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore";
    import { apiFetch } from "../../util/fetch";
    import { getLocalDateTimeString } from "../../util/format";
    import toastr from "toastr";

    import EventLocationMapInput from "../../components/EventLocationMapInput.svelte";

    let title = $state("");
    let description = $state("");
    let typeId = $state(null);
    let dateTime = $state(null);
    let isPrivate = $state(false);
    let price = $state(0);
    let acceptsOnlinePayment = $state(false);
    let acceptsVenuePayment = $state(false);

    let latitude = $state(null);
    let longitude = $state(null);

    let eventTypes = $state([]);

    onMount(async () => {
        const { result, error, ok } = await apiFetch(
            `${$BASE_URL}/api/events/types`,
        );

        if (ok) {
            eventTypes = result.data;
        } else {
            toastr.error("Could not load event types.");
            console.error("Failed to fetch event types:", error);
        }
    });

    $effect(() => {
        if (price <= 0) {
            acceptsOnlinePayment = false;
            acceptsVenuePayment = false;
        }
    });

    async function handleSubmit(event) {
        event.preventDefault();

        const eventData = {
            title: title.trim(),
            description: description.trim(),
            dateTime: dateTime,
            latitude: latitude,
            longitude: longitude,
            isPrivate: isPrivate,
            typeId: typeId,
            price: price,
            acceptsOnlinePayment: acceptsOnlinePayment,
            acceptsVenuePayment: acceptsVenuePayment,
        };

        const { result, ok, error } = await apiFetch(`${$BASE_URL}/api/events`, {
            method: "POST",
            body: eventData,
        });

        if (ok) {
            const eventId = result.data.event.id;
            toastr.success("Event created!");

            title = "";
            description = "";
            typeId = null;
            dateTime = null;
            latitude = null;
            longitude = null;
            isPrivate = false;

            navigate(`/events/${eventId}`);
        } else {
            console.error("Submission error:", error);
            toastr.error(
                error?.message || "An error occurred while creating the event.",
            );
        }
    }
</script>

<svelte:head>
    <title>EventPulse | Create Event</title>
</svelte:head>

<main>
    <div class="create-event-container">
        <h1>Create New Event</h1>

        <form onsubmit={handleSubmit}>
            <fieldset>
                <legend>Event Details</legend>
                <div>
                    <label for="event-title">Title:</label>
                    <input
                        type="text"
                        id="event-title"
                        bind:value={title}
                        required
                    />
                </div>
                <div>
                    <label for="event-description">Description:</label>
                    <textarea
                        id="event-description"
                        rows="6"
                        bind:value={description}
                        required
                    ></textarea>
                </div>
                <div>
                    <label for="event-type">Type:</label>
                    <select bind:value={typeId} required>
                        <option value="" disabled>Select a type...</option>
                        {#each eventTypes as type}
                            <option value={type.id}>{type.name}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label for="event-date">Date & Time:</label>
                    <input
                        type="datetime-local"
                        id="event-date"
                        min={getLocalDateTimeString()}
                        bind:value={dateTime}
                        required
                    />
                </div>
                <div class="checkbox-group">
                    <input
                        type="checkbox"
                        id="event-is-private"
                        bind:checked={isPrivate}
                    />
                    <label for="event-is-private">This is a private event</label
                    >
                </div>
            </fieldset>

            <fieldset class="form-fieldset">
                <legend>Tickets & Pricing</legend>

                <div class="field-group">
                    <div class="form-field">
                        <label for="event-price">Price</label>
                        <div class="price-input-wrapper">
                            <span class="currency-symbol">DKK</span>
                            <input
                                id="event-price"
                                type="number"
                                bind:value={price}
                                min="0"
                                step="1"
                                placeholder="0.00"
                            />
                        </div>
                        <small class="field-hint"
                            >Leave as 0 for a FREE event.</small
                        >
                        <div class="checkbox-group">
                            <div class="form-group">
                                <label>Ticket Sales Method</label>
                                <div class="checkbox-group">
                                    <div class="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="accepts-online-payment"
                                            disabled={price <= 0}
                                            bind:checked={acceptsOnlinePayment}
                                        />
                                        <label for="accepts-online-payment"
                                            >Tickets sold online</label
                                        >
                                    </div>
                                    <div class="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="accepts-venue-payment"
                                            disabled={price <= 0}
                                            bind:checked={acceptsVenuePayment}
                                        />
                                        <label for="accepts-venue-payment"
                                            >Tickets sold at venue</label
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Location (Optional)</legend>
                <EventLocationMapInput bind:latitude bind:longitude />
            </fieldset>

            <p>
                (You'll be able to invite guests once the event has been
                created)
            </p>

            <button type="submit" class="btn btn-primary">Create Event</button>
        </form>
    </div>
</main>

<style>
    .create-event-container {
        max-width: 650px;
        margin: 30px auto;
        padding: 25px;
        background-color: var(--ep-background-dark);
        border-radius: 8px;
    }

    h1 {
        text-align: center;
        color: var(--ep-text-primary);
        margin-bottom: 25px;
    }

    fieldset {
        margin-bottom: 25px;
        padding: 15px;
        border: 1px solid var(--ep-border);
        background-color: var(--ep-background-light);
        border-radius: 6px;
    }

    legend {
        color: var(--ep-primary);
        font-weight: 600;
        padding: 0 5px;
        margin-left: 5px;
    }

    fieldset > div {
        margin-bottom: 15px;
    }
    fieldset > div:last-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        margin-bottom: 5px;
        color: var(--ep-text-primary);
        font-weight: 500;
        font-size: 0.95em;
    }

    input[type="text"],
    input[type="datetime-local"],
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
        min-height: 80px;
    }

    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    textarea:focus {
        outline: none;
        border-color: var(--ep-primary);
        box-shadow: 0 0 0 2px
            color-mix(in srgb, var(--ep-primary) 20%, transparent);
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .checkbox-group input[type="checkbox"] {
        width: auto;
        margin: 0;
    }
    .checkbox-group label {
        margin-bottom: 0;
        font-weight: normal;
        font-size: 0.9em;
        color: var(--ep-text-secondary);
    }
    form > button[type="submit"].btn-primary {
        display: block;
        width: 60%;
        height: 50px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 20px;
        font-size: 1.3em;
    }
</style>
