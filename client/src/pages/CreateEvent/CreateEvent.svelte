<script>
    import { fetchPost } from "../../util/fetch";
    import { BASE_URL } from "../../stores/generalStore";

    import EventLocationMapInput from "../../components/EventLocationMapInput.svelte";

    let title = "";
    let description = "";
    let dateTime = null;
    let isPrivate = false;

    let latitude = null;
    let longitude = null;

    async function handleSubmit() {
        if (!title.trim()) {
            return;
        }

        const eventData = {
            title: title.trim(),
            description: description.trim(),
            dateTime: dateTime,
            latitude: latitude,
            longitude: longitude,
            isPrivate: isPrivate
        };

        try {
            const result = await fetchPost(
                $BASE_URL + "/api/events",
                eventData,
            );
            console.log("Submission successful:", result);

            title = "";
            description = "";
            dateTime = null;
            latitude = null;
            longitude = null;
        } catch (error) {
            console.error("Submission error:", error);
        }
    }

    function getLocalDateTimeString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
</script>

<svelte:head>
    <title>EventPulse | Create Event </title>
</svelte:head>

<main>
    <div class="create-event-container">
        <h1>Create New Event</h1>

        <form on:submit|preventDefault={handleSubmit}>
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
                    ></textarea>
                </div>
                <div>
                    <label for="event-date">Date:</label>
                    <input
                        type="datetime-local"
                        min={getLocalDateTimeString()}
                        bind:value={dateTime}
                    />
                </div>
                <div>
                    <label for="event-is-private">Private event:</label>
                    <input
                        type="checkbox"
                        bind:checked={isPrivate}
                    />
                </div>
            </fieldset>

            <fieldset>
                <legend>Location (Optional)</legend>
                <EventLocationMapInput bind:latitude bind:longitude />
            </fieldset>

            <button type="submit">Create Event</button>
        </form>
    </div>
</main>

<style>
    .create-event-container {
        max-width: 600px;
        margin: 20px auto;
        padding: 15px;
        background-color: #f9f9f9;
    }
    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
    }
    fieldset {
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #e0e0e0;
        background-color: #fff;
    }
    legend {
        color: #555;
        padding-bottom: 5px;
    }

    fieldset > div {
        margin-bottom: 10px;
    }

    label {
        display: block;
        margin-bottom: 3px;
        color: #444;
    }

    input[type="text"],
    textarea {
        width: 100%;
        padding: 5px;
        border: 1px solid #e0e0e0;
        background-color: #fff;
        color: #333;
        box-sizing: border-box;
        resize: none;
    }

    button[type="submit"] {
        margin-top: 15px;
        padding: 8px 12px;
        background-color: #00adb5;
        color: white;
        border: none;
    }
</style>
