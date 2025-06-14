<script>
  import { navigate } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  import { eventForEditing } from "../../stores/eventStore.js";
  import { userStore } from "../../stores/userStore.js";
  import { fetchGet, fetchDelete, fetchPut } from "../../util/fetch.js";
  import { BASE_URL } from "../../stores/generalStore.js";
  import {
    formatDateTimeForInput,
    getLocalDateTimeString,
  } from "../../util/format.js"; //

  import toastr from "toastr";

  import EventLocationMapInput from "../../components/EventLocationMapInput.svelte";
  import ConfirmationModal from "../../components/ConfirmationModal.svelte";

  let { id } = $props();

  let title = $state("");
  let description = $state("");
  let dateTime = $state("");
  let isPrivate = $state(false);
  let latitude = $state(null);
  let longitude = $state(null);
  let typeId = $state(null);
  let price = $state(null)
  let acceptsOnlinePayment = $state(false);
  let acceptsVenuePayment = $state(false);

  let eventTypes = $state([]);

  let eventToEdit = $state(null);
  let isLoading = $state(true);
  let storeSubscription;

  let showConfirmationModal = $state(false);

  $effect(() => {
        if (price <= 0) {
            acceptsOnlinePayment = false;
            acceptsVenuePayment = false;
        }
    });

  function checkAuthorizationAndInitialize(loadedEvent) {
    if (!loadedEvent) {
        toastr.error("Event data is missing. Cannot proceed with editing.");
        navigate("/");
        isLoading = false;
        return false;
    }

    if (!$userStore || $userStore.id !== loadedEvent.createdById) {
        toastr.error("You are not authorized to edit this event.");
        navigate(`/events/${loadedEvent.id || id}`);
        isLoading = false;
        return false;
    }

    initializeFormFields(loadedEvent);
    return true;
  }

  onMount(async () => {
    storeSubscription = eventForEditing.subscribe(async (valueFromStore) => {
      isLoading = true;
      if (valueFromStore && valueFromStore.id == id) {
        eventToEdit = valueFromStore;
        if (checkAuthorizationAndInitialize(eventToEdit)) {          
            isLoading = false;
        }
      } else {
        if (id) {
          await fetchEventDetails();
        } else {
          toastr.error("No event ID provided. Cannot edit event.");
          console.warn("No valid ID prop available. Cannot fetch event details.");
          navigate("/");
          isLoading = false;
        }
      }
    })
    try {
            const result = await fetchGet($BASE_URL + '/api/events/types');
            eventTypes = result.data;
        } catch (error) {
            console.log(error);
        };
  });

  async function fetchEventDetails() {
    isLoading = true;
    try {
      const result = await fetchGet(`${$BASE_URL}/api/events/${id}`); //
      if (result && result.data) {
        eventToEdit = result.data;
        checkAuthorizationAndInitialize(eventToEdit);
      } else {
        toastr.error("Could not fetch event details to edit.");
        console.error("Failed to fetch event data:", result);
        navigate("/");
      }
    } catch (error) {
      toastr.error("Error fetching event details.");
      console.error("Error fetching event:", error);
      navigate("/");
    } finally {
      if (eventToEdit === null && isLoading) {
          isLoading = false;
      }
    }
  }

  function initializeFormFields(loadedEvent) {
    if (loadedEvent) {
      title = loadedEvent.title || "";
      description = loadedEvent.description || "";
      typeId = loadedEvent.type.id || null;
      dateTime = formatDateTimeForInput(loadedEvent.dateTime);
      isPrivate = loadedEvent.isPrivate || false;
      price = loadedEvent.price || 0;
      acceptsOnlinePayment = loadedEvent.acceptsOnlinePayment || false;
      acceptsVenuePayment = loadedEvent.acceptsVenuePayment || false;
      latitude = loadedEvent.location?.latitude ?? null;
      longitude = loadedEvent.location?.longitude ?? null;
    } else {
      title = "";
      description = "";
      typeId = null;
      dateTime = "";
      isPrivate = false;
      latitude = null;
      longitude = null;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      typeId: typeId,
      dateTime: dateTime,
      latitude: latitude,
      longitude: longitude,
      isPrivate: isPrivate,
      price: price,
      acceptsOnlinePayment: acceptsOnlinePayment,
      acceptsVenuePayment: acceptsVenuePayment,
    };

    try {
      const result = await fetchPut($BASE_URL + "/api/events/" + id, eventData);

      if (result.ok) {
        const eventId = result.data.event.id;
        toastr.success("Event saved!");

        navigate(`/events/${eventId}`);
      } else {
        toastr.error("Event could not be saved.", result.data.message);
      }
    } catch (error) {
      toastr.error("Event could not be saved.");
      console.error("Submission error:", error);
    }
  }

  function handleDeleteEvent() {
    showConfirmationModal = true;
  }

  function cancelDeletion() {
    showConfirmationModal = false;
  }

  async function confirmAndDeleteEvent() {
    showConfirmationModal = false;
    isLoading = true;
    try {
      const result = await fetchDelete(`${$BASE_URL}/api/events/${id}`); //
      if (result.ok) {
        toastr.success("Event deleted successfully.");
        eventForEditing.set(null);
        navigate("/home");
      } else {
        toastr.error(result.message || "Failed to delete event.");
      }
    } catch (error) {
      toastr.error("An error occurred while deleting the event.");
      console.error("Error deleting event:", error);
    } finally {
      isLoading = false;
    }
  }

  onDestroy(() => {
    if (storeSubscription) {
      storeSubscription();
    }
    eventForEditing.set(null);
  });
</script>

<svelte:head>
  <title>EventPulse | Edit: {title || "Event"}</title>
</svelte:head>

{#if isLoading}
  <p class="loading-message">Loading event data...</p>
{:else if eventToEdit}
  <main>
    <div class="edit-event-container">
      <h1>
        Editing Event: <span class="event-title-display"
          >{eventToEdit.title}</span
        >
      </h1>

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
            <div>
                    <label for="event-type">Type:</label>
                    <select bind:value={typeId} required>
                        <option value="" disabled>Select a type...</option>
                        {#each eventTypes as type}
                            <option value={type.id}>{type.name}</option>
                        {/each}
                    </select>
                </div>
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
            <label for="event-is-private">This is a private event</label>
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
            </fieldset>

        <fieldset>
          <legend>Location (Optional)</legend>
          <EventLocationMapInput bind:latitude bind:longitude />
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>

      <div class="delete-action-section">
        <button class="btn btn-danger" onclick={handleDeleteEvent}
          >Delete Event</button
        >
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        title="Confirm Event Deletion"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmAndDeleteEvent}
        onCancel={cancelDeletion}
      />
    </div>
  </main>
{:else}
  <p class="error-message">
    Event data could not be loaded or event not found.
  </p>
{/if}

<style>
  .edit-event-container {
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
    font-size: 1.8em;
  }
  .event-title-display {
    color: var(--ep-primary);
    font-style: italic;
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

  fieldset > div:not(.checkbox-group) {
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
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ep-primary) 20%, transparent);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
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

  .form-actions,
  .delete-action-section {
    margin-top: 20px;
  }

  .form-actions .btn-primary {
    display: block;
    width: 60%;
    height: 50px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    font-size: 1.3em;
  }

  .form-actions .btn-primary,
  .delete-action-section .btn-danger {
    display: block;
  }
  .delete-action-section .btn-danger {
    margin-top: 100px;
    width: 20%;
    margin-left: auto;
    margin-right: auto;
    background-color: var(--ep-error);
    color: var(--ep-text-on-primary);
  }
  .delete-action-section .btn-danger:hover {
    background-color: color-mix(in srgb, var(--ep-error) 85%, black);
  }

  .loading-message,
  .error-message {
    text-align: center;
    padding: 20px;
    font-size: 1.1em;
    color: var(--ep-text-secondary);
  }
</style>
