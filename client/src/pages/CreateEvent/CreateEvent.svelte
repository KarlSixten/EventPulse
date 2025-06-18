<script>
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    import EventLocationMapInput from "../../components/EventInput/EventLocationMapInput.svelte";
    import EventTypeInput from "../../components/EventInput/EventTypeInput.svelte";
    import DateTimeInput from "../../components/EventInput/DateTimeInput.svelte";
    import PublicityInput from "../../components/EventInput/PublicityInput.svelte";
    import TitleDescriptionInput from "../../components/EventInput/TitleDescriptionInput.svelte";
    import PriceInput from "../../components/EventInput/PriceInput.svelte";
    import TicketTypeInput from "../../components/EventInput/TicketTypeInput.svelte";

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

        const { result, ok, error } = await apiFetch(
            `${$BASE_URL}/api/events`,
            {
                method: "POST",
                body: eventData,
            },
        );

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
                <TitleDescriptionInput bind:title bind:description />
                <EventTypeInput bind:typeId />
                <PublicityInput bind:isPrivate />
            </fieldset>

            <fieldset class="form-fieldset">
                <legend>Date & Time</legend>
                <DateTimeInput bind:dateTime />
            </fieldset>

            <fieldset class="form-fieldset">
                <legend>Tickets & Pricing</legend>
                <div class="field-group">
                    <div class="form-field">
                        <PriceInput bind:price />
                        <TicketTypeInput
                            bind:price
                            bind:acceptsOnlinePayment
                            bind:acceptsVenuePayment
                        />
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
        margin: auto;
        padding: 25px;
        background-color: var(--ep-background-dark);
    }

    h1 {
        text-align: center;
    }
</style>
