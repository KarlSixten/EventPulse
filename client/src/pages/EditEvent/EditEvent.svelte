<script>
  import { navigate } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  import { eventForEditing } from "../../stores/eventStore.js";
  import { fetchGet, fetchPut } from "../../util/fetch.js";
  import { BASE_URL } from "../../stores/generalStore.js";
  import {
    formatDateTimeForInput,
    getLocalDateTimeString,
  } from "../../util/format.js";

  import toastr from "toastr";

  import EventLocationMapInput from "../../components/EventLocationMapInput.svelte";

  let { id } = $props(); // param id

  let title = $state("");
  let description = $state("");
  let dateTime = $state("");
  let isPrivate = $state(false);
  let latitude = $state(null);
  let longitude = $state(null);

  let eventToEdit = $state(null);
  let isLoading = $state(true);
  let storeSubscription;

  onMount(async () => {
    storeSubscription = eventForEditing.subscribe(async (valueFromStore) => {
      if (valueFromStore && valueFromStore.id == id) {
        eventToEdit = valueFromStore;
        initializeFormFields(eventToEdit);
        isLoading = false;
      } else {
        if (id) {
          await fetchEventDetails();
          initializeFormFields(eventToEdit);
        } else {
          console.warn(
            "No valid ID prop available. Cannot fetch event details.",
          );
          isLoading = false;
        }
      }
    });
  });

  async function fetchEventDetails() {
    isLoading = true;

    try {
      const result = await fetchGet($BASE_URL + "/api/events/" + id);

      if (result && result.data) {
        eventToEdit = result.data;
      } else {
        console.error(
          "Failed to fetch event data or data is not in expected format",
          result,
        );
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      isLoading = false;
    }
  }

  function initializeFormFields(loadedEvent) {
    if (loadedEvent) {
      title = loadedEvent.title || "";
      description = loadedEvent.description || "";
      dateTime = formatDateTimeForInput(loadedEvent.dateTime);

      isPrivate = loadedEvent.isPrivate || false;

      latitude = loadedEvent.location?.latitude ?? null;
      longitude = loadedEvent.location?.longitude ?? null;
    } else {
      title = "";
      description = "";
      dateTime = "";
      isPrivate = false;
      latitude = null;
      longitude = null;
      console.log(
        "initializeFormFields: No event data provided, form reset to defaults.",
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      dateTime: dateTime,
      latitude: latitude,
      longitude: longitude,
      isPrivate: isPrivate,
    };

    try {
      const result = await fetchPut($BASE_URL + "/api/events/" + id, eventData);
      const eventId = result.data.event.id;
      toastr.success("Event saved!");

      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error("Submission error:", error);
    }
  }

  onDestroy(() => {
    if (storeSubscription) {
      storeSubscription();
    }
  });
</script>

{#if isLoading}
  <p>Loading event data...</p>
{:else if eventToEdit}
  <div class="edit-event-container">
    <h1>Editing Event: {eventToEdit.title}</h1>

    <form onsubmit={handleSubmit}>
      <fieldset>
        <legend>Event Details</legend>
        <div>
          <label for="event-title">Title:</label>
          <input type="text" id="event-title" bind:value={title} required />
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
          <label for="event-date">Date:</label>
          <input
            type="datetime-local"
            min={getLocalDateTimeString()}
            bind:value={dateTime}
            required
          />
        </div>
        <div>
          <label for="event-is-private">Private event:</label>
          <input type="checkbox" bind:checked={isPrivate} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Location (Optional)</legend>
        <EventLocationMapInput bind:latitude bind:longitude />
      </fieldset>

      <button type="submit">Save Event</button>
    </form>
  </div>
{:else}
  <p>
    Event data could not be loaded. The event might not exist or there was an
    issue.
  </p>
{/if}

<style>
  .edit-event-container {
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
